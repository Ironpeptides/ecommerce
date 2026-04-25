// app/api/webhooks/nexapay/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redis } from "@/lib/redis";
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";

const WEBHOOK_SECRET = process.env.NEXAPAY_WEBHOOK_SECRET!;

// ── HMAC Signature Verification ─────────────────────────────────────────────
function verifySignature(
  signature: string | null,
  timestamp: string | null,
  rawBody: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[nexapay-webhook] No webhook secret configured — skipping verification");
    return true;
  }
  if (!signature || !timestamp) return false;

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

function isReplayAttack(timestamp: string | null): boolean {
  if (!timestamp) return true;
  const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
  return Math.abs(Date.now() - parseInt(timestamp, 10)) > MAX_AGE_MS;
}

interface SessionData {
  userId: string;
  cart: Array<{
    id: string;
    title: string;
    quantity: number;
    sale_price: number;
  }>;
  subtotal: number;
  coupon: { code: string; discountAmount: number } | null;
  orderId?: string;
  nexaPaymentId?: string;
  nexaOrderId?: string;
  isSubscriber?: boolean;
  shippingAddressId: string | null;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nexapay-signature");
    const timestamp = req.headers.get("x-nexapay-timestamp");

    // ── Verify signature ───────────────────────────────────────────────────
    if (!verifySignature(signature, timestamp, rawBody)) {
      console.error("[nexapay-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ── Replay attack guard ────────────────────────────────────────────────
    if (isReplayAttack(timestamp)) {
      console.error("[nexapay-webhook] Webhook timestamp too old");
      return NextResponse.json({ error: "Webhook expired" }, { status: 401 });
    }

    // ── Parse payload ──────────────────────────────────────────────────────
    let payload: {
      order_id: string;
      payment_id: string;
      status: "pending" | "completed" | "failed" | "expired";
      amount?: number;
      txid?: string;
      timestamp: string;
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { order_id: nexaOrderId, payment_id: paymentId, status, amount, txid } = payload;

    if (!nexaOrderId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: order_id, status" },
        { status: 400 }
      );
    }

    // ── Idempotency: skip if already processed ─────────────────────────────
    const idempotencyKey = `nexapay-processed:${nexaOrderId}:${status}`;
    const alreadyProcessed = await redis.get(idempotencyKey);
    if (alreadyProcessed) {
      console.log(`[nexapay-webhook] Already processed ${nexaOrderId}:${status} — skipping`);
      return NextResponse.json({ received: true });
    }

    // ── Look up our internal session via reverse-lookup key ─────────────────
    const sessionId = await redis.get<string>(`nexapay-order:${nexaOrderId}`);
    if (!sessionId) {
      // Could be a test ping or an already-expired session — acknowledge safely
      console.warn(`[nexapay-webhook] No session found for nexaOrderId=${nexaOrderId}`);
      return NextResponse.json({ received: true });
    }

    const paymentSession = await redis.get<SessionData>(
      `payment-session:${sessionId}`
    );
    if (!paymentSession) {
      console.warn(`[nexapay-webhook] Session expired for sessionId=${sessionId}`);
      return NextResponse.json({ received: true });
    }

    // ── Handle payment completed ───────────────────────────────────────────
    if (status === "completed") {
      await handleCompleted({
        paymentSession,
        nexaOrderId,
        paymentId,
        amount,
        txid,
        sessionId,
      });

      // Mark idempotency key (24h TTL matches NexaPay session lifetime)
      await redis.setex(idempotencyKey, 60 * 60 * 24, "1");
    }

    // ── Handle expired session ─────────────────────────────────────────────
    if (status === "expired") {
      await handleExpired({ paymentSession, nexaOrderId, sessionId });
      await redis.setex(idempotencyKey, 60 * 60 * 24, "1");
    }

    // pending and failed: acknowledge but take no DB action
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[nexapay-webhook] Unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Completed handler ────────────────────────────────────────────────────────
async function handleCompleted({
  paymentSession,
  nexaOrderId,
  paymentId,
  amount,
  txid,
  sessionId,
}: {
  paymentSession: SessionData;
  nexaOrderId: string;
  paymentId: string;
  amount?: number;
  txid?: string;
  sessionId: string;
}) {
  const { userId, orderId, coupon } = paymentSession;

  if (!orderId) {
    console.error(
      `[nexapay-webhook] completed event received but no orderId in session — nexaOrderId=${nexaOrderId}`
    );
    return;
  }

  await db.$transaction(async (tx) => {
    // 1. Fetch the order
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Guard: don't double-process
    if (existingOrder.paymentStatus === "PAID") {
      console.log(`[nexapay-webhook] Order ${orderId} already marked PAID — skipping`);
      return;
    }

    // 2. Update order to PAID
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "nexapay",
        // Store NexaPay's order_id as the transaction reference
        paymentIntentId: nexaOrderId,
        buyerPaidAt: new Date(),
        orderStatus: "CONFIRMED",
        ...(amount ? { totalAmount: amount } : {}),
      },
    });

    // 3. Clear buyer's cart
    await tx.cart.deleteMany({ where: { userId } });

    // 4. Create Payment audit record
    await tx.payment.create({
      data: {
        orderId: updatedOrder.id,
        method: "nexapay",
        amount: amount ?? Number(updatedOrder.totalAmount),
        status: "PAID",
        transactionId: txid ?? nexaOrderId,
        currency: "USD",
        paidAt: new Date(),
      },
    });

    // 5. Order status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        status: "CONFIRMED",
        note: txid
          ? `Payment completed via NexaPay. On-chain txid: ${txid}`
          : "Payment completed via NexaPay (card → crypto settlement)",
        changedBy: userId,
      },
    });

    // 6. Fetch buyer and admins for confirmation emails
    const buyer = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    const admins = await tx.user.findMany({
      where: { roles: { some: { roleName: "admin" } } },
      select: { email: true },
    });
    const adminEmails = admins.map((a) => a.email);

    if (buyer && adminEmails.length > 0) {
      await sendOrderConfirmationEmails({
        buyerEmail: buyer.email,
        buyerName: buyer.firstName || "Customer",
        adminEmails,
        orderNumber: updatedOrder.orderNumber,
        totalAmount: updatedOrder.totalAmount,
        items: existingOrder.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    }
  });

  // Clean up Redis keys now that the session is fulfilled
  await redis.del(`payment-session:${sessionId}`);
  await redis.del(`nexapay-order:${nexaOrderId}`);
  await redis.del(`payment-session-user:${paymentSession.userId}`);
}

// ── Expired handler ──────────────────────────────────────────────────────────
async function handleExpired({
  paymentSession,
  nexaOrderId,
  sessionId,
}: {
  paymentSession: SessionData;
  nexaOrderId: string;
  sessionId: string;
}) {
  const { orderId, userId } = paymentSession;

  if (orderId) {
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (order && order.paymentStatus !== "PAID") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "FAILED",
            orderStatus: "CANCELLED",
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status: "CANCELLED",
            note: `NexaPay payment session expired (nexaOrderId: ${nexaOrderId})`,
            changedBy: userId,
          },
        });
      });

      console.log(
        `[nexapay-webhook] Order ${orderId} cancelled due to expired NexaPay session`
      );
    }
  }

  // Clean up Redis
  await redis.del(`payment-session:${sessionId}`);
  await redis.del(`nexapay-order:${nexaOrderId}`);
  await redis.del(`payment-session-user:${userId}`);
}