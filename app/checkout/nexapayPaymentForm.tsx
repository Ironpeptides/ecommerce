"use client";
import React, { useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

interface PricingConfig {
  salesTaxRate: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface NexaPayPaymentFormProps {
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  orderId: string | null;
  isSubscriber: boolean;
  pricingConfig: PricingConfig | null;
  paymentMethod: string;
}

const NexaPayPaymentForm = ({
  cartItems,
  coupon,
  sessionId,
  orderId,
  isSubscriber,
  pricingConfig,
}: NexaPayPaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("NexaPayPaymentForm props:", { cartItems, coupon, sessionId, orderId, isSubscriber, pricingConfig });

  // ── Price calculation (no discount for NexaPay) ──────────────────────────
  const subtotal = cartItems.reduce((sum, item) => {
    // Determine the correct price: use selectedVariant price if it exists, otherwise use sale_price
    const itemPrice = item.selectedVariant?.price ?? item.sale_price ?? 0;
    // Use the cart item quantity, not the variant quantity
    const itemQuantity = item.quantity ?? 1;
    return sum + itemPrice * itemQuantity;
  }, 0);
  
  const couponDiscount = coupon?.discountAmount ?? 0;
  const subDiscount = isSubscriber && pricingConfig ? subtotal * pricingConfig.subDiscount : 0;
  const shipping = pricingConfig
    ? subtotal >= pricingConfig.freeShippingMin
      ? 0
      : pricingConfig.shippingCost
    : 11;
  const taxable = subtotal - couponDiscount - subDiscount + shipping;
  const tax = pricingConfig ? taxable * pricingConfig.salesTaxRate : 0;
  const total = taxable + tax;

  // ── Create NexaPay session and redirect ───────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/order/create-nexapay-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, orderId, isSubscriber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create NexaPay session");

      // NexaPay returns a hosted checkout URL — redirect the customer
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned from NexaPay");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">

      {/* ── Order Summary ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Order Summary</h3>
        <div className="space-y-2">
          {cartItems.map((item, i) => {
            const itemPrice = item.selectedVariant?.price ?? item.sale_price ?? 0;
            const itemQuantity = item.quantity ?? 1;
            const itemTotal = itemPrice * itemQuantity;
            
            return (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {item.title || item.name} × {itemQuantity}
                  {item.selectedVariant && (
                    <span className="text-slate-500 ml-1">({item.selectedVariant.value})</span>
                  )}
                </span>
                <span className="text-slate-200">${itemTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Coupon</span>
              <span>-${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          {subDiscount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Member Discount</span>
              <span>-${subDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-100 font-bold text-base pt-2 border-t border-slate-800">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── NexaPay Info ───────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 text-[12px] text-slate-400 leading-relaxed">
        You'll be redirected to a secure NexaPay hosted checkout page to complete your
        card payment. NexaPay automatically converts your payment to cryptocurrency and
        settles it to our wallet — no crypto wallet required on your end.
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* ── Pay Button ─────────────────────────────────────────────────────── */}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Redirecting to NexaPay…
          </>
        ) : (
          <>
            <ExternalLink size={16} />
            Pay ${total.toFixed(2)} with NexaPay
          </>
        )}
      </button>
    </div>
  );
};

export default NexaPayPaymentForm;