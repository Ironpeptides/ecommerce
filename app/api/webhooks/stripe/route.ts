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

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId, userId, orderNumber, subtotal, shippingFee, taxAmount, discountAmount } = paymentIntent.metadata;

      // Validate required fields
      if (!userId || !orderNumber || !subtotal) {
        console.error("Missing required metadata fields:", { userId, orderNumber, subtotal });
        return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
      }

      // Create the order with all required fields
      const order = await db.order.create({
        data: {
          userId,
          orderNumber: orderNumber, // Use the order number from metadata or generate one
          orderStatus: "PENDING",
          paymentStatus: "PAID",
          paymentMethod: "stripe",
          paymentIntentId: paymentIntent.id,
          subtotal: parseFloat(subtotal),
          shippingFee: shippingFee ? parseFloat(shippingFee) : 0,
          taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
          discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
          totalAmount: paymentIntent.amount / 100, // Stripe amounts are in cents
          // Optional fields
          couponCode: paymentIntent.metadata.couponCode || null,
          notes: paymentIntent.metadata.notes || null,
        },
      });

      console.log(`Order ${order.orderNumber} created successfully for user ${userId}`);
      
      // Optional: Update any associated cart or temporary data here
      // await db.cart.deleteMany({ where: { userId } });
    }

    // Handle other webhook events if needed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error(`Payment failed for order ${paymentIntent.metadata.orderId}: ${paymentIntent.last_payment_error?.message}`);
      
      // You might want to update order status or log the failure
      // await db.order.update({
      //   where: { orderNumber: paymentIntent.metadata.orderNumber },
      //   data: { paymentStatus: "FAILED" }
      // });
    }

    // Stripe requires a 200 response or it will retry
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}