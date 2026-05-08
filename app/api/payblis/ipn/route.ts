// app/api/payblis/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { verifyIpnSignature } from "@/lib/payblis";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 2. Verify signature
  const headerSignature = req.headers.get("x-payblis-signature") ?? "";
  if (!headerSignature) {
    console.warn("[payblis/ipn] Missing signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const { signature: _sig, ...payloadWithoutSig } = payload;
  if (!verifyIpnSignature(JSON.stringify(payloadWithoutSig), headerSignature)) {
    console.warn("[payblis/ipn] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, merchant_reference, transaction_id, amount, status } = payload;
  console.info(`[payblis/ipn] ${event} | ref: ${merchant_reference} | status: ${status}`);

  // 3. Find order
  const order = await db.order.findFirst({
    where: { orderNumber: merchant_reference },
    include: {
      user:  { select: { email: true, firstName: true } },
      items: true,
    },
  });

  if (!order) {
    console.error(`[payblis/ipn] Order not found: ${merchant_reference}`);
    return NextResponse.json({ received: true, warning: "Order not found" });
  }

  // 4. Idempotency check
  const duplicate = await db.payment.findFirst({
    where: { transactionId: transaction_id },
  });
  if (duplicate) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 5. payment.success
  if (event === "payment.success" && status === "SUCCESS") {
    await db.$transaction(async (tx) => {

      // 5a. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus:   "PAID",
          orderStatus:     "CONFIRMED",
          paymentIntentId: transaction_id,
          buyerPaidAt:     new Date(),
        },
      });

      // 5b. Record payment
      await tx.payment.create({
        data: {
          orderId:       order.id,
          transactionId: transaction_id,
          amount:        parseFloat(amount),
          currency:      "USD",
          status:        "PAID",
          method:        "payblis",
          paidAt:        new Date(),
          approvedAt:    new Date(),
        },
      });

      // 5c. Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId:   order.id,
          status:    "CONFIRMED",
          note:      `Payment confirmed via Payblis. TX: ${transaction_id}`,
          changedBy: "payblis_ipn",
        },
      });

      // 5d. Deduct stock for each order item ──────────────────────────────────
      for (const item of order.items) {
        // Parse variant info to check if item has a variant
        let variantId: string | null = null;
        if (item.variantInfo) {
          try {
            const parsed = JSON.parse(item.variantInfo);
            variantId = parsed?.id ?? null;
          } catch { /* ignore malformed variantInfo */ }
        }

        if (variantId) {
          // Deduct from variant stock
          await tx.productVariant.update({
            where: { id: variantId },
            data:  { stock: { decrement: item.quantity } },
          });
        }

        // Always deduct from the parent product stock too
        // (covers both variant and non-variant products)
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        });

        console.info(
          `[payblis/ipn] Stock decremented — product: ${item.productId}` +
          (variantId ? ` | variant: ${variantId}` : "") +
          ` | qty: ${item.quantity}`
        );
      }
    });

    // 5e. Send confirmation emails (outside transaction — non-blocking)
    try {
      const admins = await db.user.findMany({
        where:  { roles: { some: { roleName: "admin" } } },
        select: { email: true },
      });
      await sendOrderConfirmationEmails({
        buyerEmail:  order.user.email,
        buyerName:   order.user.firstName ?? "Customer",
        adminEmails: admins.map((a) => a.email),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items:       order.items.map((i) => ({
          name:     i.productName,
          quantity: i.quantity,
          price:    i.price,
        })),
      });
    } catch (e) {
      console.error("[payblis/ipn] Email error:", e);
    }

    return NextResponse.json({ received: true, status: "confirmed" });
  }

  // 6. payment.failed
  if (event === "payment.failed" || status === "FAILED") {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data:  { paymentStatus: "FAILED", orderStatus: "PENDING" },
      });

      await tx.payment.create({
        data: {
          orderId:       order.id,
          transactionId: transaction_id,
          amount:        parseFloat(amount),
          currency:      "USD",
          status:        "FAILED",
          method:        "payblis",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId:   order.id,
          status:    "PENDING",
          note:      `Payment failed via Payblis. TX: ${transaction_id}`,
          changedBy: "payblis_ipn",
        },
      });
    }, {
  timeout: 30000,        // 30 seconds max
  maxWait: 5000,         // wait up to 5s to acquire connection
});

    return NextResponse.json({ received: true, status: "failed" });
  }

  return NextResponse.json({ received: true, skipped: true });
}