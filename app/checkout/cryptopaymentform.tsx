import axiosInstance from "../../utils/axiosinstance";
import {
  Bitcoin, Copy, ExternalLink, Loader2, Package,
} from "lucide-react";
import React, { useState } from "react";
import {
  CRYPTO_DISCOUNT,
  FREE_SHIPPING_MIN,
  SALES_TAX_RATE,
  SHIPPING_COST,
  SUB_DISCOUNT,
} from "./CheckoutContent";

const fmt = (n: number) => `$${n.toFixed(2)}`;

interface CryptoInvoice {
  url: string;
  address: string;
  currency: string;
  network: string;
  amount: string;
  uuid: string;
}

interface CryptoPaymentFormProps {
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  isSubscriber: boolean;
}

const CryptoPaymentForm = ({
  cartItems,
  coupon,
  sessionId,
  isSubscriber,
}: CryptoPaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cryptoInvoice, setCryptoInvoice] = useState<CryptoInvoice | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Price maths ────────────────────────────────────────────────────────────
  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.sale_price) * Number(item.quantity),
    0
  );
  const couponDiscount = coupon?.discountAmount ?? 0;
  const afterCoupon = rawSubtotal - couponDiscount;
  const subDiscount = isSubscriber ? afterCoupon * SUB_DISCOUNT : 0;
  const afterSub = afterCoupon - subDiscount;
  const cryptoDiscount = afterSub * CRYPTO_DISCOUNT;
  const afterPaymentAdj = afterSub - cryptoDiscount;
  const shipping = afterPaymentAdj >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const tax = afterPaymentAdj * SALES_TAX_RATE;
  const grandTotal = afterPaymentAdj + shipping + tax;

  const handleCopyAddress = () => {
    if (!cryptoInvoice) return;
    navigator.clipboard.writeText(cryptoInvoice.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosInstance.post("/api/order/create-crypto-invoice", {
        amount: grandTotal.toFixed(2),
        currency: "USD",
        sessionId,
        order_id: sessionId,
      });
      setCryptoInvoice(res.data);
    } catch {
      setErrorMsg("Failed to create crypto invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start px-4 pb-16">
      <div className="w-full max-w-lg space-y-5">

        {/* Order Summary */}
        <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
  {/* Header */}
  <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/30">
    <Package size={16} className="text-emerald-500" />
    <h2 className="text-[11px] font-bold text-slate-100 uppercase tracking-[0.2em]">
      Order Summary
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
              Qty: {item.quantity} · {fmt(item.sale_price)} per unit
            </p>
          </div>
          <span className="font-mono text-slate-200 font-medium">
            {fmt(item.quantity * item.sale_price)}
          </span>
        </div>
      ))}
    </div>

    {/* Financial Breakdown */}
    <div className="border-t border-slate-800/60 pt-4 space-y-2.5">
      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Subtotal</span>
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
          <span className="text-slate-400">Institutional Discount ({(SUB_DISCOUNT * 100).toFixed(0)}%)</span>
          <span className="text-emerald-500 font-mono">−{fmt(subDiscount)}</span>
        </div>
      )}

      {cryptoDiscount > 0 && (
        <div className="flex justify-between text-[13px]">
          <span className="text-slate-400">Asset Preference ({(CRYPTO_DISCOUNT * 100).toFixed(0)}%)</span>
          <span className="text-emerald-500 font-mono">−{fmt(cryptoDiscount)}</span>
        </div>
      )}

      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Logistics</span>
        <span className={`font-mono ${shipping === 0 ? "text-emerald-500 uppercase text-[11px] font-bold" : "text-slate-200"}`}>
          {shipping === 0 ? "Complimentary" : fmt(shipping)}
        </span>
      </div>

      <div className="flex justify-between text-[13px] text-slate-400">
        <span>Compliance Tax ({(SALES_TAX_RATE * 100).toFixed(0)}%)</span>
        <span className="text-slate-200 font-mono">{fmt(tax)}</span>
      </div>
    </div>

    {/* Grand Total */}
    <div className="flex justify-between items-end pt-5 mt-5 border-t border-slate-800">
      <div>
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Total Amount (USD)
        </span>
        <span className="text-[11px] text-slate-600 italic">Inclusive of all research discounts</span>
      </div>
      <span className="text-emerald-500 font-bold text-3xl font-mono tracking-tighter">
        {fmt(grandTotal)}
      </span>
    </div>
  </div>
</div>

        {/* Crypto Payment */}
        <div className="bg-[#111115] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Bitcoin size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Crypto Payment
            </h2>
          </div>
          <div className="p-5 space-y-4">

            {!cryptoInvoice ? (
              <button
                onClick={handleGenerateInvoice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 rounded-md  font-bold r disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <><Loader2 className="animate-spin w-4 h-4" /> Creating invoice…</>
                ) : (
                  `Generate Crypto Invoice — ${fmt(grandTotal)}`
                )}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Open payment page CTA */}
                <a
                  href={cryptoInvoice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                >
                  Open Cryptomus Payment Page <ExternalLink size={15} />
                </a>

                {/* Manual payment details */}
                <div className="bg-black/30 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Network</span>
                    <span className="text-white font-medium">
                      {cryptoInvoice.network} ({cryptoInvoice.currency})
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Amount</span>
                    <span className="text-white font-medium">
                      {cryptoInvoice.amount} {cryptoInvoice.currency}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-gray-400">Wallet address</p>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                      <code className="flex-1 text-xs text-gray-200 break-all font-mono">
                        {cryptoInvoice.address}
                      </code>
                      <button
                        onClick={handleCopyAddress}
                        className="shrink-0 text-gray-400 hover:text-white transition-colors"
                        title="Copy address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-emerald-400 text-right">Address copied!</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Send the exact amount shown. Payment is confirmed on-chain automatically.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="text-red-400 text-sm text-center p-3 bg-red-500/10 rounded-xl">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CryptoPaymentForm;