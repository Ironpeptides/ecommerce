import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/prisma/db";
import Stripe from "stripe";

function mapStatus(s: string): "ACTIVE" | "INACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" {
  const m: Record<string, any> = {
    active: "ACTIVE", trialing: "TRIALING", past_due: "PAST_DUE",
    canceled: "CANCELLED", incomplete: "INACTIVE", unpaid: "PAST_DUE",
  };
  return m[s] ?? "INACTIVE";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const dbSub = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!dbSub) break;

        const status = event.type === "customer.subscription.deleted"
          ? "CANCELLED"
          : mapStatus(sub.status);

    
        const periodEnd = sub.items.data[0]?.current_period_end ?? 0;

        await db.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            status,
            stripeSubscriptionId: sub.id,
            renewalDate: new Date(periodEnd * 1000),
            cancelledAt: status === "CANCELLED" ? new Date() : null,
          },
        });

        await db.user.update({
          where: { id: dbSub.userId },
          data: {
            subscriptionStatus:
              status === "ACTIVE"    ? "active"    :
              status === "CANCELLED" ? "cancelled" :
              status === "PAST_DUE"  ? "past_due"  : "inactive",
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription; 
        };

        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer!.id;

        // Safely handle subscription field (string or Subscription object)
        const subscriptionField = invoice.subscription;
        const stripeSubId = typeof subscriptionField === "string"
          ? subscriptionField
          : subscriptionField?.id;

        if (!stripeSubId) break;

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

       
        const periodEnd = stripeSub.items.data[0]?.current_period_end ?? 0;
            
        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status:      "ACTIVE",
            renewalDate: new Date(periodEnd * 1000),
            cancelledAt: null,
          },
        });

        const dbSub = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (dbSub) {
          await db.user.update({
            where: { id: dbSub.userId },
            data: { subscriptionStatus: "active" },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer!.id;

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });

        const dbSub = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (dbSub) {
          await db.user.update({
            where: { id: dbSub.userId },
            data: { subscriptionStatus: "past_due" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[STRIPE_WEBHOOK]", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}