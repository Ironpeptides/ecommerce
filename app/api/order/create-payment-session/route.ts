import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import crypto from "crypto";

const SESSION_TTL = 60 * 30; // 30 minutes

interface CartItem {
  id: string;
  title: string;
  quantity: number;
  sale_price: number;
  selectedOptions?: Record<string, string>;
}

interface CreateSessionBody {
  cart: CartItem[];
  selectedAddressId?: string;
  coupon?: { code: string; discountAmount: number } | null;
}

interface SessionData {
  userId: string;
  cart: CartItem[];
  subtotal: number;
  shippingAddressId: string | null;
  coupon: { code: string; discountAmount: number } | null;
  orderId?: string;
  createdAt: string;
}

function cartFingerprint(cart: CartItem[]): string {
  return JSON.stringify(
    cart
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        selectedOptions: item.selectedOptions ?? {},
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let body: CreateSessionBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { cart, selectedAddressId, coupon } = body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty or invalid" },
        { status: 400 }
      );
    }

    for (const item of cart) {
      if (!item.id || !item.quantity || !item.sale_price) {
        return NextResponse.json(
          { error: `Cart item missing required fields: ${item.id ?? "unknown"}` },
          { status: 400 }
        );
      }
      if (item.quantity < 1 || item.sale_price < 0) {
        return NextResponse.json(
          { error: `Invalid quantity or price for item: ${item.id}` },
          { status: 400 }
        );
      }
    }

    const userPointerKey = `payment-session-user:${userId}`;
    const existingSessionId = await redis.get<string>(userPointerKey);

    if (existingSessionId) {
      const existingSession = await redis.get<SessionData>(
        `payment-session:${existingSessionId}`
      );

      if (existingSession) {
        if (cartFingerprint(existingSession.cart) === cartFingerprint(cart)) {
          await redis.expire(`payment-session:${existingSessionId}`, SESSION_TTL);
          await redis.expire(userPointerKey, SESSION_TTL);

          return NextResponse.json(
            { sessionId: existingSessionId },
            { status: 200 }
          );
        }

        await redis.del(`payment-session:${existingSessionId}`);
      }

      await redis.del(userPointerKey);
    }

    const productIds = cart.map((i) => i.id);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, salePrice: true, stock: true, name: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 }
      );
    }

    for (const item of cart) {
      const product = products.find((p: any) => p.id === item.id);
      if (!product) continue;

      /* if (Math.abs(Number(product.salePrice) - Number(item.sale_price)) > 0.01) {
        return NextResponse.json(
          { error: `Price mismatch for product: ${item.id}` },
          { status: 400 }
        );
      } */  // This function will be updated later,

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for: ${product.name}. Only ${product.stock} left.`,
          },
          { status: 400 }
        );
      }
    }

    const enrichedCart = cart.map((item) => {
      const product = products.find((p: any) => p.id === item.id)!;
      return {
        ...item,
        title: product.name,
        sale_price: Number(product.salePrice),
      };
    });

    const subtotal = enrichedCart.reduce(
      (sum, item) => sum + item.sale_price * item.quantity,
      0
    );

    const sessionId = crypto.randomUUID();

    const sessionPayload: SessionData = {
      userId,
      cart: enrichedCart,
      subtotal: Number(subtotal.toFixed(2)),
      shippingAddressId: selectedAddressId ?? null,
      coupon: coupon ?? null,
      createdAt: new Date().toISOString(),
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(sessionPayload)
    );

    await redis.setex(userPointerKey, SESSION_TTL, sessionId);

    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error) {
    console.error("[create-session] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // ── Parse & validate body ────────────────────────────────────────────────
    let body: { sessionId: string; orderId: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { sessionId, orderId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // ── Fetch existing session from Redis ────────────────────────────────────
    const sessionKey = `payment-session:${sessionId}`;
    // Upstash returns the object directly (no JSON.parse needed)
    const existingSession = await redis.get<SessionData>(sessionKey);

    if (!existingSession) {
      return NextResponse.json(
        { error: "Payment session not found or expired" },
        { status: 404 }
      );
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    if (existingSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Guard: don't allow overwriting an already-linked orderId ─────────────
    if (existingSession.orderId) {
      return NextResponse.json(
        { error: "Session is already linked to an order" },
        { status: 409 }
      );
    }

    // ── Verify the orderId actually exists in DB and belongs to this user ────
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId,  // ensures the order belongs to this user
      },
      select: { id: true, totalAmount: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or does not belong to this user" },
        { status: 404 }
      );
    }

    // ── Sanity check: order total must match session subtotal (after coupon) ─
    const sessionTotal = existingSession.coupon
      ? Number((existingSession.subtotal - existingSession.coupon.discountAmount).toFixed(2))
      : existingSession.subtotal;

    if (Math.abs(Number(order.totalAmount) - sessionTotal) > 0.01) {
      return NextResponse.json(
        { error: "Order total does not match payment session total" },
        { status: 400 }
      );
    }

    // ── Preserve remaining TTL so we don't accidentally extend or cut it ─────
    const remainingTTL = await redis.ttl(sessionKey);
    const ttlToUse = remainingTTL > 0 ? remainingTTL : SESSION_TTL;

    // ── Patch session with orderId ────────────────────────────────────────────
    const updatedPayload: SessionData = {
      ...existingSession,
      orderId,
    };

    await redis.setex(sessionKey, ttlToUse, JSON.stringify(updatedPayload));

    return NextResponse.json({ ok: true, sessionId, orderId }, { status: 200 });
  } catch (error) {
    console.error("[patch-session] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


