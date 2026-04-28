"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";

const PRICE_ID = process.env.STRIPE_PRICE_ID!;

// ── Get or create Stripe customer ─────────────────────────────────────────────
async function getOrCreateStripeCustomer(userId: string, email: string, name: string) {
  const existing = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({ email, name, metadata: { userId } });

  await db.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ── Create SetupIntent (to collect card without charging) ─────────────────────
export async function createSetupIntent() {
  const user = await getAuthenticatedUser();

  if (!user.email || !user.name) {
    throw new Error('User email and name are required');
  }

  const customerId = await getOrCreateStripeCustomer(
    user.id, user.email, user.name
  );

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
  });

  return { clientSecret: setupIntent.client_secret, customerId };
}

// ── Subscribe — attach payment method + create subscription ───────────────────
export async function createSubscription(paymentMethodId: string) {
  const user = await getAuthenticatedUser();
  if (!user.email || !user.name) {
    throw new Error('User email and name are required');
  }

  const customerId = await getOrCreateStripeCustomer(
    user.id, user.email, user.name
  );

  // Attach the payment method to the customer
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: PRICE_ID }],
    default_payment_method: paymentMethodId,
    expand: ["latest_invoice.payment_intent", "default_payment_method"],
  });

  // Get payment method details for display
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card = pm.card;

  // ✅ Updated: use items.data[0] for period dates
  const periodStart = subscription.items.data[0].current_period_start;
  const periodEnd   = subscription.items.data[0].current_period_end;

  // Persist to DB
  await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId:               user.id,
      stripeCustomerId:     customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId:        PRICE_ID,
      status:               mapStripeStatus(subscription.status),
      plan:                 "Pro",
      amount:               39,
      currency:             "usd",
      interval:             "month",
      paymentMethodBrand:   card?.brand    ?? null,
      paymentMethodLast4:   card?.last4    ?? null,
      paymentMethod:        card ? `${card.brand} •••• ${card.last4}` : null,
      startDate:            new Date(periodStart * 1000),
      renewalDate:          new Date(periodEnd   * 1000),
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId:        PRICE_ID,
      status:               mapStripeStatus(subscription.status),
      paymentMethodBrand:   card?.brand    ?? null,
      paymentMethodLast4:   card?.last4    ?? null,
      paymentMethod:        card ? `${card.brand} •••• ${card.last4}` : null,
      startDate:            new Date(periodStart * 1000),
      renewalDate:          new Date(periodEnd   * 1000),
      cancelledAt:          null,
    },
  });

  // Sync user-level status
  await db.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "active" },
  });

  revalidatePath("/dashboard/billing");
  return { success: true, status: subscription.status };
}

// ── Cancel — at period end ────────────────────────────────────────────────────
export async function cancelSubscription() {
  const user = await getAuthenticatedUser();

  if (!user.email || !user.name) {
    throw new Error('User email and name are required');
  }

  const sub = await db.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeSubscriptionId) {
    return { success: false, error: "No active subscription found" };
  }

  // Cancel at period end — user keeps access until renewalDate
  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  // ✅ Updated: access items.data[0] for the new end date
  const renewalTimestamp = updated.items.data[0]?.current_period_end ?? 0;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status:      "CANCELLED",
      cancelledAt: new Date(),
      renewalDate: new Date(renewalTimestamp * 1000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "cancelled" },
  });

  revalidatePath("/dashboard/billing");
  return { success: true };
}

// ── Resume — undo cancel_at_period_end ────────────────────────────────────────
export async function resumeSubscription() {
  const user = await getAuthenticatedUser();

  const sub = await db.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeSubscriptionId) {
    return { success: false, error: "No subscription found" };
  }

  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // ✅ Updated: access items.data[0] for the period end
  const renewalTimestamp = updated.items.data[0]?.current_period_end ?? 0;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status:      "ACTIVE",
      cancelledAt: null,
      renewalDate: new Date(renewalTimestamp * 1000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "active" },
  });

  revalidatePath("/dashboard/billing");
  return { success: true };
}

// ── Fetch current subscription for the UI ─────────────────────────────────────
export async function getSubscription() {
  const user = await getAuthenticatedUser();
  return db.subscription.findUnique({ where: { userId: user.id } });
}

// ── Map Stripe status → your enum ────────────────────────────────────────────
function mapStripeStatus(status: string): "ACTIVE" | "INACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" {
  const map: Record<string, "ACTIVE" | "INACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING"> = {
    active:            "ACTIVE",
    trialing:          "TRIALING",
    past_due:          "PAST_DUE",
    canceled:          "CANCELLED",
    incomplete:        "INACTIVE",
    incomplete_expired:"INACTIVE",
    unpaid:            "PAST_DUE",
    paused:            "INACTIVE",
  };
  return map[status] ?? "INACTIVE";
}