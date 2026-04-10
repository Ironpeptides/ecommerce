// app/api/stripe/create-setup-intent/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(request:any) {
  try {
    const { name, email } = await request.json();

    // 1. Create a new Stripe Customer
    const customer = await stripe.customers.create({
      email,
      name,
    });

    // 2. Create a SetupIntent linked to the new customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session', // Essential for future off-session charges
    });

    // 3. Return the client secret and customer ID to the frontend
    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
      name: name,
      email: email
    }, { status: 200 });

  } catch (error:any) {
    console.error('Stripe API Error:', error.message);
    // Return a generic error to the client
    return NextResponse.json({ 
      error: 'Failed to create setup intent due to a server error.' 
    }, { status: 500 });
  }
}