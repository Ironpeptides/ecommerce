// app/api/order/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/prisma/db";
import { redis } from "@/lib/redis";


interface CartItem {
  id: string;
  title: string;
  quantity: number;
  sale_price: number;
  // selectedOptions may contain variantId nested inside it
  selectedOptions?: {
    variant?: string;
    variantId?: string;
    [key: string]: string | undefined;
  };
  // Also support top-level variantId for flexibility
  variantId?: string | null;
}


interface SessionData {
  userId: string;
  cart: CartItem[];
  subtotal: number;
  shippingAddressId: string | null;
  coupon: { code: string; discountAmount: number } | null;
  orderId?: string;
  orderNumber?: string;
  createdAt: string;
}

const SESSION_TTL = 60 * 30; // 30 minutes

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

// ── Pricing — single source of truth (never sent from frontend) ───────────────
const PRICING = {
  salesTaxRate:    Number(process.env.SALES_TAX_RATE    ?? 0.10),
  creditCardFee:   Number(process.env.CREDIT_CARD_FEE   ?? 0.05),
  subDiscount:     Number(process.env.SUB_DISCOUNT       ?? 0.20),
  shippingCost:    Number(process.env.SHIPPING_COST      ?? 11.00),
  freeShippingMin: Number(process.env.FREE_SHIPPING_MIN  ?? 200.00),
};

// ── Resolve unit price for a single cart item ─────────────────────────────────
// Rule: if the item has a variantId (top-level OR nested in selectedOptions) → use variant.price
//       otherwise → use product.salePrice
// The frontend's displayed price is NEVER trusted.
async function resolveUnitPrice(item: {
  productId: string;
  variantId?: string | null;
}): Promise<number> {
  if (item.variantId) {
    const variant = await db.productVariant.findUnique({
      where:  { id: item.variantId },
      select: { price: true, productId: true },
    });

    if (!variant) {
      throw new Error(`Variant ${item.variantId} not found`);
    }
    // Guard: make sure this variant actually belongs to the declared product
    if (variant.productId !== item.productId) {
      throw new Error(
        `Variant ${item.variantId} does not belong to product ${item.productId}`
      );
    }

    return Number(variant.price);
  }

  // No variant — fall back to the product's salePrice
  const product = await db.product.findUnique({
    where:  { id: item.productId },
    select: { salePrice: true, isActive: true },
  });

  if (!product) throw new Error(`Product ${item.productId} not found`);
  if (!product.isActive) throw new Error(`Product ${item.productId} is no longer available`);

  return Number(product.salePrice);
}

// ── Server-side grand total (mirrors StripePaymentForm maths exactly) ─────────
async function computeGrandTotal({
  rawCartItems,
  couponDiscount,
  isSubscriber,
}: {
  rawCartItems: { productId: string; variantId?: string | null; quantity: number }[];
  couponDiscount: number;
  isSubscriber: boolean;
}) {
  const { salesTaxRate, creditCardFee, subDiscount, shippingCost, freeShippingMin } = PRICING;

  // Resolve every item's authoritative price from the DB in parallel
  const resolvedItems = await Promise.all(
    rawCartItems.map(async (item) => ({
      ...item,
      unitPrice: await resolveUnitPrice(item),
    }))
  );

  const rawSubtotal    = resolvedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const afterCoupon    = rawSubtotal - couponDiscount;
  const subDiscountAmt = isSubscriber ? afterCoupon * subDiscount : 0;
  const afterSub       = afterCoupon - subDiscountAmt;
  const ccFee          = afterSub * creditCardFee;
  const afterAdj       = afterSub + ccFee;
  const shipping       = afterAdj >= freeShippingMin ? 0 : shippingCost;
  const tax            = afterAdj * salesTaxRate;
  const grandTotal     = afterAdj + shipping + tax;

  return {
    grandTotal,
    breakdown: {
      rawSubtotal,
      couponDiscount,
      subDiscountAmt,
      ccFee,
      shipping,
      tax,
      grandTotal,
    },
  };
}

// ── POST /api/order/create-payment-intent ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ Only accept sessionId + isSubscriber — never an `amount`
    const { sessionId, isSubscriber = false } = body as {
      sessionId: string;
      isSubscriber?: boolean;
      orderNumber?: string;
    };

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // ── Load session from Redis ─────────────────────────────────
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get<SessionData>(sessionKey);
    
    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

   

    // Check if session expired (optional, since Redis has TTL)
    const createdAt = new Date(sessionData.createdAt);
    const expiresAt = new Date(createdAt.getTime() + SESSION_TTL * 1000);
    
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "Session has expired" }, { status: 410 });
    }
    
    if (!sessionData.cart?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Compute amount entirely on the server ─────────────────────────────────
    // Transform cart items to format expected by computeGrandTotal.
    // FIX: variantId may live at the top level OR nested inside selectedOptions,
    // depending on how the frontend built the session. Coalesce both locations.
    const rawCartItems = sessionData.cart.map((item) => ({
      productId: item.id,
      // Prefer top-level variantId; fall back to selectedOptions.variantId
      variantId: item.variantId ?? item.selectedOptions?.variantId ?? null,
      // quantity comes from the cart item, NOT from the variant object
      quantity: item.quantity,
    }));
    
    const couponDiscount = sessionData.coupon?.discountAmount ?? 0;

    const { grandTotal, breakdown } = await computeGrandTotal({
      rawCartItems,
      couponDiscount,
      isSubscriber,
    });

    const amountInCents = Math.round(grandTotal * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: "Order total is below the minimum charge amount ($0.50)." },
        { status: 400 }
      );
    }

    // ── Create or update the PaymentIntent (idempotent) ───────────────────────
    let clientSecret: string;
    let paymentIntentId: string;

    const paymentIntentKey = `payment-intent:${sessionId}`;
    const existingPaymentIntentId = await redis.get<string>(paymentIntentKey);

    if (existingPaymentIntentId) {
      // Reuse existing intent — update amount in case subscriber status changed
      const updated = await stripe.paymentIntents.update(
        existingPaymentIntentId,
        { amount: amountInCents }
      );
      clientSecret    = updated.client_secret!;
      paymentIntentId = updated.id;
    } else {
      const intent = await stripe.paymentIntents.create({
        amount:   amountInCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          sessionId,
          userId:   sessionData.userId ?? "",
          // FIX: the webhook expects both `orderId` and `orderNumber`.
          // Store whichever the session has so the webhook can find the order.
          orderId:      sessionData.orderId      ?? "",
          orderNumber:  sessionData.orderNumber  ?? "",
          // Store breakdown so the webhook never needs to recompute
          subtotal:       breakdown.rawSubtotal.toFixed(2),
          shippingFee:    breakdown.shipping.toFixed(2),
          taxAmount:      breakdown.tax.toFixed(2),
          discountAmount: (breakdown.couponDiscount + breakdown.subDiscountAmt).toFixed(2),
          couponCode:     sessionData.coupon?.code ?? "",
          isSubscriber:   String(isSubscriber),
        },
      });

      clientSecret    = intent.client_secret!;
      paymentIntentId = intent.id;

      // Store PaymentIntent ID in Redis with same TTL as session
      await redis.setex(paymentIntentKey, SESSION_TTL, paymentIntentId);
    }

    // Return the secret + breakdown — frontend displays these, never recomputes amounts
    return NextResponse.json({ clientSecret, breakdown });
  } catch (err: any) {
    console.error("[create-payment-intent] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}