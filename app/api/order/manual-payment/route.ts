// app/api/order/manual-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { Resend } from "resend";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId, paymentMethod, sessionData, couponCode, isSubscriber, notes, orderId } = await req.json();

    const order = await db.$transaction(async (tx) => {
      // Check if order already exists
      let existingOrder = null;
      if (orderId) {
        existingOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        });
      }

      // If no orderId provided, check for recent pending order from this user
      if (!existingOrder) {
        existingOrder = await tx.order.findFirst({
          where: {
            userId,
            paymentStatus: "PENDING_APPROVAL",
            orderStatus: "PENDING",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        });
      }

      // 1. Fetch "Source of Truth" data for all products in cart
      const productIds = sessionData.map((item: any) => item.id);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true }
      });

      // 2. Fetch Constants (You can pull these from DB or Env)
      const salesTaxRate = 0.1; // 10%
      const shippingCost = 15;
      const freeShippingMin = 200;
      const subDiscount = 0.15; // 15%
      const cryptoDiscount = 0.05; // 5% for paying manual crypto

      // 3. Calculate rawSubtotal from DB prices
      let rawSubtotal = 0;
      const orderItemsData = sessionData.map((item: any) => {
        const dbProduct = dbProducts.find(p => p.id === item.id);
        const dbVariant = dbProduct?.variants.find(v => v.id === item.selectedVariant?.id);
        
        const unitPrice = dbVariant?.price ?? dbProduct?.salePrice ?? 0;
        rawSubtotal += unitPrice * item.quantity;

        return {
          productId: item.id,
          productName: dbProduct?.name || "Unknown Product",
          variantInfo: dbVariant ? JSON.stringify({ id: dbVariant.id, name: dbVariant.name }) : null,
          quantity: item.quantity,
          price: unitPrice,
          subTotal: unitPrice * item.quantity
        };
      });

      // 4. Apply the Calculation logic
      const coupon = couponCode ? await tx.coupon.findUnique({ where: { code: couponCode } }) : null;
      const couponDiscount = coupon?.discountValue ?? 0;
      
      const afterCoupon = Math.max(0, rawSubtotal - couponDiscount);
      const subDiscountAmt = isSubscriber ? afterCoupon * subDiscount : 0;
      const afterSub = afterCoupon - subDiscountAmt;
      
      // Only apply crypto discount if they are actually paying with crypto
      const isCrypto = paymentMethod.toLowerCase().includes("crypto");
      const cryptoDiscountAmt = isCrypto ? afterSub * cryptoDiscount : 0;
      const afterPaymentAdj = afterSub - cryptoDiscountAmt;
      
      const shipping = afterPaymentAdj >= freeShippingMin ? 0 : shippingCost;
      const tax = afterPaymentAdj * salesTaxRate;
      const grandTotal = afterPaymentAdj + shipping + tax;

      let finalOrder;
      
      if (existingOrder) {
        // Update existing order
        finalOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            subtotal: rawSubtotal,
            taxAmount: tax,
            shippingFee: shipping,
            discountAmount: couponDiscount + subDiscountAmt + cryptoDiscountAmt,
            totalAmount: grandTotal,
            paymentMethod,
            notes: notes || existingOrder.notes,
            // Delete old items and create new ones
            items: {
              deleteMany: {},
              create: orderItemsData
            }
          },
          include: { items: true }
        });
        
        console.log(`Updated existing order: ${finalOrder.id}`);
      } else {
        // Create new order
        finalOrder = await tx.order.create({
          data: {
            userId,
            orderNumber: `ORD-MANUAL-${Date.now().toString().slice(-6)}`,
            subtotal: rawSubtotal,
            taxAmount: tax,
            shippingFee: shipping,
            discountAmount: couponDiscount + subDiscountAmt + cryptoDiscountAmt,
            totalAmount: grandTotal,
            paymentStatus: "PENDING_APPROVAL",
            orderStatus: "PENDING",
            paymentMethod,
            notes,
            items: { create: orderItemsData },
          },
          include: { items: true }
        });
        
        console.log(`Created new order: ${finalOrder.id}`);
      }

      // Get buyer and admin emails
      const buyer = await tx.user.findUnique({
        where: { id: finalOrder.userId },
        select: { email: true, firstName: true }
      });
      
      const admins = await tx.user.findMany({
        where: { roles: { some: { roleName: "admin" } } },
        select: { email: true }
      });
      const adminEmails = admins.map(a => a.email);
      
     console.log("Buyer:", buyer, "Admins:", adminEmails, "Order Number:", finalOrder.orderNumber);
      
      
      if ( buyer && adminEmails.length > 0) {
     
        await sendOrderConfirmationEmails({
          buyerEmail: buyer.email,
          buyerName: buyer.firstName || "Customer",
          adminEmails: adminEmails,
          orderNumber: finalOrder.orderNumber,
          totalAmount: finalOrder.totalAmount,
          items: orderItemsData.map((item: any) => {
            const variantObj = item.variantInfo ? JSON.parse(item.variantInfo) : null;
            const displayName = variantObj 
              ? `${item.productName} (${variantObj.name})` 
              : item.productName;
            return {
              name: displayName,
              quantity: item.quantity,
              price: item.price
            };
          })
        });
      }

      return finalOrder;
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      isUpdate: true, // You can use this to handle UI differently if needed
      orderNumber: order.orderNumber
    });
    
  } catch (error: any) {
    console.log("Manual payment order creation/update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}