"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { SubscriptionStatus } from "./subscriptionStatus";
import { PaymentForm } from "./paymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface Props {
  user: { id: string; name: string; email: string };
  subscription: any;
}

export function BillingClient({ user, subscription }: Props) {
  const [view, setView] = useState<"status" | "subscribe">(
    subscription?.status === "ACTIVE" || subscription?.status === "TRIALING"
      ? "status"
      : "subscribe"
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-1">Billing</p>
          <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your Pro plan — $39 / month.
          </p>
        </div>

        {/* Plan highlight card */}
        <div className="relative rounded-2xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Pro Plan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-gray-400 text-sm">/ month</span>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                "Unlimited products",
                "1 free vial/month",
                "20% discount on all purchases",
                "Priority support",
                "Full access to research library",
                "API access",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        {view === "status" && subscription ? (
          <SubscriptionStatus
            subscription={subscription}
            onResubscribe={() => setView("subscribe")}
          />
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#3b82f6",
                  colorBackground: "#18181b",
                  colorText: "#f4f4f5",
                  colorDanger: "#ef4444",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  borderRadius: "12px",
                },
              },
            }}
          >
            <PaymentForm
              userId={user.id}
              onSuccess={() => setView("status")}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}