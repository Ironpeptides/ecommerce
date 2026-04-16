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

// Interface for the data stored in Redis
interface SessionData {
  userId: string;
  cart: CartItem[];
  subtotal: number;
  shippingAddressId: string | null;
  coupon: { code: string; discountAmount: number } | null;
  createdAt: string;
}

// Stable fingerprint of the cart for deduplication
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
    // ── Auth ──────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // ── Parse & validate body ─────────────────────────────────────────────────
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

    // Basic per-item validation
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

    // ── Deduplication ─────────────────────────────────────────────────────────
    const userPointerKey = `payment-session-user:${userId}`;
    // Upstash: existingSessionId will be a string or null
    const existingSessionId = await redis.get<string>(userPointerKey);

    if (existingSessionId) {
      // Upstash: existingSession will be an object (SessionData) or null
      const existingSession = await redis.get<SessionData>(
        `payment-session:${existingSessionId}`
      );

      if (existingSession) {
        // Removed JSON.parse(existingData) because Upstash already parsed it
        
        // Same cart → reuse the session
        if (cartFingerprint(existingSession.cart) === cartFingerprint(cart)) {
          // Refresh TTL
          await redis.expire(`payment-session:${existingSessionId}`, SESSION_TTL);
          await redis.expire(userPointerKey, SESSION_TTL);

          return NextResponse.json(
            { sessionId: existingSessionId },
            { status: 200 }
          );
        }

        // Cart changed → delete the stale session
        await redis.del(`payment-session:${existingSessionId}`);
      }

      await redis.del(userPointerKey);
    }

    // ── Validate products exist and prices haven't been tampered ─────────────
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
      const product = products.find((p:any) => p.id === item.id);
      if (!product) continue;

      if (Math.abs(Number(product.salePrice) - Number(item.sale_price)) > 0.01) {
        return NextResponse.json(
          { error: `Price mismatch for product: ${item.id}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for: ${product.name}. Only ${product.stock} left.`,
          },
          { status: 400 }
        );
      }
    }

    // ── Build enriched cart ──────────────────────────────────────────────────
    const enrichedCart = cart.map((item) => {
      const product = products.find((p:any) => p.id === item.id)!;
      return {
        ...item,
        title: product.name,
        sale_price: Number(product.salePrice),
      };
    });

    // ── Calculate totals ──────────────────────────────────────────────────────
    const subtotal = enrichedCart.reduce(
      (sum, item) => sum + item.sale_price * item.quantity,
      0
    );

    // ── Persist session ───────────────────────────────────────────────────────
    const sessionId = crypto.randomUUID();

    const sessionPayload: SessionData = {
      userId,
      cart: enrichedCart,
      subtotal: Number(subtotal.toFixed(2)),
      shippingAddressId: selectedAddressId ?? null,
      coupon: coupon ?? null,
      createdAt: new Date().toISOString(),
    };

    // Use setex with the object directly or stringified
    // Upstash handles both, but stringifying is standard for Redis
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