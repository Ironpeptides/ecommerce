"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";

interface PayblisPaymentProps {
  cartItems: any[];
  coupon?: any;
  isSubscriber: boolean;
  pricingConfig: any;
  paymentMethod: string;
}

const SUPPORTED_METHODS = [
  { id: "credit_cards", label: "Credit / Debit Card", icon: CreditCard },
  { id: "apple_pay",    label: "Apple Pay",            icon: Smartphone },
  { id: "google_pay",   label: "Google Pay",           icon: Globe },
  { id: "paypal",       label: "PayPal",               icon: Globe },
];

const PayblisPayment = ({
  cartItems,
  coupon,
  isSubscriber,
  pricingConfig,
}: PayblisPaymentProps) => {
  const [selectedMethod, setSelectedMethod] = useState("credit_cards");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useUser();

  // ── Price calculation ──────────────────────────────────────────────────────
  const getItemPrice = (item: any) => {
    if (item.selectedVariant?.price !== undefined) return Number(item.selectedVariant.price);
    return Number(item.sale_price || item.price || 0);
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const calculateBreakdown = () => {
    const rawSubtotal = cartItems.reduce(
      (sum, item) => sum + getItemPrice(item) * (Number(item.quantity) || 1),
      0
    );
    const couponDiscount =
      coupon?.discountAmount || coupon?.discountPercent
        ? coupon.discountAmount || rawSubtotal * (coupon.discountPercent / 100)
        : 0;
    const afterCoupon = rawSubtotal - couponDiscount;
    const subDiscountAmt =
      isSubscriber && pricingConfig?.subDiscount
        ? afterCoupon * pricingConfig.subDiscount
        : 0;
    const afterSub = afterCoupon - subDiscountAmt;
    const shipping =
      pricingConfig?.shippingCost && afterSub < (pricingConfig.freeShippingMin || Infinity)
        ? pricingConfig.shippingCost
        : 0;
    const tax = pricingConfig?.salesTaxRate ? afterSub * pricingConfig.salesTaxRate : 0;
    const grandTotal = afterSub + shipping + tax;
    return { rawSubtotal, couponDiscount, subDiscountAmt, shipping, tax, grandTotal };
  };

  const breakdown = calculateBreakdown();

  // ── Handler ────────────────────────────────────────────────────────────────
  const handleProceed = async () => {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!orderId) {
      toast.error("No order found. Please return to cart.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payblis/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: breakdown.grandTotal,
          currency: "USD",
          country: "US",   // ideally get from user's shipping address
          method: selectedMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");

      // Redirect user to Payblis hosted checkout
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
        <p className="text-gray-400 text-sm mt-2">
          Secure payment processed by Payblis
        </p>
      </div>

      {/* Price breakdown */}
      <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white font-mono">{fmt(breakdown.rawSubtotal)}</span>
        </div>
        {breakdown.couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Coupon</span>
            <span className="text-emerald-400 font-mono">-{fmt(breakdown.couponDiscount)}</span>
          </div>
        )}
        {breakdown.subDiscountAmt > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Subscriber ({((pricingConfig?.subDiscount || 0) * 100).toFixed(0)}%)
            </span>
            <span className="text-emerald-400 font-mono">-{fmt(breakdown.subDiscountAmt)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Shipping</span>
          <span className={`font-mono ${breakdown.shipping === 0 ? "text-emerald-400" : "text-white"}`}>
            {breakdown.shipping === 0 ? "FREE" : fmt(breakdown.shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            Tax ({((pricingConfig?.salesTaxRate || 0) * 100).toFixed(1)}%)
          </span>
          <span className="text-white font-mono">{fmt(breakdown.tax)}</span>
        </div>
        <div className="border-t border-gray-700 pt-2 flex justify-between items-center">
          <span className="text-gray-300 font-medium">Total</span>
          <span className="text-2xl font-bold text-white">{fmt(breakdown.grandTotal)}</span>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Payment method selector */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 block">
            Payment method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              const Icon = method.icon;
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
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-blue-400" : "text-slate-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? "text-slate-100" : "text-slate-400"
                    }`}
                  >
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info notice */}
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            You'll be redirected to a secure payment page to complete your
            purchase. Your order is reserved while you pay. Return here after
            payment and your order will be confirmed automatically.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-500">SSL Encrypted</span>
          </div>
          <span className="text-slate-800">·</span>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-500">PCI Compliant</span>
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
              <span>Redirecting to payment…</span>
            </>
          ) : (
            <>
              <span>Proceed to Payment — {fmt(breakdown.grandTotal)}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PayblisPayment;