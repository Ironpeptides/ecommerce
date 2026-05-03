"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import useUser from "../../hooks/useUser";
import {
  CheckCircle,
  Copy,
  AlertCircle,
  ArrowRight,
  Loader2,
  Bitcoin,
  DollarSign,
  HelpCircle,
  X,
  BookOpen,
  Smartphone,
  Shield,
  Clock,
  Send,
  QrCode,
  Wallet,
  ExternalLink,
  Search,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ManualPaymentProps {
  cartItems: any[];
  coupon?: any;
  isSubscriber: boolean;
  pricingConfig: any;
  paymentMethod: string;
}

interface PaymentDetails {
  address: string;
  identifier?: string;
  instructions: string;
  network?: string;
  minAmount?: number;
}

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

// ── Method config ──────────────────────────────────────────────────────────────
const METHOD_CONFIG = {
  manual_crypto: {
    label: "Crypto",
    Icon: Bitcoin,
    iconColor: "text-orange-400",
    accentColor: "text-orange-500",
    headerGradient: "from-orange-950/40 to-[#1a1a1a]",
    headerBorder: "border-orange-900/30",
    addressLabel: "Bitcoin Address",
    fallbackAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    fallbackInstructions:
      "Send the exact amount in BTC to the address below. The network may take 10–30 minutes to confirm.",
  },
  venmo: {
    label: "Venmo",
    Icon: DollarSign,
    iconColor: "text-blue-400",
    accentColor: "text-blue-500",
    headerGradient: "from-blue-950/40 to-[#1a1a1a]",
    headerBorder: "border-blue-900/30",
    addressLabel: "Venmo Username",
    fallbackAddress: "@YourVenmoHandle",
    fallbackInstructions:
      "Search for the username above in your Venmo app and send the exact amount. Include your Order ID in the note.",
  },
  cashapp: {
    label: "Cash App",
    Icon: DollarSign,
    iconColor: "text-emerald-400",
    accentColor: "text-emerald-500",
    headerGradient: "from-emerald-950/40 to-[#1a1a1a]",
    headerBorder: "border-emerald-900/30",
    addressLabel: "Cash App $Cashtag",
    fallbackAddress: "$YourCashtag",
    fallbackInstructions:
      "Open Cash App, tap the $ icon, search the $Cashtag above and send the exact amount. Include your Order ID in the note.",
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────────
const ManualPaymentForm = ({
  cartItems,
  coupon,
  isSubscriber,
  pricingConfig,
  paymentMethod,
}: ManualPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const config =
    METHOD_CONFIG[paymentMethod as keyof typeof METHOD_CONFIG] ??
    METHOD_CONFIG["manual_crypto"];

  const isCrypto = paymentMethod === "manual_crypto";

  // ── Price helpers ────────────────────────────────────────────────────────────
  const getItemPrice = (item: any) => {
    if (item.selectedVariant?.price !== undefined) return Number(item.selectedVariant.price);
    return Number(item.sale_price || item.price || 0);
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const calculateBreakdown = () => {
    const rawSubtotal = cartItems.reduce((sum, item) => {
      return sum + getItemPrice(item) * (Number(item.quantity) || 1);
    }, 0);

    const couponDiscount = coupon?.discountAmount || coupon?.discountPercent
      ? coupon.discountAmount || rawSubtotal * (coupon.discountPercent / 100)
      : 0;
    const afterCoupon = rawSubtotal - couponDiscount;

    const subDiscountAmt =
      isSubscriber && pricingConfig?.subDiscount
        ? afterCoupon * pricingConfig.subDiscount
        : 0;
    const afterSubDiscount = afterCoupon - subDiscountAmt;

    const paymentDiscount =
      isCrypto && pricingConfig?.cryptoDiscount
        ? afterSubDiscount * pricingConfig.cryptoDiscount
        : 0;
    const afterPaymentDiscount = afterSubDiscount - paymentDiscount;

    const shipping =
      pricingConfig?.shippingCost &&
      afterPaymentDiscount < (pricingConfig.freeShippingMin || Infinity)
        ? pricingConfig.shippingCost
        : 0;

    const tax = pricingConfig?.salesTaxRate
      ? afterPaymentDiscount * pricingConfig.salesTaxRate
      : 0;

    const grandTotal = afterPaymentDiscount + shipping + tax;

    return {
      rawSubtotal,
      couponDiscount,
      subDiscountAmt,
      paymentDiscount,
      shipping,
      tax,
      grandTotal,
    };
  };

  const breakdown = calculateBreakdown();

  // ── Fetch payment details ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setFetchingDetails(true);
      try {
        const response = await fetch(`/api/payment-details?method=${paymentMethod}`);
        const data = await response.json();
        if (response.ok) {
          setPaymentDetails(data);
        } else throw new Error(data.error);
      } catch {
        setPaymentDetails({
          address: config.fallbackAddress,
          identifier: config.label,
          instructions: config.fallbackInstructions,
          network: isCrypto ? "Bitcoin Network" : undefined,
          minAmount: isCrypto ? 0.001 : undefined,
        });
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchPaymentDetails();
  }, [paymentMethod]);

  // ── Tutorial steps ───────────────────────────────────────────────────────────
  const getTutorialSteps = (): TutorialStep[] => {
    if (paymentMethod === "venmo") {
      return [
        { icon: Smartphone, title: "Download Venmo", description: "Download the Venmo app from the App Store or Google Play. Create an account if you don't have one." },
        { icon: Search, title: "Find Our Account", description: `Search for "${paymentDetails?.address || "@YourVenmoHandle"}" in Venmo. Verify you have the correct account.` },
        { icon: Send, title: "Send Payment", description: `Tap 'Pay' and enter the exact amount: ${fmt(breakdown.grandTotal)}. Add your Order ID in the note field.` },
        { icon: CheckCircle, title: "Confirm & Return", description: "Review the details, tap 'Pay', then return here and click 'I Have Paid'." },
      ];
    }
    if (paymentMethod === "cashapp") {
      return [
        { icon: Smartphone, title: "Open Cash App", description: "Open Cash App on your phone. Download it from the App Store or Google Play if needed." },
        { icon: Search, title: "Find Our $Cashtag", description: `Tap the $ icon and search for "${paymentDetails?.address || "$YourCashtag"}". Verify you have the correct account.` },
        { icon: Send, title: "Send Payment", description: `Enter the exact amount: ${fmt(breakdown.grandTotal)}. Add your Order ID in the note.` },
        { icon: CheckCircle, title: "Confirm & Return", description: "Tap 'Pay', then come back here and click 'I Have Paid'." },
      ];
    }
    // Default crypto
    return [
      { icon: Wallet, title: "Get a Crypto Wallet", description: "Download Trust Wallet, MetaMask, or Coinbase Wallet. These apps let you store and send Bitcoin." },
      { icon: Bitcoin, title: "Buy Bitcoin (BTC)", description: "Purchase Bitcoin via the wallet app or an exchange like Coinbase or Kraken." },
      { icon: QrCode, title: "Copy Our Address", description: "Copy the Bitcoin address shown below — this is where you send the payment." },
      { icon: Send, title: "Send the Payment", description: `In your wallet, choose 'Send' → 'Bitcoin' → paste our address → enter ${fmt(breakdown.grandTotal)} worth of BTC → confirm.` },
      { icon: Clock, title: "Wait for Confirmation", description: "Bitcoin transactions take 10–30 minutes to confirm. Once done, return here and click 'I Have Paid'." },
    ];
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopyAddress = () => {
    if (paymentDetails?.address) {
      navigator.clipboard.writeText(paymentDetails.address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleManualSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a payment.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/order/manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: user.id,
          paymentMethod,
          sessionData: cartItems,
          couponCode: coupon?.code,
          isSubscriber,
          notes: `User confirmed ${config.label} payment to: ${paymentDetails?.address}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      toast.success("Payment submitted for verification!");
      router.push(`/payment-success?orderId=${data.orderId}&manual=true`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tutorialSteps = getTutorialSteps();

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (fetchingDetails) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <p className="text-gray-400">Loading payment details…</p>
        </div>
      </div>
    );
  }

  const { Icon } = config;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">

        {/* Header */}
        <div
          className={`bg-gradient-to-r ${config.headerGradient} px-6 py-5 border-b ${config.headerBorder}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
              <h3 className="text-xl font-semibold text-white">
                {config.label} Payment
              </h3>
            </div>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Need Help?</span>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Complete your payment using the instructions below
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800 space-y-2">
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
          {breakdown.paymentDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Crypto Discount ({((pricingConfig?.cryptoDiscount || 0) * 100).toFixed(0)}%)
              </span>
              <span className="text-emerald-400 font-mono">-{fmt(breakdown.paymentDiscount)}</span>
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
            <span className="text-gray-300 font-medium">Total Due</span>
            <span className="text-2xl font-bold text-white">{fmt(breakdown.grandTotal)}</span>
          </div>
        </div>

        {/* Help hint */}
        <div className="px-6 pt-6">
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">
                New to {config.label} payments?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Click "Need Help?" above for a step-by-step guide.
              </p>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-gray-300 text-sm leading-relaxed">
                {paymentDetails?.instructions}
              </p>
              {isCrypto && paymentDetails?.network && (
                <p className="text-xs text-gray-500">Network: {paymentDetails.network}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              {config.addressLabel}
            </label>
            <div className="relative">
              <div className="bg-gray-900 rounded-lg p-4 pr-24 border border-gray-700 font-mono text-sm text-gray-300 break-all">
                {paymentDetails?.address}
              </div>
              <button
                onClick={handleCopyAddress}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2 border border-gray-700"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-gray-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-300">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500 mb-1">Important</p>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Send the exact amount shown above</li>
                {isCrypto ? (
                  <>
                    <li>Transactions are irreversible — double-check the address</li>
                    <li>Payment may take 10–30 minutes to confirm</li>
                  </>
                ) : (
                  <>
                    <li>Include your Order ID in the payment note</li>
                    <li>Allow 1–2 hours for manual verification</li>
                  </>
                )}
                <li>Your order ships after admin verification</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <span>I Have Paid — Submit for Verification</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Having issues?{" "}
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact Support
            </button>
          </p>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    How to Pay with {config.label}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Follow these steps to complete your payment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {tutorialSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                        Step {i + 1}
                      </span>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pro tips */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 flex items-start gap-3 mt-4">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400 mb-2">Pro Tips</p>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    {isCrypto ? (
                      <>
                        <li>Start with a small test if you're unsure</li>
                        <li>Always double-check the address before sending</li>
                        <li>Save your transaction ID for reference</li>
                      </>
                    ) : (
                      <>
                        <li>Take a screenshot of your payment confirmation</li>
                        <li>Double-check the username/cashtag before sending</li>
                        <li>Contact support if not verified within 2 hours</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  handleCopyAddress();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualPaymentForm;