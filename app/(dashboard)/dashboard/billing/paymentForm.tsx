"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { createSetupIntent, createSubscription } from "@/actions/subscription";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Lock, CreditCard, ShieldCheck } from "lucide-react";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#f4f4f5",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: "15px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#52525b" },
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
  },
};

export function PaymentForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();

  const [loading,    setLoading]    = useState(false);
  const [cardError,  setCardError]  = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setCardError(null);

    try {
      // Step 1 — create SetupIntent on server
      const { clientSecret } = await createSetupIntent();
      if (!clientSecret) throw new Error("Failed to initialise payment");

      // Step 2 — confirm card setup in-browser (no redirect)
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error("Card element not found");

      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setCardError(error.message ?? "Card setup failed");
        setLoading(false);
        return;
      }

      if (!setupIntent?.payment_method) {
        throw new Error("No payment method returned");
      }

      // Step 3 — create subscription on server with the confirmed payment method
      const result = await createSubscription(setupIntent.payment_method as string);

      if (result.success) {
        toast.success("Subscription activated! Welcome to Pro 🎉");
        router.refresh();
        onSuccess();
      } else {
        throw new Error("Subscription creation failed");
      }
    } catch (err: any) {
      setCardError(err.message ?? "Something went wrong");
      toast.error(err.message ?? "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: string) =>
    `px-4 py-3.5 rounded-xl border bg-white/5 transition-all ${
      focusedField === field
        ? "border-blue-500 ring-2 ring-blue-500/20"
        : "border-white/10 hover:border-white/20"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-blue-400" />
          <p className="text-sm font-semibold text-gray-200">Card Details</p>
        </div>

        {/* Card number */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-medium">Card Number</label>
          <div className={fieldClass("number")}>
            <CardNumberElement
              options={{ ...CARD_ELEMENT_OPTIONS, showIcon: true }}
              onFocus={() => setFocusedField("number")}
              onBlur={() => setFocusedField(null)}
              onChange={() => setCardError(null)}
            />
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Expiry Date</label>
            <div className={fieldClass("expiry")}>
              <CardExpiryElement
                options={CARD_ELEMENT_OPTIONS}
                onFocus={() => setFocusedField("expiry")}
                onBlur={() => setFocusedField(null)}
                onChange={() => setCardError(null)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">CVC</label>
            <div className={fieldClass("cvc")}>
              <CardCvcElement
                options={CARD_ELEMENT_OPTIONS}
                onFocus={() => setFocusedField("cvc")}
                onBlur={() => setFocusedField(null)}
                onChange={() => setCardError(null)}
              />
            </div>
          </div>
        </div>

        {/* Card error */}
        {cardError && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <span className="shrink-0">⚠</span> {cardError}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
        Payments are encrypted and processed securely by Stripe.
      </div>

      {/* Summary + submit */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Pro Plan</span>
          <span className="font-semibold">$39.00 / month</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-white/10 pt-3">
          <span>Billed monthly, cancel anytime</span>
          <span className="text-gray-300 font-medium">$39.00 today</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <><Lock className="h-4 w-4" /> Subscribe — $39/month</>
          )}
        </button>
      </div>
    </form>
  );
}