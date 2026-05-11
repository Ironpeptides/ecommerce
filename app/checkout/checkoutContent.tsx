"use client";

/**
 * checkout/page.tsx — optimised
 *
 * Key changes vs original:
 *
 * 1. PARALLEL DATA FETCHING
 *    Pricing config and session were two sequential useEffect waterfalls.
 *    Now both fire with Promise.all — cuts loading time roughly in half
 *    on slow connections (e.g. a researcher on a university VPN).
 *
 * 2. SINGLE STATUS ENUM INSTEAD OF TWO LOADING BOOLEANS
 *    `loading` + `configLoading` caused two separate renders as each
 *    resolved. A single `status: "loading" | "error" | "ready"` means
 *    the component renders exactly once when both requests settle.
 *
 * 3. comingSoon AS DATA, NOT HARDCODED LOGIC
 *    `method.id === "credits"` was inline JSX logic. Now it's a
 *    `comingSoon` boolean on each PAYMENT_METHODS entry — one place
 *    to change, zero risk of missing an instance.
 *
 * 4. RETRY BUTTON ON ERROR SCREEN
 *    The original only offered "Back to Cart". A transient network
 *    hiccup shouldn't force the user to lose their session — the
 *    retry button calls loadCheckout() again without a page reload.
 *
 * 5. PRICING SUMMARY IN useMemo
 *    The summary label/value array was rebuilt on every render.
 *    Now memoised on pricingConfig.
 *
 * 6. searchParams CORRECTLY IN EFFECT DEPENDENCY
 *    The fetch is wrapped in useCallback([sessionId]) so the effect
 *    dependency array is accurate and won't stale-close over the param.
 *
 * 7. DEV-ONLY LOGGING FOR PRICING FALLBACK
 *    The catch block now logs a warning in development so you know
 *    when the fallback is being used — without leaking logs to prod.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  XCircle,
  Loader2,
  Shield,
  Zap,
  FlaskConical,
  Star,
  Bitcoin,
  DollarSign,
  CreditCard,
  Coins,
  RefreshCw,
} from "lucide-react";
import CheckoutForm from "../../components/checkout/checkoutForm";

// ── Types ──────────────────────────────────────────────────────────────────────

export type PaymentMethod =
  | "manual_crypto"
  | "venmo"
  | "cashapp"
  | "zelle"
  | "payblis"
  | "credits";

interface PricingConfig {
  salesTaxRate: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

type Status = "loading" | "error" | "ready";

// ── Payment method definitions ─────────────────────────────────────────────────

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  accent: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
  comingSoon?: boolean;
}[] = [
  {
    id: "manual_crypto",
    label: "Crypto",
    sublabel: "Direct wallet transfer",
    icon: Bitcoin,
    accent: "border-orange-500/50 bg-orange-500/5",
    ring: "ring-1 ring-orange-500/20",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    badge: "15% off",
  },
  {
    id: "venmo",
    label: "Venmo",
    sublabel: "Manual · Admin verified",
    icon: DollarSign,
    accent: "border-blue-500/50 bg-blue-500/5",
    ring: "ring-1 ring-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "cashapp",
    label: "Cash App",
    sublabel: "Manual · Admin verified",
    icon: DollarSign,
    accent: "border-emerald-500/50 bg-emerald-500/5",
    ring: "ring-1 ring-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    id: "payblis",
    label: "Card Payment",
    sublabel: "Visa · Mastercard · Apple Pay",
    icon: CreditCard,
    accent: "border-blue-500/50 bg-blue-500/5",
    ring: "ring-1 ring-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "credits",
    label: "Pay with Credits",
    sublabel: "Instant · Secure",
    icon: Coins,
    accent: "border-blue-500/50 bg-blue-500/5",
    ring: "ring-1 ring-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    badge: "Recommended",
    comingSoon: true, // single source of truth — no inline id checks
  },
  {
    id: "zelle",
    label: "Zelle",
    sublabel: "Manual · Admin verified",
    icon: Zap,
    accent: "border-blue-500/50 bg-blue-500/5",
    ring: "ring-1 ring-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
];

const PRICING_FALLBACK: PricingConfig = {
  salesTaxRate: 0.1,
  cryptoDiscount: 0.15,
  subDiscount: 0.2,
  shippingCost: 11.0,
  freeShippingMin: 200.0,
};

// ── Component ──────────────────────────────────────────────────────────────────

const CheckoutContent = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("sessionId");
  const orderId      = searchParams.get("orderId");

  const [status, setStatus]               = useState<Status>("loading");
  const [cartItems, setCartItems]         = useState<any[]>([]);
  const [coupon, setCoupon]               = useState<any>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payblis");
  const { data: session, status: authStatus } = useSession();
  const isSubscriber = session?.user?.subscriptionStatus === "active";
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);

  // ── Subscription redirect — preserves checkout session across navigation ────
  // We store the sessionId in localStorage before redirecting so the user can
  // return to exactly this checkout page after subscribing, without losing
  // their cart. The billing page should read "checkout_session_id" on mount
  // and redirect back here if it exists.
  const handleSubscribe = useCallback(() => {
    if (sessionId) {
      try {
        localStorage.setItem(
          "checkout_session_id",
          JSON.stringify({ sessionId, orderId, savedAt: Date.now() })
        );
      } catch {
        // localStorage unavailable (private browsing) — proceed without saving
      }
    }

    if (authStatus === "authenticated" && session) {
      router.push("/dashboard/billing");
    } else {
      router.push("/login?redirect=/dashboard/billing");
    }
  }, [authStatus, session, sessionId, orderId, router]);

    // ── Parallel fetch ─────────────────────────────────────────────────────────
  const loadCheckout = useCallback(async () => {
    if (!sessionId) {
      setError("Invalid session. Please return to cart and try again.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      // Both requests fire simultaneously — no waterfall
      const [pricingRes, sessionRes] = await Promise.all([
        fetch("/api/checkout/pricing-config"),
        fetch(`/api/order/verifying-payment-session?sessionId=${sessionId}`),
      ]);

      // Pricing — fall back gracefully but log in dev
      if (pricingRes.ok) {
        setPricingConfig(await pricingRes.json());
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn("[checkout] Pricing config unavailable — using fallback");
        }
        setPricingConfig(PRICING_FALLBACK);
      }

      // Session — hard fail if missing
      const body = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(body.error || "Session verification failed");
      if (!body.session?.cart?.length) throw new Error("No items found in your session.");

      setCartItems(body.session.cart);
      setCoupon(body.session.coupon ?? null);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }, [sessionId]);

  useEffect(() => {
    loadCheckout();
  }, [loadCheckout]);

  // ── Pricing summary — only recalculates when config changes ───────────────
  const pricingSummary = useMemo(() => {
    if (!pricingConfig) return [];
    return [
      { label: "Free Shipping Over", value: `$${pricingConfig.freeShippingMin.toFixed(0)}` },
      { label: "Shipping",           value: `$${pricingConfig.shippingCost.toFixed(2)} USPS` },
      { label: "Crypto Discount",    value: `${(pricingConfig.cryptoDiscount * 100).toFixed(0)}% off` },
    ];
  }, [pricingConfig]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Preparing your secure checkout…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full max-w-md text-center bg-[#111] border border-white/10 rounded-2xl p-10">
          <XCircle className="text-red-400 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Session Error</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {/* Retry without losing the session — avoids forcing back to cart */}
            <button
              onClick={loadCheckout}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              <RefreshCw size={14} /> Retry
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 py-12 px-4 font-sans">

      {/* Mission Banner */}
      <div className="max-w-2xl mx-auto mb-6 p-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.03]">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-lg shrink-0 mt-0.5">
            <FlaskConical size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 mb-1">
              Leading the charge to make peptides available and affordable to everyone
            </p>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              We price our products fairly and ethically — never gouging our customers.
              Highest quality products at the lowest prices, and with an active subscription
              you'll receive{" "}
              <span className="text-blue-300 font-semibold">one free vial</span> on us.
            </p>
          </div>
        </div>
      </div>

      {/* RUO Disclaimer */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg border border-slate-800 bg-slate-900/50 flex items-start gap-4">
        <Shield size={18} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
          <span className="text-slate-300 font-bold">Research Use Only:</span> Not for Human
          Consumption · Not for Therapeutic or Veterinary Use · Not Intended to Diagnose,
          Treat, Cure, or Prevent Any Disease.
        </p>
      </div>

      {/* Pricing Summary */}
      {pricingSummary.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 grid grid-cols-3 gap-3">
          {pricingSummary.map(({ label, value }) => (
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

      {/* Payment Method Selection */}
      <div className="max-w-2xl mx-auto mb-8">
        <label className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4 block">
          Select Payment Method
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected   = paymentMethod === method.id;
            const isComingSoon = method.comingSoon ?? false;
            const Icon         = method.icon;

            return (
              <button
                key={method.id}
                onClick={() => !isComingSoon && setPaymentMethod(method.id)}
                disabled={isComingSoon}
                aria-pressed={isSelected}
                aria-label={`${method.label}${isComingSoon ? " — coming soon" : ""}`}
                className={[
                  "relative flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left",
                  isSelected
                    ? `${method.accent} ${method.ring}`
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700",
                  isComingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                {method.badge && !isComingSoon && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                    {method.badge}
                  </span>
                )}
                {isComingSoon && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-700">
                    Soon
                  </span>
                )}

                <div className={`p-2 rounded-lg transition-colors ${isSelected ? `${method.iconBg} ${method.iconColor}` : "bg-slate-800 text-slate-500"}`}>
                  <Icon size={18} />
                </div>

                <div>
                  <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                    {method.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-medium uppercase tracking-tight ${method.id === "manual_crypto" && isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                    {method.sublabel}
                  </p>
                </div>

                {isSelected && (
                  <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscription Section */}
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
            onClick={handleSubscribe}
            className="shrink-0 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all active:scale-[0.98]"
          >
            Subscribe
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
          <Star size={14} className="text-emerald-500" />
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

      {/* Checkout Form */}
      <div className="max-w-2xl mx-auto">
        <CheckoutForm
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}
          orderId={orderId}
          paymentMethod={paymentMethod}
          isSubscriber={isSubscriber}
          pricingConfig={pricingConfig}
        />
      </div>
    </div>
  );
};

export default CheckoutContent;