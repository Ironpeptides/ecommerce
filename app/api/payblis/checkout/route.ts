// app/api/payblis/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { buildCheckoutUrl } from "@/lib/payblis";
import { getVialDiscountTier} from "@/lib/pricing";

// ─────────────────────────────────────────────────────────────────────────────
// Vial quantity discount tiers
// Applied AFTER coupon and subscriber discounts, BEFORE tax/shipping
// ─────────────────────────────────────────────────────────────────────────────




export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      currency = "USD",
      country  = "US",
      method   = "credit_cards",
      isSubscriber,
      couponCode,
      sessionData, // cart items from client — used only for product IDs, NOT prices
    } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required field: orderId" },
        { status: 400 }
      );
    }

    // ── 1. Fetch existing order (must exist, created at cart step) ─────────────
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── 2. Fetch products from DB — source of truth for prices ────────────────
    const productIds = existingOrder.items.map((i) => i.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    // ── 3. Fetch pricing config ────────────────────────────────────────────────
    let pricingConfig = {
      salesTaxRate: 0.10,
      cryptoDiscount: 0.15,
      subDiscount: 0.20,
      shippingCost: 11.00,
      freeShippingMin: 200.00,
    };
    try {
      const configRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/pricing-config`
      );
      if (configRes.ok) pricingConfig = await configRes.json();
    } catch {
      // use defaults
    }

    const { salesTaxRate, subDiscount, shippingCost, freeShippingMin } = pricingConfig;

    // ── 4. Rebuild order items from DB prices (never trust frontend amounts) ───
    let rawSubtotal  = 0;
    let totalVialQty = 0;

    const orderItemsData = existingOrder.items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);

      // Parse variant info stored on the order item
      let dbVariant = null;
      if (item.variantInfo) {
        try {
          const parsed = JSON.parse(item.variantInfo);
          dbVariant = dbProduct?.variants.find((v) => v.id === parsed.id) ?? null;
        } catch { /* ignore */ }
      }

      const unitPrice = dbVariant?.price ?? dbProduct?.salePrice ?? dbProduct?.price ?? 0;
      rawSubtotal  += unitPrice * item.quantity;
      totalVialQty += item.quantity;

      return {
        productId:   item.productId,
        productName: dbProduct?.name ?? item.productName,
        variantInfo: item.variantInfo,
        quantity:    item.quantity,
        price:       unitPrice,
        subTotal:    unitPrice * item.quantity,
      };
    });

    // ── 5. Apply discount chain ────────────────────────────────────────────────

    // 5a. Coupon
    const coupon = couponCode
      ? await db.coupon.findUnique({ where: { code: couponCode } })
      : null;
    const couponDiscount = coupon?.discountValue ?? 0;
    const afterCoupon    = Math.max(0, rawSubtotal - couponDiscount);

    // 5b. Subscriber discount
    const subDiscountAmt = isSubscriber ? afterCoupon * subDiscount : 0;
    const afterSub       = afterCoupon - subDiscountAmt;

    // 5c. Vial quantity discount
    const vialTier        = getVialDiscountTier(totalVialQty);
    const vialDiscountAmt = vialTier ? afterSub * vialTier.discount : 0;
    const afterVial       = afterSub - vialDiscountAmt;

    // 5d. Shipping (based on post-discount subtotal)
    const shipping = afterVial >= freeShippingMin ? 0 : shippingCost;

    // 5e. Tax
    const tax = afterVial * salesTaxRate;

    // 5f. Grand total
    const grandTotal = afterVial + shipping + tax;

    // ── 6. Update order in DB with recalculated totals ─────────────────────────
    await db.order.update({
      where: { id: orderId },
      data: {
        subtotal:      rawSubtotal,
        taxAmount:     tax,
        shippingFee:   shipping,
        discountAmount: couponDiscount + subDiscountAmt + vialDiscountAmt,
        totalAmount:   grandTotal,
        paymentStatus: "PENDING_APPROVAL",
        paymentMethod: "payblis",
        // Update items with DB-verified prices
        items: {
          deleteMany: {},
          create: orderItemsData,
        },
      },
    });

    // ── 7. Get user IP ─────────────────────────────────────────────────────────
    const userIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // ── 8. Build Payblis checkout URL using DB-verified grand total ────────────
    const checkoutUrl = buildCheckoutUrl({
      amount:             grandTotal,           // ← always from server, never frontend
      currency,
      productName:        "Research Materials", // generic — no peptide mention
      refOrder:           existingOrder.orderNumber,
      customerEmail:      existingOrder.user.email,
      customerFirstName:  existingOrder.user.firstName ?? "Customer",
      customerLastName:   existingOrder.user.lastName  ?? ".",
      country,
      userIp,
      method,
      storeName:          process.env.NEXT_PUBLIC_STORE_NAME ?? "Store",
    });

    // ── 9. Return checkout URL + breakdown so frontend can display it ──────────
    return NextResponse.json({
      checkoutUrl,
      breakdown: {
        rawSubtotal,
        couponDiscount,
        subDiscountAmt,
        vialDiscountAmt,
        vialTier: vialTier
          ? { label: vialTier.label, discount: vialTier.discount }
          : null,
        totalVialQty,
        shipping,
        tax,
        grandTotal,
      },
    });

  } catch (error: any) {
    console.error("[payblis/checkout] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}