// app/api/order/create-nexapay-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

const NEXAPAY_API_URL = "https://nexapay.one/api/v1";
const NEXAPAY_API_KEY = process.env.NEXAPAY_API_KEY!;

interface PricingConfig {
  salesTaxRate: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface SessionData {
  userId: string;
  cart: Array<{
    id: string;
    title: string;
    quantity: number;
    sale_price: number;
    selectedOptions?: Record<string, string>;
    selectedVariant?: {
      price: number;
      value: string;
    };
  }>;
  subtotal: number;
  shippingAddressId: string | null;
  coupon: { code: string; discountAmount: number } | null;
  orderId?: string;
  createdAt: string;
}

function calculateTotal(
  session: SessionData,
  isSubscriber: boolean,
  pricing: PricingConfig
): number {
  // Recalculate subtotal from cart items to ensure correct variant pricing
  const subtotal = session.cart.reduce((sum, item) => {
    const price = item.selectedVariant?.price ?? item.sale_price ?? 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const couponDiscount = session.coupon?.discountAmount ?? 0;
  
  // Apply subscriber discount (pricing.subDiscount is already a decimal: 0.20 = 20%)
  const subDiscount = isSubscriber ? subtotal * pricing.subDiscount : 0;
  
  // NexaPay: no crypto discount applied
  const discountedSubtotal = subtotal - couponDiscount - subDiscount;
  
  // Shipping calculation
  const shipping = discountedSubtotal >= pricing.freeShippingMin ? 0 : pricing.shippingCost;
  
  // Tax calculation (pricing.salesTaxRate is already a decimal: 0.10 = 10%)
  const taxable = discountedSubtotal + shipping;
  const tax = taxable * pricing.salesTaxRate;
  
  return Number((taxable + tax).toFixed(2));
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authSession.user.id;

    // ── Parse body ──────────────────────────────────────────────────────────
    let body: { sessionId: string; orderId?: string; isSubscriber?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { sessionId, orderId, isSubscriber = false } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // ── Load payment session from Redis ─────────────────────────────────────
    const sessionKey = `payment-session:${sessionId}`;
    const paymentSession = await redis.get<SessionData>(sessionKey);

    if (!paymentSession) {
      return NextResponse.json(
        { error: "Payment session not found or expired" },
        { status: 404 }
      );
    }

    if (paymentSession.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!paymentSession.cart || paymentSession.cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Load pricing config ─────────────────────────────────────────────────
    let pricing: PricingConfig;
    try {
      const configRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/pricing-config`
      );
      pricing = configRes.ok
        ? await configRes.json()
        : {
            salesTaxRate: 0.10,
            cryptoDiscount: 0.15,
            subDiscount: 0.20,
            shippingCost: 11.00,
            freeShippingMin: 200.00,
          };
    } catch {
      pricing = {
        salesTaxRate: 0.10,
        cryptoDiscount: 0.15,
        subDiscount: 0.20,
        shippingCost: 11.00,
        freeShippingMin: 200.00,
      };
    }

    // ── Calculate total (NexaPay: no crypto discount) ───────────────────────
    const totalAmount = calculateTotal(paymentSession, isSubscriber, pricing);

    // ── Fetch buyer email for NexaPay receipt ───────────────────────────────
    const buyer = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Build order description ─────────────────────────────────────────────
    const description = paymentSession.cart
      .map((item) => `${item.title} ×${item.quantity}`)
      .join(", ");

    // ── Create NexaPay payment session ──────────────────────────────────────
    const nexaPayRes = await fetch(`${NEXAPAY_API_URL}/payments`, {
      method: "POST",
      headers: {
        "X-API-Key": NEXAPAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "USD",
        crypto: "USDC",
        description: description.length > 200
          ? description.slice(0, 197) + "…"
          : description,
        customer_email: buyer.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?sessionId=${sessionId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?sessionId=${sessionId}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nexapay`,
        ...(orderId ? { description: `orderId:${orderId} | ${description}` } : {}),
      }),
    });

    const nexaPayData = await nexaPayRes.json();

    if (!nexaPayRes.ok || !nexaPayData.payment?.checkout_url) {
      console.error("[create-nexapay-session] NexaPay error:", nexaPayData);
      return NextResponse.json(
        { error: nexaPayData.message || "Failed to create NexaPay session" },
        { status: 502 }
      );
    }

    const { id: nexaPaymentId, order_id: nexaOrderId, checkout_url } =
      nexaPayData.payment;

    // ── Store NexaPay identifiers in Redis session for webhook lookup ────────
    const remainingTTL = await redis.ttl(sessionKey);
    const ttlToUse = remainingTTL > 0 ? remainingTTL : 60 * 30;

    await redis.setex(
      sessionKey,
      ttlToUse,
      JSON.stringify({
        ...paymentSession,
        nexaPaymentId,
        nexaOrderId,
        isSubscriber,
        ...(orderId ? { orderId } : {}),
      })
    );

    // ── Reverse-lookup: nexaOrderId → sessionId (for webhook) ───────────────
    await redis.setex(
      `nexapay-order:${nexaOrderId}`,
      ttlToUse,
      sessionId
    );

    return NextResponse.json(
      { checkout_url, nexaOrderId, nexaPaymentId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[create-nexapay-session] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}