// app/checkout/CheckoutContent.tsx
"use client";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
import { Elements } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import { XCircle, Loader2, Shield, Zap, CreditCard, Bitcoin, FlaskConical, Star } from "lucide-react";
import CheckoutForm from "../../components/checkout/checkoutForm";

export type PaymentMethod = "stripe" | "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PricingConfig {
  salesTaxRate: number;
  creditCardFee: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface SessionData {
  cart: any[];
  coupon: any;
  subtotal: number;
  totalAmount: number;
}

const CheckoutContent = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems]         = useState<any[]>([]);
  const [coupon, setCoupon]               = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto");
  const [isSubscriber, setIsSubscriber]   = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const searchParams = useSearchParams();
  const router       = useRouter();
  const sessionId    = searchParams.get("sessionId");
  const orderId      = searchParams.get("orderId");

  // ── 1. Fetch pricing config (for display only) ────────────────────────────
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        const res = await fetch("/api/checkout/pricing-config");
        if (!res.ok) throw new Error("Failed to load pricing configuration");
        const data = await res.json();
        setPricingConfig(data);
      } catch (err: any) {
        console.error("[pricing-config] error:", err);
        // Fallback for display only — backend will use its own authoritative values
        setPricingConfig({
          salesTaxRate:    0.10,
          creditCardFee:   0.05,
          cryptoDiscount:  0.15,
          subDiscount:     0.20,
          shippingCost:    11.00,
          freeShippingMin: 200.00,
        });
      } finally {
        setConfigLoading(false);
      }
    };

    fetchPricingConfig();
  }, []);

  // ── 2. Verify session & load cart — no amount involved ───────────────────
  useEffect(() => {
  const fetchSession = async () => {
  if (!sessionId) {
    setError("Invalid session. Please return to cart and try again.");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(
      `/api/order/verifying-payment-session?sessionId=${sessionId}`,
      { method: "GET" }
    );

    const body = await res.json();

    if (!res.ok) {
      throw new Error(body.error || "Session verification failed");
    }

    console.log("body from session API:", body);

    // FIX: Access the 'session' property from the body
    const sessionData = body.session;

    // Check if session exists and has a cart
    if (!sessionData || !sessionData.cart || sessionData.cart.length === 0) {
      throw new Error("No items found in your session.");
    }

    // Now set your state using the nested data
    setCartItems(sessionData.cart);
    setCoupon(sessionData.coupon); 
    
  } catch (err: any) {
    console.error("[checkout-session] error:", err);
    setError(err.message || "Something went wrong while preparing your payment.");
  } finally {
    setLoading(false);
  }
};

  fetchSession();
}, [sessionId]);

  // ── 3. Fetch PaymentIntent when user selects card ─────────────────────────
  // We pass sessionId + isSubscriber — the backend recomputes the total itself.
  // We never send an amount from the frontend.
  const fetchPaymentIntent = async (subscriber: boolean) => {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/order/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          isSubscriber: subscriber,
          // ✅ No `amount` field — the backend computes it from DB data
          orderNumber: orderId,
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize card payment");
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("[create-intent] error:", err);
      setError(err.message);
    }
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "stripe") {
      await fetchPaymentIntent(isSubscriber);
    }
  };

  // Re-fetch intent if subscriber status changes while on the card tab,
  // so Stripe updates the PaymentIntent amount to reflect the discount.
  const handleSubscriberToggle = async (next: boolean) => {
    setIsSubscriber(next);
    if (paymentMethod === "stripe") {
      await fetchPaymentIntent(next);
    }
  };

  const appearance: Appearance = {
    theme: "night",
    variables: {
      colorPrimary:    "#7c3aed",
      colorBackground: "#0a0a0c",
      colorText:       "#f3f4f6",
      fontFamily:      "system-ui, sans-serif",
    },
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || configLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Preparing your secure checkout…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full max-w-md text-center bg-[#111] border border-white/10 rounded-2xl p-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-400 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Session Error</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/cart")}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-xl hover:bg-violet-500 transition-all font-medium"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 py-12 px-4 font-sans">

      {/* ── Mission Banner ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-6 p-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.03]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-violet-500/10 rounded-lg shrink-0 mt-0.5">
            <FlaskConical size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 mb-1">
              Leading the charge to make peptides available and affordable to everyone
            </p>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              We price our products fairly and ethically — never gouging our customers.
              Highest quality products at the lowest prices, and with an active subscription
              you'll receive <span className="text-violet-300 font-semibold">one free vial</span> on us.
            </p>
          </div>
        </div>
      </div>

      {/* ── RUO Legal Disclaimer ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg border border-slate-800 bg-slate-900/50 flex items-start gap-4">
        <Shield size={18} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
          <span className="text-slate-300 font-bold">Research Use Only:</span> Not for Human
          Consumption · Not for Therapeutic or Veterinary Use · Not Intended to Diagnose,
          Treat, Cure, or Prevent Any Disease.
        </p>
      </div>

      {/* ── Pricing Config Summary ───────────────────────────────────────────── */}
      {pricingConfig && (
        <div className="max-w-2xl mx-auto mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Free Shipping Over",  value: `$${pricingConfig.freeShippingMin.toFixed(0)}` },
            { label: "Shipping",            value: `$${pricingConfig.shippingCost.toFixed(2)} USPS` },
            { label: "Crypto Discount",     value: `${(pricingConfig.cryptoDiscount * 100).toFixed(0)}% off` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-center"
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-bold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Payment Method Selection ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-8">
        <label className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4 block">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handlePaymentMethodChange("crypto")}
            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              paymentMethod === "crypto"
                ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${paymentMethod === "crypto" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500 group-hover:text-slate-400"}`}>
              <Bitcoin size={20} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${paymentMethod === "crypto" ? "text-emerald-50" : "text-slate-400"}`}>
                Crypto Assets
              </p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                Save {pricingConfig ? `${(pricingConfig.cryptoDiscount * 100).toFixed(0)}%` : "15%"} Instant
              </p>
            </div>
          </button>

          <button
            onClick={() => handlePaymentMethodChange("stripe")}
            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              paymentMethod === "stripe"
                ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${paymentMethod === "stripe" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500 group-hover:text-slate-400"}`}>
              <CreditCard size={20} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${paymentMethod === "stripe" ? "text-emerald-50" : "text-slate-400"}`}>
                Credit Card
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                +{pricingConfig ? `${(pricingConfig.creditCardFee * 100).toFixed(0)}%` : "5%"} processing
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Subscription Section ─────────────────────────────────────────────── */}
      {!isSubscriber ? (
        <div className="max-w-2xl mx-auto mb-10 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg shrink-0">
              <Zap size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Institutional Membership</p>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-sm">
                $39/mo for priority supply and{" "}
                {pricingConfig ? `${(pricingConfig.subDiscount * 100).toFixed(0)}%` : "20%"}{" "}
                flat discount on all laboratory materials — plus one free vial.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSubscriberToggle(true)}
            className="shrink-0 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
          >
            Subscribe
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
            <Star size={14} className="text-emerald-500" />
          </div>
          <p className="text-xs text-emerald-400 font-semibold tracking-wide">
            ACTIVE MEMBER{" "}
            <span className="mx-2 text-emerald-800">|</span>{" "}
            <span className="text-emerald-200">
              {pricingConfig ? `${(pricingConfig.subDiscount * 100).toFixed(0)}%` : "20%"}{" "}
              Research Discount Applied + 1 Free Vial
            </span>
          </p>
        </div>
      )}

      {/* ── Form Container ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        {paymentMethod === "stripe" && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm
              clientSecret={clientSecret}
              cartItems={cartItems}
              coupon={coupon}
              sessionId={sessionId}
              orderId={orderId}
              paymentMethod="stripe"
              isSubscriber={isSubscriber}
              pricingConfig={pricingConfig}
              onSwitchToCrypto={() => handlePaymentMethodChange("crypto")}
            />
          </Elements>
        ) : (
          <CheckoutForm
            clientSecret=""
            cartItems={cartItems}
            coupon={coupon}
            sessionId={sessionId}
            orderId={orderId}
            paymentMethod={paymentMethod}
            isSubscriber={isSubscriber}
            pricingConfig={pricingConfig}
            onSwitchToCrypto={() => handlePaymentMethodChange("crypto")}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutContent;