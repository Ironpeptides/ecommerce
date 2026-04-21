// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../order/create-payment-intent/route"; 
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";

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

      if (!orderId) {
        console.error("Missing required metadata: orderId");
        return NextResponse.json(
          { error: "Missing required metadata: orderId" },
          { status: 400 }
        );
      }

      // Use a transaction to keep everything atomic
      await db.$transaction(async (tx) => {
  // 1. Find Order (existing logic)
  const existingOrder = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!existingOrder) throw new Error("Order not found");

  // 2. Update Order & Status (existing logic)
  const updatedOrder = await tx.order.update({
    where: { id: existingOrder.id },
    data: {
      paymentStatus: "PAID",
      paymentMethod: "stripe",
      paymentIntentId: paymentIntent.id,
      buyerPaidAt: new Date(),
      orderStatus: "CONFIRMED",
      totalAmount: paymentIntent.amount / 100,
    },
  });

  // 3. Clear Cart
  await tx.cart.deleteMany({ where: { userId } });

  // 4. Create Audit Logs (Payment & History)
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

  await tx.orderStatusHistory.create({
    data: {
      orderId: updatedOrder.id,
      status: "CONFIRMED",
      note: "Payment succeeded via Stripe",
      changedBy: userId,
    },
  });


  // 5. Fetch Buyer and Admin
  const buyer = await tx.user.findUnique({
          where: { id: existingOrder.userId },
          select: { email: true, firstName: true }
        });
  const admins = await tx.user.findMany({
  where: { roles: { some: { roleName: "admin" } } },
  select: { email: true }
});
const adminEmails = admins.map(a => a.email);

  // 6. Send Emails
  if (buyer && adminEmails.length > 0) {
  await sendOrderConfirmationEmails({
    buyerEmail: buyer.email,
    buyerName: buyer.firstName || "Customer",
    adminEmails: adminEmails, // Passing the array here
    orderNumber: updatedOrder.orderNumber,
    totalAmount: updatedOrder.totalAmount,
    items: existingOrder.items.map(i => ({ 
      name: i.productName, 
      quantity: i.quantity, 
      price: i.price 
    }))
  });
}
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