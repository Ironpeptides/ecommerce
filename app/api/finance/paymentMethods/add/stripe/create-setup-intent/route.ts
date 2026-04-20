// app/api/stripe/create-setup-intent/route.js
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';

import "dotenv/config";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(request: NextRequest) {
  const { customerId } = await request.json();

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    // 'off_session' means you plan to charge them when 
    // they aren't actively using your website/app.
    usage: 'off_session', 
  });

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
  });
}