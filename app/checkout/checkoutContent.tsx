// app/checkout/CheckoutContent.tsx
"use client";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
import { Elements } from "@stripe/react-stripe-js";
import "dotenv/config";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosinstance";
import { XCircle, Loader2, Shield, Zap, CreditCard, Bitcoin } from "lucide-react";
import CheckoutForm from "../../components/checkout/checkoutForm";

// ─── Pricing constants ────────────────────────────────────────────────────────
export const SALES_TAX_RATE     = 0.10;   // 10%
export const CREDIT_CARD_FEE    = 0.05;   // 5%  surcharge
export const CRYPTO_DISCOUNT    = 0.15;   // 15% discount
export const SUB_DISCOUNT       = 0.20;   // 20% subscriber discount
export const SHIPPING_COST      = 11.00;  // USPS 2-3 day
export const FREE_SHIPPING_MIN  = 200.00; // free shipping threshold

export type PaymentMethod = "stripe" | "crypto";

const CheckoutContent = () => {
  const [clientSecret, setClientSecret]   = useState("");
  const [cartItems,    setCartItems]      = useState<any[]>([]);
  const [coupon,       setCoupon]         = useState<any>();
  const [loading,      setLoading]        = useState(true);
  const [error,        setError]          = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto");

  // Subscription state — in production pull this from user profile/API
  const [isSubscriber, setIsSubscriber]   = useState(false);

  const searchParams = useSearchParams();
  const router       = useRouter();
  const sessionId    = searchParams.get("sessionId");

  /* useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("Invalid session. Please try again.");
        setLoading(false);
        return;
      }
      try {
        const verifyRes = await axiosInstance.get(
          `/order/api/verifying-payment-session?sessionId=${sessionId}`
        );
        const { totalAmount, sellers, cart, coupon } = verifyRes.data.session;

        if (!sellers || sellers.length === 0 || totalAmount === null)
          throw new Error("Invalid payment session data.");

        setCartItems(cart);
        setCoupon(coupon);

        // Only pre-fetch Stripe client secret when user picks card
        if (paymentMethod === "stripe") {
          const sellerStripeAccountId = sellers[0].stripeAccountId;
          const intentRes = await axiosInstance.post("/order/api/create-payment-intent", {
            amount: coupon?.discountAmount
              ? totalAmount - coupon.discountAmount
              : totalAmount,
            sellerStripeAccountId,
            sessionId,
          });
          setClientSecret(intentRes.data.clientSecret);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while preparing your payment.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
 */
  const appearance: Appearance = {
    theme: "night",
    variables: {
      colorPrimary:    "#7c3aed",
      colorBackground: "#0a0a0c",
      colorText:       "#f3f4f6",
      fontFamily:      "system-ui, sans-serif",
    },
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  /* if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
        <p className="text-gray-400 text-sm">Preparing your secure checkout…</p>
      </div>
    );
  }
 */
  // ── Error ────────────────────────────────────────────────────────────────────
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

  // ── Payment method selector shown before loading Stripe Elements ──────────
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 py-12 px-4 font-sans">
  {/* RUO Legal Disclaimer - More subtle and professional */}
  <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg border border-slate-800 bg-slate-900/50 flex items-start gap-4">
    <Shield size={18} className="text-slate-500 shrink-0 mt-0.5" />
    <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
      <span className="text-slate-300 font-bold">Research Use Only:</span> Not for Human Consumption · Not for Therapeutic or Veterinary Use ·
      Not Intended to Diagnose, Treat, Cure, or Prevent Any Disease.
    </p>
  </div>

  {/* Payment Method Selection */}
  <div className="max-w-2xl mx-auto mb-8">
    <label className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4 block">
      Select Payment Method
    </label>
    <div className="grid grid-cols-2 gap-4">
      {/* Crypto Option */}
      <button
        onClick={() => setPaymentMethod("crypto")}
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
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Save 15% Instant</p>
        </div>
      </button>

      {/* Stripe Option */}
      <button
        onClick={() => setPaymentMethod("stripe")}
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
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">+5% processing</p>
        </div>
      </button>
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
          <p className="text-sm font-bold text-slate-100">
            Institutional Membership
          </p>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-sm">
            $39/mo for priority supply and 20% flat discount on all laboratory materials.
          </p>
        </div>
      </div>
      <button
        onClick={() => setIsSubscriber(true)}
        className="shrink-0 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
      >
        Subscribe
      </button>
    </div>
  ) : (
    <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
        <Zap size={14} className="text-emerald-500" />
      </div>
      <p className="text-xs text-emerald-400 font-semibold tracking-wide">
        ACTIVE MEMBER <span className="mx-2 text-emerald-800">|</span> <span className="text-emerald-200">20% Research Discount Applied</span>
      </p>
    </div>
  )}

  {/* Form Container */}
  <div className="max-w-2xl mx-auto">
    {paymentMethod === "stripe" && clientSecret ? (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          clientSecret={clientSecret}
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}
          paymentMethod="stripe"
          isSubscriber={isSubscriber}
        />
      </Elements>
    ) : (
      <CheckoutForm
        clientSecret=""
        cartItems={cartItems}
        coupon={coupon}
        sessionId={sessionId}
        paymentMethod={paymentMethod}
        isSubscriber={isSubscriber}
      />
    )}
  </div>
</div>
  );
};

export default CheckoutContent;