// app/api/wallet/webhook/route.ts
//
// This endpoint receives payment confirmation from LemonSqueezy.
// LemonSqueezy calls this URL after a successful purchase.
//
// Setup in LemonSqueezy dashboard:
//   Settings → Webhooks → Add endpoint
//   URL: https://yourdomain.com/api/wallet/webhook
//   Events: order_created
//   Secret: (generate one, store in LEMONSQUEEZY_WEBHOOK_SECRET env var)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import crypto from "crypto";

// ── Verify webhook signature ──────────────────────────────────────────────────
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

  // ── Verify authenticity ──────────────────────────────────────────────────────
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("[wallet/webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload?.meta?.event_name;

  // ── Only process successful orders ───────────────────────────────────────────
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true, skipped: true });
  }

  const orderData = payload?.data?.attributes;
  const customData = payload?.meta?.custom_data;

  // Extract the custom fields we embedded at checkout creation
  const userEmail = customData?.user_email;
  const credits = parseInt(customData?.credits ?? "0", 10);
  const packId = customData?.pack_id;
  const lsOrderId = payload?.data?.id;

  if (!userEmail || !credits || credits <= 0) {
    console.error("[wallet/webhook] Missing custom_data fields", { userEmail, credits, packId });
    return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
  }

  // Guard against duplicate webhook deliveries
  const alreadyProcessed = await db.walletTransaction.findFirst({
    where: { reference: String(lsOrderId), type: "CREDIT" },
  });

  if (alreadyProcessed) {
    console.info("[wallet/webhook] Duplicate webhook, skipping:", lsOrderId);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    // ── Credit wallet atomically ─────────────────────────────────────────────
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User not found for email: ${userEmail}`);
      }

      // Increment wallet balance
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { increment: credits } },
      });

      // Record transaction
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: credits,
          type: "CREDIT",
          reason: `Credit pack purchase — ${packId ?? "unknown pack"}`,
          reference: String(lsOrderId),
        },
      });
    });

    console.info(`[wallet/webhook] Credited ${credits} credits to ${userEmail}`);
    return NextResponse.json({ received: true, credited: credits });
  } catch (error: any) {
    console.error("[wallet/webhook] Transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}