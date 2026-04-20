import {
  Bitcoin, Copy, ExternalLink, HelpCircle, Loader2, Package, X, CheckCircle,
  Check,
} from "lucide-react";
import React, { useState } from "react";

const fmt = (n: number) => `$${n.toFixed(2)}`;

interface PricingConfig {
  salesTaxRate: number;
  creditCardFee: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
  cryptoWalletAddress?: string; // Added for direct wallet payments
}

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
  pricingConfig: PricingConfig | null;
}

const HOW_TO_STEPS = [
  {
    step: "01",
    title: "Get a crypto wallet",
    body: "Download Coinbase, MetaMask, or Trust Wallet. Create an account and buy USDT or USDC — stablecoins pegged 1:1 to USD so there's no volatility risk.",
  },
  {
    step: "02",
    title: "Choose payment method",
    body: "Generate a Cryptomus invoice for automated verification, or send directly to our wallet address.",
  },
  {
    step: "03",
    title: "Send the exact amount",
    body: "Send the exact amount shown from your wallet. Double-check the address before confirming.",
  },
  {
    step: "04",
    title: "Confirm payment",
    body: "Click 'I have paid' after sending. Our team will verify and confirm your order.",
  },
];

const CryptoPaymentForm = ({
  cartItems,
  coupon,
  sessionId,
  isSubscriber,
  pricingConfig,
}: CryptoPaymentFormProps) => {
  const [loading,          setLoading]          = useState(false);
  const [errorMsg,         setErrorMsg]         = useState<string | null>(null);
  const [cryptoInvoice,    setCryptoInvoice]    = useState<CryptoInvoice | null>(null);
  const [copied,           setCopied]           = useState(false);
  const [showHowTo,        setShowHowTo]        = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirming,       setConfirming]       = useState(false);

  // Helper function to get the correct price for an item
  const getItemPrice = (item: any) => {
    if (item.selectedVariant && item.selectedVariant.price !== undefined) {
      return Number(item.selectedVariant.price);
    }
    return Number(item.sale_price);
  };

  // Helper function to get display info
  const getDisplayInfo = (item: any) => {
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

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!pricingConfig) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  const {
    salesTaxRate,
    cryptoDiscount,
    subDiscount,
    shippingCost,
    freeShippingMin,
    creditCardFee,
    cryptoWalletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0", // Default example address
  } = pricingConfig;

  // ── Price maths with variant support ─────────────────────────────────────
  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * Number(item.quantity), 0
  );
  
  const couponDiscount  = coupon?.discountAmount ?? 0;
  const afterCoupon     = rawSubtotal - couponDiscount;
  const subDiscountAmt  = isSubscriber ? afterCoupon * subDiscount : 0;
  const afterSub        = afterCoupon - subDiscountAmt;
  const cryptoDiscountAmt = afterSub * cryptoDiscount;
  const afterPaymentAdj = afterSub - cryptoDiscountAmt;
  const shipping        = afterPaymentAdj >= freeShippingMin ? 0 : shippingCost;
  const tax             = afterPaymentAdj * salesTaxRate;
  const grandTotal      = afterPaymentAdj + shipping + tax;

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/order/create-crypto-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal.toFixed(2),
          currency: "USD",
          sessionId,
          order_id: sessionId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create crypto invoice");
      const data = await res.json();
      setCryptoInvoice(data);
    } catch {
      setErrorMsg("Failed to create crypto invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setConfirming(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/order/confirm-crypto-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          orderTotal: grandTotal.toFixed(2),
        }),
      });
      
      if (!res.ok) throw new Error("Failed to confirm payment");
      
      setPaymentConfirmed(true);
      // Optionally redirect after confirmation
      setTimeout(() => {
        window.location.href = `/payment-success?sessionId=${sessionId}`;
      }, 2000);
    } catch {
      setErrorMsg("Failed to confirm payment. Please contact support.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex justify-center items-start px-4 pb-16">
      <div className="w-full max-w-lg space-y-5">

        {/* ── How to pay with crypto ───────────────────────────────────────── */}
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

        {/* Expandable how-to panel */}
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
            </div>
          </div>
        )}

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/30">
            <Package size={16} className="text-emerald-500" />
            <h2 className="text-[11px] font-bold text-slate-100 uppercase tracking-[0.2em]">
              Order Summary
            </h2>
          </div>

          <div className="p-5">
            {/* Line Items with variant support */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item, i) => {
                const displayInfo = getDisplayInfo(item);
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
                    <span className="font-mono text-slate-200 font-medium">
                      {fmt(itemTotal)}
                    </span>
                  </div>
                );
              })}
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

              {subDiscountAmt > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-400">
                    Institutional Discount ({(subDiscount * 100).toFixed(0)}%)
                  </span>
                  <span className="text-emerald-500 font-mono">−{fmt(subDiscountAmt)}</span>
                </div>
              )}

              {cryptoDiscountAmt > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-400">
                    Asset Preference ({(cryptoDiscount * 100).toFixed(0)}%)
                  </span>
                  <span className="text-emerald-500 font-mono">−{fmt(cryptoDiscountAmt)}</span>
                </div>
              )}

              <div className="flex justify-between text-[13px] text-slate-400">
                <span>Logistics</span>
                <span className={`font-mono ${shipping === 0 ? "text-emerald-500 uppercase text-[11px] font-bold" : "text-slate-200"}`}>
                  {shipping === 0 ? "Complimentary" : fmt(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-[13px] text-slate-400">
                <span>Compliance Tax ({(salesTaxRate * 100).toFixed(0)}%)</span>
                <span className="text-slate-200 font-mono">{fmt(tax)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end pt-5 mt-5 border-t border-slate-800">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Amount (USD)
                </span>
                <span className="text-[11px] text-slate-600 italic">
                  Inclusive of all research discounts
                </span>
              </div>
              <span className="text-emerald-500 font-bold text-3xl font-mono tracking-tighter">
                {fmt(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Crypto Payment Options ───────────────────────────────────────── */}
        <div className="bg-[#111115] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Bitcoin size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Crypto Payment Options
            </h2>
          </div>
          <div className="p-5 space-y-4">

            {!cryptoInvoice ? (
              <>
                {/* Option 1: Cryptomus Invoice */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <ExternalLink size={12} />
                    <span>Option 1 — Automated Verification</span>
                  </div>
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 rounded-xl font-bold disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin w-4 h-4" /> Creating invoice…</>
                    ) : (
                      `Generate Cryptomus Invoice — ${fmt(grandTotal)}`
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Instant verification, automatic order confirmation
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#111115] text-slate-500">OR</span>
                  </div>
                </div>

                {/* Option 2: Direct Wallet Payment */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    <Bitcoin size={12} />
                    <span>Option 2 — Direct Wallet Transfer</span>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Amount to send</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {grandTotal.toFixed(2)} USDC
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-gray-400 text-xs">Our wallet address</p>
                      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-emerald-500/20">
                        <code className="flex-1 text-xs text-gray-200 break-all font-mono">
                          {cryptoWalletAddress}
                        </code>
                        <button
                       onClick={() => handleCopyAddress(cryptoWalletAddress)}
                       className="shrink-0 text-gray-400 hover:text-emerald-400 transition-colors"
                        title={copied ? "Copied!" : "Copy address"}
                         >
                          {copied ? (
                        <Check size={14} className="text-emerald-400" />
                         ) : (
                        <Copy size={14} />
                          )}
                           </button>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 rounded-lg p-2 border border-amber-500/20">
                      <p className="text-[11px] text-amber-400/80 text-center">
                        ⚠️ Send EXACT amount shown. Network fees are your responsibility.
                      </p>
                    </div>
                  </div>

                  {!paymentConfirmed ? (
                    <button
                      onClick={handleConfirmPayment}
                      disabled={confirming}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {confirming ? (
                        <><Loader2 className="animate-spin w-4 h-4" /> Confirming…</>
                      ) : (
                        <>I have paid — Please confirm my order <CheckCircle size={16} /></>
                      )}
                    </button>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-emerald-400 text-sm font-semibold">Payment Confirmed!</p>
                      <p className="text-emerald-400/70 text-xs">Redirecting to confirmation page...</p>
                    </div>
                  )}
                  
                  <p className="text-[11px] text-slate-500 text-center">
                    After sending, click the button above to notify us. Our team will verify your transaction.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                  <p className="text-emerald-400 text-sm font-semibold">Cryptomus Invoice Generated!</p>
                </div>
                
                <a
                  href={cryptoInvoice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                >
                  Open Cryptomus Payment Page <ExternalLink size={15} />
                </a>

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
                        onClick={() => handleCopyAddress(cryptoInvoice.address)}
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