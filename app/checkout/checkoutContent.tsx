"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  XCircle,
  Loader2,
  Shield,
  Zap,
  FlaskConical,
  Star,
  Wallet,
  Bitcoin,
  DollarSign,
  CreditCard,
  Coins,
} from "lucide-react";
import CheckoutForm from "../../components/checkout/checkoutForm";

// ── Types ──────────────────────────────────────────────────────────────────────
export type PaymentMethod =
  | "manual_crypto"
  | "venmo"
  | "cashapp"
  | "payram"
  | "credits";

interface PricingConfig {
  salesTaxRate: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

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
    id: "payram",
    label: "Payram",
    sublabel: "Coming soon",
    icon: CreditCard,
    accent: "border-purple-500/50 bg-purple-500/5",
    ring: "ring-1 ring-purple-500/20",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "credits",
    label: "Pay with Credits(using card)",
    sublabel: "Instant · Secure",
    icon: Coins,
    accent: "border-violet-500/50 bg-violet-500/5",
    ring: "ring-1 ring-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    badge: "Recommended",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
const CheckoutContent = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credits");
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const orderId = searchParams.get("orderId");

  // Fetch pricing config
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        const res = await fetch("/api/checkout/pricing-config");
        if (!res.ok) throw new Error("Failed to load pricing configuration");
        const data = await res.json();
        setPricingConfig(data);
      } catch {
        setPricingConfig({
          salesTaxRate: 0.1,
          cryptoDiscount: 0.15,
          subDiscount: 0.2,
          shippingCost: 11.0,
          freeShippingMin: 200.0,
        });
      } finally {
        setConfigLoading(false);
      }
    };
    fetchPricingConfig();
  }, []);

  // Fetch session
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("Invalid session. Please return to cart and try again.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/order/verifying-payment-session?sessionId=${sessionId}`
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Session verification failed");
        const sessionData = body.session;
        if (!sessionData || !sessionData.cart || sessionData.cart.length === 0) {
          throw new Error("No items found in your session.");
        }
        setCartItems(sessionData.cart);
        setCoupon(sessionData.coupon);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading || configLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Preparing your secure checkout…</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full max-w-md text-center bg-[#111] border border-white/10 rounded-2xl p-10">
          <XCircle className="text-red-400 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Session Error</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/cart")}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-xl"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 py-12 px-4 font-sans">

      {/* Mission Banner */}
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
              you'll receive{" "}
              <span className="text-violet-300 font-semibold">one free vial</span> on us.
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

      {/* Pricing Config Summary */}
      {pricingConfig && (
        <div className="max-w-2xl mx-auto mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Free Shipping Over", value: `$${pricingConfig.freeShippingMin.toFixed(0)}` },
            { label: "Shipping", value: `$${pricingConfig.shippingCost.toFixed(2)} USPS` },
            { label: "Crypto Discount", value: `${(pricingConfig.cryptoDiscount * 100).toFixed(0)}% off` },
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

      {/* Payment Method Selection */}
      <div className="max-w-2xl mx-auto mb-8">
        <label className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4 block">
          Select Payment Method
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.id;
            const Icon = method.icon;
            const isComingSoon = method.id === "payram";

            return (
              <button
                key={method.id}
                onClick={() => !isComingSoon && setPaymentMethod(method.id)}
                disabled={isComingSoon}
                className={`
                  relative flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left
                  ${isSelected
                    ? `${method.accent} ${method.ring}`
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }
                  ${isComingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Badge */}
                {method.badge && !isComingSoon && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">
                    {method.badge}
                  </span>
                )}
                {isComingSoon && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-700">
                    Soon
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isSelected ? `${method.iconBg} ${method.iconColor}` : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>

                {/* Labels */}
                <div>
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isSelected ? "text-slate-100" : "text-slate-400"
                    }`}
                  >
                    {method.label}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 font-medium uppercase tracking-tight ${
                      method.id === "manual_crypto" && isSelected
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {method.sublabel}
                  </p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
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
                {pricingConfig
                  ? `${(pricingConfig.subDiscount * 100).toFixed(0)}%`
                  : "20%"}{" "}
                flat discount on all laboratory materials — plus one free vial.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubscriber(true)}
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
              {pricingConfig
                ? `${(pricingConfig.subDiscount * 100).toFixed(0)}%`
                : "20%"}{" "}
              Research Discount Applied + 1 Free Vial
            </span>
          </p>
        </div>
      )}

      {/* Form Container */}
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