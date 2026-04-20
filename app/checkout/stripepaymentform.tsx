import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Bitcoin, CreditCard, HelpCircle, Loader2, Package, X } from "lucide-react";
import React, { useState } from "react";

const fmt = (n: number) => `$${n.toFixed(2)}`;

const HOW_TO_STEPS = [
  {
    step: "01",
    title: "Choose a wallet",
    body: "Download a crypto wallet like Coinbase Wallet, MetaMask, or Trust Wallet — free on iOS & Android.",
  },
  {
    step: "02",
    title: "Add funds",
    body: "Buy USDC or ETH directly inside your wallet with a debit card, or transfer from an exchange like Coinbase.",
  },
  {
    step: "03",
    title: "Click 'Pay with Crypto'",
    body: "Select the crypto option at checkout, scan the QR code or copy the address, and confirm the transaction.",
  },
  {
    step: "04",
    title: "Done — enjoy your discount",
    body: `Your order is confirmed the moment the transaction is detected on-chain. No waiting, no card fees.`,
  },
];

interface PricingConfig {
  salesTaxRate: number;
  creditCardFee: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface StripePaymentFormProps {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  isSubscriber: boolean;
  pricingConfig: PricingConfig | null;
  onSwitchToCrypto?: () => void;
}

const StripePaymentForm = ({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
  isSubscriber,
  pricingConfig,
  onSwitchToCrypto,
}: StripePaymentFormProps) => {
  const stripe   = useStripe();
  const elements = useElements();

  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [showHowTo,  setShowHowTo]  = useState(false);

  // Helper function to get the correct price for an item
  const getItemPrice = (item: any) => {
    // If there's a selected variant with a price, use that
    if (item.selectedVariant && item.selectedVariant.price !== undefined) {
      return Number(item.selectedVariant.price);
    }
    // Otherwise fall back to sale_price
    return Number(item.sale_price);
  };

  // Helper function to get the display price info
  const getDisplayPrice = (item: any) => {
    if (item.selectedVariant && item.selectedVariant.price !== undefined) {
      return {
        price: item.selectedVariant.price,
        label: `${item.title} (${item.selectedVariant.value})`
      };
    }
    return {
      price: item.sale_price,
      label: item.title
    };
  };

  // ── Guard: render nothing meaningful until config is ready ────────────────
  if (!pricingConfig) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-violet-500 w-8 h-8" />
      </div>
    );
  }

  const {
    salesTaxRate,
    creditCardFee,
    subDiscount,
    shippingCost,
    freeShippingMin,
    cryptoDiscount,
  } = pricingConfig;

  // ── Price maths ───────────────────────────────────────────────────────────
  // Use the item's quantity (product quantity) and the correct price (variant price if available)
  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * Number(item.quantity), 0
  );
  
  const couponDiscount  = coupon?.discountAmount ?? 0;
  const afterCoupon     = rawSubtotal - couponDiscount;
  const subDiscountAmt  = isSubscriber ? afterCoupon * subDiscount : 0;
  const afterSub        = afterCoupon - subDiscountAmt;
  const ccFee           = afterSub * creditCardFee;
  const afterPaymentAdj = afterSub + ccFee;
  const shipping        = afterPaymentAdj >= freeShippingMin ? 0 : shippingCost;
  const tax             = afterPaymentAdj * salesTaxRate;
  const grandTotal      = afterPaymentAdj + shipping + tax;

  const isSetupIntent = clientSecret?.startsWith("seti_");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const returnUrl = `${window.location.origin}/payment-success?sessionId=${sessionId}`;

    const result = isSetupIntent
      ? await stripe.confirmSetup({
          elements,
          confirmParams: { return_url: returnUrl },
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: returnUrl },
        });

    if (result.error) {
      setErrorMsg(result.error.message ?? "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-start px-4 pb-16">
      <div className="w-full max-w-lg space-y-5">

        {/* ── Crypto nudge ────────────────────────────────────────────────── */}
        <button
          onClick={() => setShowHowTo((p) => !p)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.07] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <HelpCircle size={15} className="text-emerald-500 shrink-0" />
            <span className="text-[12px] text-slate-400 group-hover:text-slate-300 transition-colors text-left">
              New to crypto? Save{" "}
              <span className="text-emerald-400 font-bold">
                {(cryptoDiscount * 100).toFixed(0)}%
              </span>{" "}
              vs card — and skip the{" "}
              <span className="text-amber-400">{(creditCardFee * 100).toFixed(0)}% surcharge</span>.
            </span>
          </div>
          <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider shrink-0 underline underline-offset-2">
            {showHowTo ? "Hide ↑" : "See how →"}
          </span>
        </button>

        {/* ── Expandable how-to panel ──────────────────────────────────────── */}
        {showHowTo && (
          <div className="rounded-xl border border-slate-800 bg-[#0c0c0e] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bitcoin size={15} className="text-amber-400" />
                <h3 className="text-[11px] font-bold text-slate-100 uppercase tracking-[0.2em]">
                  How to pay with crypto
                </h3>
              </div>
              <button
                onClick={() => setShowHowTo(false)}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {HOW_TO_STEPS.map(({ step, title, body }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-[11px] font-black text-emerald-600 tracking-widest shrink-0 mt-0.5 w-5">
                    {step}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200 mb-0.5">{title}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
              {/* Switch to crypto CTA */}
              <button
                onClick={onSwitchToCrypto}
                className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 text-emerald-400 text-[12px] font-bold uppercase tracking-widest transition-colors"
              >
                Switch to Crypto Checkout →
              </button>
            </div>
          </div>
        )}

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/30">
            <Package size={16} className="text-emerald-500" />
            <h2 className="text-[11px] font-bold text-slate-100 uppercase tracking-[0.2em]">
              Order Summary — Credit Card
            </h2>
          </div>

          <div className="p-5">
            {/* Line Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item, i) => {
                const displayInfo = getDisplayPrice(item);
                const itemPrice = getItemPrice(item);
                const itemTotal = itemPrice * Number(item.quantity);
                
                return (
                  <div key={i} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-4">
                      <p className="text-slate-300 font-medium line-clamp-1">{displayInfo.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                        Unit Price: {fmt(itemPrice)} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-slate-200 font-medium text-right">
                      {fmt(itemTotal)}
                    </span>
                  </div>
                );
              })}
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

              {subDiscountAmt > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-400">
                    Institutional Membership ({(subDiscount * 100).toFixed(0)}%)
                  </span>
                  <span className="text-emerald-500 font-mono">−{fmt(subDiscountAmt)}</span>
                </div>
              )}

              <div className="flex justify-between text-[13px]">
                <span className="text-slate-400">
                  Card Processing Surcharge ({(creditCardFee * 100).toFixed(0)}%)
                </span>
                <span className="text-amber-500 font-mono">+{fmt(ccFee)}</span>
              </div>

              <div className="flex justify-between text-[13px] text-slate-400">
                <span>Logistics & Handling</span>
                <span className={`font-mono ${shipping === 0 ? "text-emerald-500 uppercase text-[11px] font-bold" : "text-slate-200"}`}>
                  {shipping === 0 ? "Complimentary" : fmt(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-[13px] text-slate-400">
                <span>Tax Jurisdiction ({(salesTaxRate * 100).toFixed(0)}%)</span>
                <span className="text-slate-200 font-mono">{fmt(tax)}</span>
              </div>
            </div>

            {/* Grand Total */}
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

        {/* ── Card Payment ─────────────────────────────────────────────────── */}
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
                {loading
                  ? <Loader2 className="animate-spin w-4 h-4" />
                  : `Pay ${fmt(grandTotal)}`
                }
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