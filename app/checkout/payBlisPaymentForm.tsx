"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import useUser from "../../hooks/useUser";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  Loader2,
  ArrowRight,
  AlertCircle,
  Shield,
  Globe,
  Smartphone,
  Tag,
  Package,
  ChevronDown,
  ChevronUp,
  Info,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface PayblisPaymentProps {
  cartItems: any[];
  coupon?: any;
  isSubscriber: boolean;
  pricingConfig: any;
  paymentMethod: string;
  orderId?: string | null;
  sessionId?: string | null;
}

interface Breakdown {
  rawSubtotal: number;
  couponDiscount: number;
  subDiscountAmt: number;
  vialDiscountAmt: number;
  vialTier: { label: string; discount: number } | null;
  totalVialQty: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

// ── Cosmetic payment methods (UI only — Payblis shows real options on redirect)
const DISPLAY_METHODS = [
  { id: "credit_cards", label: "Credit / Debit Card", icon: CreditCard },
  { id: "apple_pay",    label: "Apple Pay",            icon: Smartphone },
  { id: "google_pay",   label: "Google Pay",           icon: Globe },
  { id: "paypal",       label: "PayPal",               icon: Globe },
];

// ── Providers that don't require KYC (shown in the disclaimer)
const NO_KYC_PROVIDERS = ["Klever", "Simplex", "Unlimit", "Crypto.com"];

// ── Vial discount tiers — must match backend
const VIAL_DISCOUNT_TIERS = [
  { minQty: 10, discount: 0.10, label: "10+ vials" },
  { minQty: 5,  discount: 0.00, label: "5+ vials"  },
];

const fmt = (n: number) => `$${n.toFixed(2)}`;
const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

// ── Component ──────────────────────────────────────────────────────────────────
const PayblisPayment = ({
  cartItems,
  coupon,
  isSubscriber,
  pricingConfig,
}: PayblisPaymentProps) => {
  const [selectedMethod, setSelectedMethod] = useState("credit_cards");
  const [loading, setLoading]               = useState(false);
  const [breakdown, setBreakdown]           = useState<Breakdown | null>(null);
  const [showBreakdown, setShowBreakdown]   = useState(false);

  const searchParams = useSearchParams();
  const orderId      = searchParams.get("orderId");
  const { user }     = useUser();

  // ── Local price preview ────────────────────────────────────────────────────
  const getItemPrice = (item: any) => {
    if (item.selectedVariant?.price !== undefined) return Number(item.selectedVariant.price);
    return Number(item.sale_price || item.price || 0);
  };

  const localBreakdown = (): Breakdown => {
    const rawSubtotal = cartItems.reduce(
      (sum, item) => sum + getItemPrice(item) * (Number(item.quantity) || 1),
      0
    );
    const totalVialQty = cartItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0
    );
    const couponDiscount =
      coupon?.discountAmount ||
      (coupon?.discountPercent ? rawSubtotal * (coupon.discountPercent / 100) : 0);
    const afterCoupon    = Math.max(0, rawSubtotal - couponDiscount);
    const subDiscountAmt = isSubscriber && pricingConfig?.subDiscount
      ? afterCoupon * pricingConfig.subDiscount : 0;
    const afterSub       = afterCoupon - subDiscountAmt;
    const vialTierData   = VIAL_DISCOUNT_TIERS.find((t) => totalVialQty >= t.minQty) ?? null;
    const vialDiscountAmt = vialTierData ? afterSub * vialTierData.discount : 0;
    const afterVial      = afterSub - vialDiscountAmt;
    const shipping       = pricingConfig?.shippingCost && afterVial < (pricingConfig.freeShippingMin || Infinity)
      ? pricingConfig.shippingCost : 0;
    const tax            = pricingConfig?.salesTaxRate ? afterVial * pricingConfig.salesTaxRate : 0;
    const grandTotal     = afterVial + shipping + tax;
    return {
      rawSubtotal, couponDiscount, subDiscountAmt,
      vialDiscountAmt,
      vialTier: vialTierData ? { label: vialTierData.label, discount: vialTierData.discount } : null,
      totalVialQty, shipping, tax, grandTotal,
    };
  };

  const displayed = breakdown ?? localBreakdown();

  const nextTier = (() => {
    const qty = displayed.totalVialQty;
    if (qty < 5)  return { need: 5  - qty, tier: VIAL_DISCOUNT_TIERS[1] };
    if (qty < 10) return { need: 10 - qty, tier: VIAL_DISCOUNT_TIERS[0] };
    return null;
  })();

  // ── Handler ────────────────────────────────────────────────────────────────
  const handleProceed = async () => {
    if (!user)    { toast.error("You must be logged in."); return; }
    if (!orderId) { toast.error("No order found. Please return to cart."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/payblis/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          currency:    "USD",
          country:     "US",
          isSubscriber,
          couponCode:  coupon?.code ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      if (data.breakdown) setBreakdown(data.breakdown);

      // Brief pause so user sees verified total before redirect
      await new Promise((r) => setTimeout(r, 400));
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/40 to-[#1a1a1a] px-6 py-5 border-b border-blue-900/30">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Card Payment</h3>
        </div>
        <p className="text-gray-400 text-sm mt-1.5">
          Secure payment — your card details are never stored on our servers
        </p>
      </div>

      {/* Vial discount promotions */}
      <div className="px-6 pt-5 space-y-2">
        {displayed.vialTier && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300 font-semibold">
              Bulk discount applied:{" "}
              <span className="font-bold">{pct(displayed.vialTier.discount)} off</span>
              {" "}— {displayed.vialTier.label}
            </p>
          </div>
        )}
        {nextTier && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">
                Add <span className="font-bold">{nextTier.need} more vial{nextTier.need > 1 ? "s" : ""}</span>{" "}
                to unlock <span className="font-bold">{pct(nextTier.tier.discount)} off</span>
              </p>
            </div>
            <a
              href="/cart?reason=add_more_vials"
              className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 ml-3"
            >
              ← Back to cart
            </a>
          </div>
        )}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Bulk Discount Tiers
            </p>
            <div className="flex gap-4 flex-wrap">
              {VIAL_DISCOUNT_TIERS.slice().reverse().map((tier) => (
                <div key={tier.minQty} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    displayed.totalVialQty >= tier.minQty ? "bg-emerald-400" : "bg-slate-700"
                  }`} />
                  <span className={`text-[11px] font-medium ${
                    displayed.totalVialQty >= tier.minQty ? "text-emerald-400" : "text-slate-500"
                  }`}>
                    {tier.minQty}+ vials → {pct(tier.discount)} off
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="px-6 pt-4">
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="w-full flex items-center justify-between py-3 border-b border-gray-800"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Order Total</span>
            {breakdown && (
              <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white font-mono">
              {fmt(displayed.grandTotal)}
            </span>
            {showBreakdown
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </div>
        </button>

        {showBreakdown && (
          <div className="py-3 space-y-2 border-b border-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Subtotal{" "}
                <span className="text-gray-600 text-xs">
                  ({displayed.totalVialQty} vial{displayed.totalVialQty !== 1 ? "s" : ""})
                </span>
              </span>
              <span className="text-white font-mono">{fmt(displayed.rawSubtotal)}</span>
            </div>
            {displayed.couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coupon discount</span>
                <span className="text-emerald-400 font-mono">-{fmt(displayed.couponDiscount)}</span>
              </div>
            )}
            {displayed.subDiscountAmt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Subscriber ({pct(pricingConfig?.subDiscount ?? 0)})
                </span>
                <span className="text-emerald-400 font-mono">-{fmt(displayed.subDiscountAmt)}</span>
              </div>
            )}
            {displayed.vialDiscountAmt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  Bulk discount ({displayed.vialTier?.label})
                </span>
                <span className="text-emerald-400 font-mono">-{fmt(displayed.vialDiscountAmt)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping</span>
              <span className={`font-mono ${displayed.shipping === 0 ? "text-emerald-400" : "text-white"}`}>
                {displayed.shipping === 0 ? "FREE" : fmt(displayed.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Tax ({pct(pricingConfig?.salesTaxRate ?? 0)})
              </span>
              <span className="text-white font-mono">{fmt(displayed.tax)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">

        {/* Cosmetic method selector — UI only, Payblis shows real options on redirect */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Preferred method
            </label>
            <span className="text-[10px] text-slate-600 italic">
              Final selection made on payment page
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DISPLAY_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              const Icon       = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/20"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                  <span className={`text-xs font-medium ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── KYC disclaimer — always visible, not tied to any selection ──────── */}
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          {/* MoonPay warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-500/8 border-b border-slate-700/50">
            <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-400">
                Identity verification — MoonPay
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                On the payment page you'll see a list of providers under, <strong>"Best provider selected for you"</strong>. MoonPay requires
                full identity verification — government-issued ID, selfie, and address
                proof — which can take 10–30 minutes.{" "}
                <span className="text-amber-300 font-medium">
                  Avoid MoonPay if you prefer not to verify your identity.Click on the downward arrow to select other options.
                </span>
              </p>
            </div>
          </div>

          {/* No-KYC providers */}
          <div className="flex items-start gap-3 p-4 bg-emerald-500/[0.05]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-emerald-400">
                No document required
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                These providers process your payment without identity documents:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {NO_KYC_PROVIDERS.map((provider) => (
                  <span
                    key={provider}
                    className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                  >
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* General redirect notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            You'll be redirected to a secure payment page where you'll choose your
            provider and enter payment details. Your order is reserved while you pay
            and confirmed automatically once payment is verified.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-500">SSL Encrypted</span>
          </div>
          <span className="text-slate-800">·</span>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-500">PCI Compliant</span>
          </div>
          <span className="text-slate-800">·</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-500">Server-verified pricing</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleProceed}
          disabled={loading}
          className="w-full group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Preparing secure checkout…</span>
            </>
          ) : (
            <>
              <span>Proceed to Payment — {fmt(displayed.grandTotal)}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-gray-600">
          Final amount confirmed server-side before charge
        </p>
      </div>
    </div>
  );
};

export default PayblisPayment;