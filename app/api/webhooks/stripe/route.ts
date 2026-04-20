// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../order/create-payment-intent/route"; 
import { db } from "@/prisma/db";

export async function POST(req: NextRequest) {
  try {
    const stripeSignature = req.headers.get("stripe-signature");
    if (!stripeSignature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    // ─── Handle successful payment ─────────────────────────────────────
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const {
        orderId,
        orderNumber,
        userId,
        subtotal,
        shippingFee,
        taxAmount,
        discountAmount,
        couponCode,
        notes,
      } = paymentIntent.metadata;

      

      // FIX: validate userId (always required) and at least one order identifier
      if (!userId) {
        console.error("Missing required metadata: userId");
        return NextResponse.json({ error: "Missing required metadata: userId" }, { status: 400 });
      }

      if (!orderId && !orderNumber) {
        console.error("Missing required metadata: orderId or orderNumber");
        return NextResponse.json(
          { error: "Missing required metadata: orderId or orderNumber" },
          { status: 400 }
        );
      }

      // Use a transaction to keep everything atomic
      await db.$transaction(async (tx) => {
        // 1. Find the existing order — try orderId first, fall back to orderNumber
        const existingOrder = await (async () => {
          if (orderId) {
            return tx.order.findUnique({
              where: { id: orderId },
              include: { items: true },
            });
          }
          return tx.order.findUnique({
            where: { orderNumber },
            include: { items: true },
          });
        })();

        if (!existingOrder) {
          const identifier = orderId ? `id=${orderId}` : `orderNumber=${orderNumber}`;
          console.error(`Order not found: ${identifier}`);
          throw new Error("Order not found");
        }

        // 2. Update the main Order
        const updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "stripe",
            paymentIntentId: paymentIntent.id,
            buyerPaidAt: new Date(),
            orderStatus: "CONFIRMED",           
            subtotal: parseFloat(subtotal || "0"),
            shippingFee: shippingFee ? parseFloat(shippingFee) : existingOrder.shippingFee,
            taxAmount: taxAmount ? parseFloat(taxAmount) : existingOrder.taxAmount,
            discountAmount: discountAmount ? parseFloat(discountAmount) : existingOrder.discountAmount,
            totalAmount: paymentIntent.amount / 100, // Stripe sends amount in cents
            couponCode: couponCode || null,
            notes: notes || existingOrder.notes,
          },
        });

        // 3. Create Payment record for audit
        await tx.payment.create({
          data: {
            orderId: updatedOrder.id,
            method: "stripe",
            amount: paymentIntent.amount / 100,
            status: "PAID",
            transactionId: paymentIntent.id,
            currency: paymentIntent.currency.toUpperCase(),
            paidAt: new Date(),
          },
        });

        // 4. Add to status history
        await tx.orderStatusHistory.create({
          data: {
            orderId: updatedOrder.id,
            status: "CONFIRMED",
            note: "Payment succeeded via Stripe",
            changedBy: userId,
          },
        });

        // 5. Clear the user's cart
        await tx.cart.deleteMany({
          where: { userId },
        });

        console.log(`Order ${updatedOrder.orderNumber} payment confirmed successfully`);
      });
    }

    // ─── Handle failed payment ─────────────────────────────────────────────
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId, orderNumber } = paymentIntent.metadata;

      // FIX: resolve the order by id first, then fall back to orderNumber
      const failedOrder = orderId
        ? await db.order.findUnique({ where: { id: orderId } })
        : orderNumber
          ? await db.order.findUnique({ where: { orderNumber } })
          : null;

      if (failedOrder) {
        await db.order.update({
          where: { id: failedOrder.id },
          data: {
            paymentStatus: "FAILED",
            orderStatus: "CANCELLED",
          },
        });

        await db.orderStatusHistory.create({
          data: {
            orderId: failedOrder.id,
            status: "CANCELLED",
            note: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
          },
        });

        console.error(`Payment failed for order ${failedOrder.orderNumber}`);
      } else {
        console.error(
          `Payment failed but order not found — orderId=${orderId}, orderNumber=${orderNumber}`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}