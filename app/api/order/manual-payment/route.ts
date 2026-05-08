// app/api/order/manual-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";
import { getVialDiscountTier } from "@/lib/pricing";



export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      paymentMethod,
      sessionData,
      couponCode,
      isSubscriber,
      notes,
      orderId,
    } = await req.json();

    const order = await db.$transaction(async (tx) => {
      // ── Find existing order ────────────────────────────────────────────────
      let existingOrder = null;
      if (orderId) {
        existingOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
      }
      if (!existingOrder) {
        existingOrder = await tx.order.findFirst({
          where: {
            userId,
            paymentStatus: "PENDING_APPROVAL",
            orderStatus: "PENDING",
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: "desc" },
          include: { items: true },
        });
      }

      // ── Fetch DB products (source of truth for prices) ─────────────────────
      const productIds = sessionData.map((item: any) => item.id);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
      });

      // ── Fetch pricing config ───────────────────────────────────────────────
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
      } catch { /* use defaults */ }

      const {
        salesTaxRate,
        cryptoDiscount,
        subDiscount,
        shippingCost,
        freeShippingMin,
      } = pricingConfig;

      // ── Build order items from DB prices ───────────────────────────────────
      let rawSubtotal  = 0;
      let totalVialQty = 0;

      const orderItemsData = sessionData.map((item: any) => {
        const dbProduct = dbProducts.find((p) => p.id === item.id);
        const dbVariant = dbProduct?.variants.find(
          (v) => v.id === item.selectedVariant?.id
        );
        const unitPrice = dbVariant?.price ?? dbProduct?.salePrice ?? 0;
        rawSubtotal  += unitPrice * item.quantity;
        totalVialQty += item.quantity;

        return {
          productId:   item.id,
          productName: dbProduct?.name || "Unknown Product",
          variantInfo: dbVariant
            ? JSON.stringify({ id: dbVariant.id, name: dbVariant.name })
            : null,
          quantity: item.quantity,
          price:    unitPrice,
          subTotal: unitPrice * item.quantity,
        };
      });

      // ── Apply discount chain ───────────────────────────────────────────────

      // 1. Coupon
      const coupon = couponCode
        ? await tx.coupon.findUnique({ where: { code: couponCode } })
        : null;
      const couponDiscount = coupon?.discountValue ?? 0;
      const afterCoupon    = Math.max(0, rawSubtotal - couponDiscount);

      // 2. Subscriber discount
      const subDiscountAmt = isSubscriber ? afterCoupon * subDiscount : 0;
      const afterSub       = afterCoupon - subDiscountAmt;

      // 3. Crypto discount (manual_crypto only)
      const isCrypto       = paymentMethod.toLowerCase().includes("crypto");
      const cryptoDiscAmt  = isCrypto ? afterSub * cryptoDiscount : 0;
      const afterCrypto    = afterSub - cryptoDiscAmt;

      // 4. Vial quantity discount
      

      const tier = getVialDiscountTier(totalVialQty);
      const vialDiscRate = tier?.discount ?? 0;
      const vialDiscAmt = afterCrypto * vialDiscRate;
      const afterVial   = afterCrypto - vialDiscAmt;


      // 5. Shipping + tax
      const shipping = afterVial >= freeShippingMin ? 0 : shippingCost;
      const tax      = afterVial * salesTaxRate;
      const grandTotal = afterVial + shipping + tax;

      // ── Create or update order ─────────────────────────────────────────────
      let finalOrder;
      if (existingOrder) {
        finalOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal:       rawSubtotal,
            taxAmount:      tax,
            shippingFee:    shipping,
            discountAmount: couponDiscount + subDiscountAmt + cryptoDiscAmt + vialDiscAmt,
            totalAmount:    grandTotal,
            paymentMethod,
            notes: notes || existingOrder.notes,
            items: { deleteMany: {}, create: orderItemsData },
          },
          include: { items: true },
        });
        console.log(`Updated existing order: ${finalOrder.id}`);
      } else {
        finalOrder = await tx.order.create({
          data: {
            userId,
            orderNumber:    `ORD-MANUAL-${Date.now().toString().slice(-6)}`,
            subtotal:       rawSubtotal,
            taxAmount:      tax,
            shippingFee:    shipping,
            discountAmount: couponDiscount + subDiscountAmt + cryptoDiscAmt + vialDiscAmt,
            totalAmount:    grandTotal,
            paymentStatus:  "PENDING_APPROVAL",
            orderStatus:    "PENDING",
            paymentMethod,
            notes,
            items: { create: orderItemsData },
          },
          include: { items: true },
        });
        console.log(`Created new order: ${finalOrder.id}`);
      }

      // ── Send confirmation emails ───────────────────────────────────────────
      const buyer = await tx.user.findUnique({
        where: { id: finalOrder.userId },
        select: { email: true, firstName: true },
      });
      const admins = await tx.user.findMany({
        where: { roles: { some: { roleName: "admin" } } },
        select: { email: true },
      });

      if (buyer && admins.length > 0) {
        await sendOrderConfirmationEmails({
          buyerEmail:  buyer.email,
          buyerName:   buyer.firstName || "Customer",
          adminEmails: admins.map((a) => a.email),
          orderNumber: finalOrder.orderNumber,
          totalAmount: finalOrder.totalAmount,
          items: orderItemsData.map((item: any) => {
            const variantObj = item.variantInfo
              ? JSON.parse(item.variantInfo)
              : null;
            return {
              name:     variantObj
                ? `${item.productName} (${variantObj.name})`
                : item.productName,
              quantity: item.quantity,
              price:    item.price,
            };
          }),
        });
      }

      return finalOrder;
    });

    return NextResponse.json({
      success:     true,
      orderId:     order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Manual payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}