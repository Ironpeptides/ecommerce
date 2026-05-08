// app/api/order/credits-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";
import { deductStock } from "@/lib/stock";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      sessionData,
      couponCode,
      isSubscriber,
      creditsToDeduct,
      totalAmount,
      orderId,
    } = await req.json();

    if (!userId || !sessionData || creditsToDeduct == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await db.$transaction(async (tx) => {
      // 1. Verify sufficient balance atomically
      const user = await tx.user.findUnique({
        where:  { id: userId },
        select: { id: true, email: true, firstName: true, walletBalance: true },
      });

      if (!user) throw new Error("User not found");
      if (user.walletBalance < creditsToDeduct) {
        throw new Error(
          `Insufficient credits. Required: ${creditsToDeduct}, Available: ${user.walletBalance}`
        );
      }

      // 2. Fetch DB products for price verification
      const productIds = sessionData.map((item: any) => item.id);
      const dbProducts = await tx.product.findMany({
        where:   { id: { in: productIds } },
        include: { variants: true },
      });

      // 3. Fetch pricing config
      let pricingConfig = {
        salesTaxRate: 0.1, subDiscount: 0.2,
        shippingCost: 11.0, freeShippingMin: 200.0,
      };
      try {
        const configRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/pricing-config`
        );
        if (configRes.ok) pricingConfig = await configRes.json();
      } catch { /* use defaults */ }

      const { salesTaxRate, subDiscount, shippingCost, freeShippingMin } = pricingConfig;

      // 4. Build order items from DB prices
      let rawSubtotal = 0;
      const orderItemsData = sessionData.map((item: any) => {
        const dbProduct = dbProducts.find((p) => p.id === item.id);
        const dbVariant = dbProduct?.variants.find((v) => v.id === item.selectedVariant?.id);
        const unitPrice = dbVariant?.price ?? dbProduct?.salePrice ?? 0;
        rawSubtotal += unitPrice * item.quantity;
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

      // 5. Calculate totals
      const coupon = couponCode
        ? await tx.coupon.findUnique({ where: { code: couponCode } })
        : null;
      const couponDiscount = coupon?.discountValue ?? 0;
      const afterCoupon    = Math.max(0, rawSubtotal - couponDiscount);
      const subDiscountAmt = isSubscriber ? afterCoupon * subDiscount : 0;
      const afterSub       = afterCoupon - subDiscountAmt;
      const shipping       = afterSub >= freeShippingMin ? 0 : shippingCost;
      const tax            = afterSub * salesTaxRate;
      const grandTotal     = afterSub + shipping + tax;

      // 6. Create or update order
      let finalOrder;
      const existingOrder = orderId
        ? await tx.order.findUnique({ where: { id: orderId } })
        : null;

      if (existingOrder) {
        finalOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal:       rawSubtotal,
            taxAmount:      tax,
            shippingFee:    shipping,
            discountAmount: couponDiscount + subDiscountAmt,
            totalAmount:    grandTotal,
            paymentMethod:  "CREDITS",
            paymentStatus:  "PAID",
            orderStatus:    "CONFIRMED",
            buyerPaidAt:    new Date(),
            items: { deleteMany: {}, create: orderItemsData },
          },
          include: { items: true },
        });
      } else {
        finalOrder = await tx.order.create({
          data: {
            userId,
            orderNumber:    `ORD-CR-${Date.now().toString().slice(-8)}`,
            subtotal:       rawSubtotal,
            taxAmount:      tax,
            shippingFee:    shipping,
            discountAmount: couponDiscount + subDiscountAmt,
            totalAmount:    grandTotal,
            paymentMethod:  "CREDITS",
            paymentStatus:  "PAID",
            orderStatus:    "CONFIRMED",
            buyerPaidAt:    new Date(),
            items: { create: orderItemsData },
          },
          include: { items: true },
        });
      }

      // 7. Deduct wallet credits
      await tx.user.update({
        where: { id: userId },
        data:  { walletBalance: { decrement: creditsToDeduct } },
      });

      // 8. Record wallet transaction
      await tx.walletTransaction.create({
        data: {
          userId,
          amount:    creditsToDeduct,
          type:      "DEBIT",
          reason:    `Order payment — ${finalOrder.orderNumber}`,
          reference: finalOrder.id,
          orderId:   finalOrder.id,
        },
      });

      // 9. Record payment entry
      await tx.payment.create({
        data: {
          orderId:       finalOrder.id,
          amount:        grandTotal,
          currency:      "USD",
          status:        "PAID",
          method:        "CREDITS",
          transactionId: `CREDITS-${finalOrder.id}`,
          paidAt:        new Date(),
        },
      });

      // 10. Deduct stock ──────────────────────────────────────────────────────
      await deductStock(tx, finalOrder.items, "[credits-payment]");

      // 11. Send emails
      const admins = await tx.user.findMany({
        where:  { roles: { some: { roleName: "admin" } } },
        select: { email: true },
      });
      if (admins.length > 0) {
        await sendOrderConfirmationEmails({
          buyerEmail:  user.email,
          buyerName:   user.firstName || "Customer",
          adminEmails: admins.map((a) => a.email),
          orderNumber: finalOrder.orderNumber,
          totalAmount: finalOrder.totalAmount,
          items:       orderItemsData.map((item: any) => {
            const variantObj = item.variantInfo ? JSON.parse(item.variantInfo) : null;
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
    console.error("[credits-payment] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}