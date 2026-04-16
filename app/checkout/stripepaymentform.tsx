import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, Package } from "lucide-react";
import React, { useState } from "react";
import {
  CREDIT_CARD_FEE,
  FREE_SHIPPING_MIN,
  SALES_TAX_RATE,
  SHIPPING_COST,
  SUB_DISCOUNT,
} from "./checkoutContent";

const fmt = (n: number) => `$${n.toFixed(2)}`;

interface StripePaymentFormProps {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  isSubscriber: boolean;
}

const StripePaymentForm = ({
  cartItems,
  coupon,
  sessionId,
  isSubscriber,
}: StripePaymentFormProps) => {
  // These hooks are safe here — this component is always inside <Elements>
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Price maths ────────────────────────────────────────────────────────────
  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.sale_price) * Number(item.quantity),
    0
  );
  const couponDiscount = coupon?.discountAmount ?? 0;
  const afterCoupon = rawSubtotal - couponDiscount;
  const subDiscount = isSubscriber ? afterCoupon * SUB_DISCOUNT : 0;
  const afterSub = afterCoupon - subDiscount;
  const ccFee = afterSub * CREDIT_CARD_FEE;
  const afterPaymentAdj = afterSub + ccFee;
  const shipping = afterPaymentAdj >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const tax = afterPaymentAdj * SALES_TAX_RATE;
  const grandTotal = afterPaymentAdj + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message ?? "Something went wrong.");
    }
    // On success Stripe redirects automatically via return_url
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-start px-4 pb-16">
      <div className="w-full max-w-lg space-y-5">

        {/* Order Summary */}
        <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
  {/* Header - Institutional Style */}
  <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/30">
    <Package size={16} className="text-emerald-500" />
    <h2 className="text-[11px] font-bold text-slate-100 uppercase tracking-[0.2em]">
      Order Summary — Credit Card
    </h2>
  </div>

  <div className="p-5">
    {/* Line Items */}
    <div className="space-y-3 mb-6">
      {cartItems.map((item, i) => (
        <div key={i} className="flex justify-between items-start text-sm">
          <div className="flex-1 pr-4">
            <p className="text-slate-300 font-medium line-clamp-1">
              {item.title}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
              Unit Price: {fmt(item.sale_price)} · Qty: {item.quantity}
            </p>
          </div>
          <span className="font-mono text-slate-200 font-medium text-right">
            {fmt(item.quantity * item.sale_price)}
          </span>
        </div>
      ))}
    </div>

    {/* Financial Breakdown */}
    <div className="border-t border-slate-800/60 pt-4 space-y-2.5">
      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Merchandise Subtotal</span>
        <span className="text-slate-200 font-mono">{fmt(rawSubtotal)}</span>
      </div>

      {couponDiscount > 0 && (
        <div className="flex justify-between text-[13px]">
          <span className="text-slate-400">Promotional Credit</span>
          <span className="text-emerald-500 font-mono">−{fmt(couponDiscount)}</span>
        </div>
      )}

      {subDiscount > 0 && (
        <div className="flex justify-between text-[13px]">
          <span className="text-slate-400">Institutional Membership ({(SUB_DISCOUNT * 100).toFixed(0)}%)</span>
          <span className="text-emerald-500 font-mono">−{fmt(subDiscount)}</span>
        </div>
      )}

      {/* Surcharge - Labeled professionally */}
      <div className="flex justify-between text-[13px]">
        <span className="text-slate-400">Card Processing Surcharge ({(CREDIT_CARD_FEE * 100).toFixed(0)}%)</span>
        <span className="text-amber-500 font-mono">+{fmt(ccFee)}</span>
      </div>

      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Logistics & Handling</span>
        <span className={`font-mono ${shipping === 0 ? "text-emerald-500 uppercase text-[11px] font-bold" : "text-slate-200"}`}>
          {shipping === 0 ? "Complimentary" : fmt(shipping)}
        </span>
      </div>

      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Tax Jurisdiction ({(SALES_TAX_RATE * 100).toFixed(0)}%)</span>
        <span className="text-slate-200 font-mono">{fmt(tax)}</span>
      </div>
    </div>

    {/* Grand Total Section */}
    <div className="flex justify-between items-end pt-5 mt-5 border-t border-slate-800">
      <div>
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Total Due (USD)
        </span>
        <span className="text-[11px] text-slate-600 italic">Electronic Transaction</span>
      </div>
      <span className="text-emerald-500 font-bold text-3xl font-mono tracking-tighter">
        {fmt(grandTotal)}
      </span>
    </div>
  </div>
</div>

        {/* Card Payment */}
        <div className="bg-[#111115] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <CreditCard size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Card Payment
            </h2>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <PaymentElement />
              <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl disabled:opacity-50 transition-opacity"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  `Pay ${fmt(grandTotal)}`
                )}
              </button>
            </form>
            {errorMsg && (
              <div className="mt-4 text-red-400 text-sm text-center p-3 bg-red-500/10 rounded-xl">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StripePaymentForm;