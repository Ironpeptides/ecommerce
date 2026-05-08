"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import useUser from "../../hooks/useUser";
import {
  Coins,
  ArrowRight,
  Loader2,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import TopUpModal, { CREDITS_PER_DOLLAR } from "./topUpModal";

// ── Types ──────────────────────────────────────────────────────────────────────
interface CreditsPaymentProps {
  cartItems: any[];
  coupon?: any;
  isSubscriber: boolean;
  pricingConfig: any;
  paymentMethod: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
const CreditsPayment = ({
  cartItems,
  coupon,
  isSubscriber,
  pricingConfig,
}: CreditsPaymentProps) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [placing, setPlacing] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useUser();

  

  // ── Price helpers ────────────────────────────────────────────────────────────
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
    const afterSubDiscount = afterCoupon - subDiscountAmt;

    const shipping =
      pricingConfig?.shippingCost &&
      afterSubDiscount < (pricingConfig.freeShippingMin || Infinity)
        ? pricingConfig.shippingCost
        : 0;

    const tax = pricingConfig?.salesTaxRate
      ? afterSubDiscount * pricingConfig.salesTaxRate
      : 0;

    const grandTotal = afterSubDiscount + shipping + tax;

    return { rawSubtotal, couponDiscount, subDiscountAmt, shipping, tax, grandTotal };
  };

  const breakdown = calculateBreakdown();

  // Convert dollar amount to credits needed
  const creditsNeeded = Math.ceil(breakdown.grandTotal * CREDITS_PER_DOLLAR);

  // ── Fetch wallet balance ─────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBalance(data.balance);
    } catch {
      setBalance(0);
      toast.error("Could not load wallet balance.");
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ── Place order with credits ─────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (balance === null || balance < creditsNeeded) {
      toast.error("Insufficient credits. Please top up first.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/order/credits-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: user.id,
          sessionData: cartItems,
          couponCode: coupon?.code,
          isSubscriber,
          creditsToDeduct: creditsNeeded,
          totalAmount: breakdown.grandTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order placement failed");

      toast.success("Order placed successfully!");
      router.push(`/payment-success?orderId=${data.orderId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const hasSufficientBalance = balance !== null && balance >= creditsNeeded;
  const shortfall = balance !== null ? Math.max(creditsNeeded - balance, 0) : creditsNeeded;
  const balanceInDollars = balance !== null ? balance / CREDITS_PER_DOLLAR : 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  if(!user){
      return <p>You are not authorized!</p>
  }
  return (
    <>
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950/40 to-[#1a1a1a] px-6 py-5 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Pay with Credits</h3>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Use your credits balance to complete this order instantly
          </p>
        </div>

        {/* Wallet balance card */}
        <div className="mx-6 mt-6 p-5 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Your Balance</p>
            <button
              onClick={fetchBalance}
              className="p-1 hover:bg-slate-800 rounded-md transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${balanceLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {balanceLoading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <span className="text-slate-500 text-sm">Loading…</span>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-bold text-white font-mono">
                  {balance?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  credits ≈{" "}
                  <span className="text-slate-400 font-mono">
                    {fmt(balanceInDollars)}
                  </span>
                </p>
              </div>

              {hasSufficientBalance ? (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Sufficient</span>
                </div>
              ) : (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">
                    Need {shortfall.toLocaleString()} more
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="bg-gray-900/50 mx-6 mt-4 rounded-xl border border-gray-800 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white font-mono">{fmt(breakdown.rawSubtotal)}</span>
          </div>
          {breakdown.couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Coupon Discount</span>
              <span className="text-emerald-400 font-mono">-{fmt(breakdown.couponDiscount)}</span>
            </div>
          )}
          {breakdown.subDiscountAmt > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Subscriber Discount ({((pricingConfig?.subDiscount || 0) * 100).toFixed(0)}%)
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
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{fmt(breakdown.grandTotal)}</p>
              <p className="text-xs text-slate-500 font-mono">
                = {creditsNeeded.toLocaleString()} credits
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {/* Top up button — always visible */}
          <button
            onClick={() => setShowTopUp(true)}
            className="w-full flex items-center justify-center gap-2 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15 text-blue-300 font-semibold py-3 rounded-xl transition-all duration-150 text-sm"
          >
            <Plus className="w-4 h-4" />
            {hasSufficientBalance ? "Add More Credits" : `Top Up Credits`}
          </button>

          {/* Place order — only active when balance is sufficient */}
          <button
            onClick={handlePlaceOrder}
            disabled={!hasSufficientBalance || placing || balanceLoading}
            className="w-full group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-150"
          >
            {placing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Placing Order…</span>
              </>
            ) : (
              <>
                <span>
                  {hasSufficientBalance
                    ? `Place Order — ${creditsNeeded.toLocaleString()} credits`
                    : `Insufficient Balance`}
                </span>
                {hasSufficientBalance && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Credits are deducted instantly when your order is confirmed
          </p>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && user && user.email && (
  <TopUpModal
    onClose={() => setShowTopUp(false)}
    currentBalance={balance ?? 0}
    neededCredits={shortfall}
    userEmail={user.email} 
    onBalanceUpdated={(newBalance) => {
      setBalance(newBalance);
      setShowTopUp(false);
    }}
  />
)}

    </>
  );
};

export default CreditsPayment;