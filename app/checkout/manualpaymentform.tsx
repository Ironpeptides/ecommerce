import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useUser from '../../hooks/useUser';
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
  Search
} from "lucide-react";

import { useSearchParams } from "next/navigation";

// inside your component:

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

const ManualPaymentForm = ({ 
  cartItems, 
  coupon, 
  isSubscriber, 
  pricingConfig, 
  paymentMethod 
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


  console.log("ManualPaymentForm props:", { cartItems, coupon, isSubscriber, pricingConfig, paymentMethod });

  // Helper function to get the correct price for an item
  const getItemPrice = (item: any) => {
    if (item.selectedVariant?.price !== undefined) {
      return Number(item.selectedVariant.price);
    }
    return Number(item.sale_price || item.price || 0);
  };

  // Helper function to format currency
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  // Calculate breakdown with proper order of operations
  const calculateBreakdown = () => {
    // 1. Calculate raw subtotal using variant prices
    const rawSubtotal = cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);

    // 2. Apply coupon discount
    const couponDiscount = coupon?.discountAmount || coupon?.discountPercent 
      ? (coupon.discountAmount || (rawSubtotal * (coupon.discountPercent / 100)))
      : 0;
    const afterCoupon = rawSubtotal - couponDiscount;

    // 3. Apply subscriber discount
    const subDiscountAmt = isSubscriber && pricingConfig?.subDiscount 
      ? afterCoupon * (pricingConfig.subDiscount / 100)
      : 0;
    const afterSubDiscount = afterCoupon - subDiscountAmt;

    // 4. Apply payment method discount (crypto only)
    const paymentDiscount = (paymentMethod === "crypto" || paymentMethod === "manual_crypto") && pricingConfig?.cryptoDiscount
      ? afterSubDiscount * (pricingConfig.cryptoDiscount / 100)
      : 0;
    const afterPaymentDiscount = afterSubDiscount - paymentDiscount;

    // 5. Calculate shipping (based on discounted subtotal)
    const shipping = pricingConfig?.shippingCost && afterPaymentDiscount < (pricingConfig.freeShippingMin || Infinity)
      ? pricingConfig.shippingCost
      : 0;

    // 6. Calculate tax (on discounted subtotal, before shipping)
    const tax = pricingConfig?.salesTaxRate 
      ? afterPaymentDiscount * (pricingConfig.salesTaxRate / 100)
      : 0;

    // 7. Calculate grand total
    const grandTotal = afterPaymentDiscount + shipping + tax;

    return {
      rawSubtotal,
      couponDiscount,
      afterCoupon,
      subDiscountAmt,
      afterSubDiscount,
      paymentDiscount,
      afterPaymentDiscount,
      shipping,
      tax,
      grandTotal
    };
  };

  const breakdown = calculateBreakdown();
  const totalAmount = breakdown.grandTotal.toFixed(2);

  // Tutorial content for different payment methods
  const getTutorialSteps = (): TutorialStep[] => {
    if (paymentMethod === "venmo") {
      return [
        {
          icon: Smartphone,
          title: "Download Venmo",
          description: "Download the Venmo app from the App Store (iOS) or Google Play Store (Android). Create an account if you don't have one."
        },
        {
          icon: Search,
          title: "Find Our Account",
          description: `Search for "${paymentDetails?.address || '@YourVenmoHandle'}" in the Venmo app. Make sure you've found the correct account.`
        },
        {
          icon: Send,
          title: "Send Payment",
          description: `Click 'Pay' and enter the exact amount: ${fmt(breakdown.grandTotal)}. Add your Order ID in the 'What's it for?' field.`
        },
        {
          icon: CheckCircle,
          title: "Confirm Payment",
          description: "Review the payment details and click 'Pay'. Once completed, return here and click 'I Have Paid'."
        }
      ];
    } else {
      return [
        {
          icon: Wallet,
          title: "Get a Crypto Wallet",
          description: "Download a crypto wallet like Trust Wallet, MetaMask, or Coinbase Wallet. These apps let you store and send Bitcoin."
        },
        {
          icon: Bitcoin,
          title: "Buy Bitcoin (BTC)",
          description: "Purchase Bitcoin through the wallet app or an exchange like Coinbase, Binance, or Kraken. You'll need at least the minimum amount."
        },
        {
          icon: QrCode,
          title: "Copy Our Address",
          description: "Copy our Bitcoin address (click the copy button below). This is where you'll send the payment."
        },
        {
          icon: Send,
          title: "Send the Payment",
          description: `In your wallet, choose 'Send' → 'Bitcoin' → paste our address → enter ${fmt(breakdown.grandTotal)} worth of BTC → confirm and send.`
        },
        {
          icon: Clock,
          title: "Wait for Confirmation",
          description: "Bitcoin transactions take 10-30 minutes to confirm. Once confirmed, return and click 'I Have Paid'."
        }
      ];
    }
  };

  // Video tutorial links (optional)
  const getVideoTutorial = () => {
    if (paymentMethod === "venmo") {
      return "https://www.youtube.com/watch?v=example-venmo-tutorial";
    } else {
      return "https://www.youtube.com/watch?v=example-bitcoin-tutorial";
    }
  };

  // Fetch payment details from API
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setFetchingDetails(true);
      try {
        const response = await fetch(`/api/payment-details?method=${paymentMethod}`);
        const data = await response.json();
        if (response.ok) {
          setPaymentDetails(data);
        } else {
          throw new Error(data.error || "Failed to fetch payment details");
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        // Fallback details
        if (paymentMethod === "venmo") {
          setPaymentDetails({
            address: "@YourVenmoHandle",
            identifier: "Venmo",
            instructions: "Send the exact amount to the Venmo username above. Include your order ID in the payment note.",
            minAmount: 1
          });
        } else {
          setPaymentDetails({
            address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            identifier: "Bitcoin",
            instructions: "Send the exact amount in BTC to the address above. The network may take 10-30 minutes to confirm.",
            network: "Bitcoin Network",
            minAmount: 0.001
          });
        }
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentMethod]);

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
      toast.error("You must be logged in to submit a manual payment.");
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
          notes: `User confirmed payment via ${paymentMethod} to address: ${paymentDetails?.address}`,
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

  const isCrypto = paymentMethod === "crypto" || paymentMethod === "manual_crypto";
  const isVenmo = paymentMethod === "venmo";
  const tutorialSteps = getTutorialSteps();

  if (fetchingDetails) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <p className="text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-[#1a1a1a] px-6 py-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCrypto ? (
                <Bitcoin className="w-6 h-6 text-orange-500" />
              ) : (
                <DollarSign className="w-6 h-6 text-green-500" />
              )}
              <h3 className="text-xl font-semibold text-white capitalize">
                {isCrypto ? "Crypto Payment" : "Venmo Payment"}
              </h3>
            </div>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Need Help?</span>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Complete your payment using the instructions below
          </p>
        </div>

        {/* Amount Summary with Full Breakdown */}
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800">
          <div className="space-y-2">
            {/* Raw Subtotal */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-mono">{fmt(breakdown.rawSubtotal)}</span>
            </div>

            {/* Coupon Discount (if applicable) */}
            {breakdown.couponDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Coupon Discount</span>
                <span className="text-green-400 font-mono">-{fmt(breakdown.couponDiscount)}</span>
              </div>
            )}

            {/* Subscriber Discount (if applicable) */}
            {breakdown.subDiscountAmt > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  Subscriber Discount ({((pricingConfig?.subDiscount || 0)).toFixed(0)}%)
                </span>
                <span className="text-green-400 font-mono">-{fmt(breakdown.subDiscountAmt)}</span>
              </div>
            )}

            {/* Crypto Discount (if applicable) */}
            {breakdown.paymentDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  Crypto Discount ({((pricingConfig?.cryptoDiscount || 0)).toFixed(0)}%)
                </span>
                <span className="text-green-400 font-mono">-{fmt(breakdown.paymentDiscount)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Shipping</span>
              <span className={`font-mono ${breakdown.shipping === 0 ? 'text-green-400' : 'text-white'}`}>
                {breakdown.shipping === 0 ? 'FREE' : fmt(breakdown.shipping)}
              </span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                Tax ({((pricingConfig?.salesTaxRate || 0)).toFixed(1)}%)
              </span>
              <span className="text-white font-mono">{fmt(breakdown.tax)}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 my-2"></div>

            {/* Grand Total */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-white">
                {fmt(breakdown.grandTotal)}
                {isCrypto && paymentDetails?.minAmount && (
                  <span className="text-xs text-gray-400 ml-2">
                    (Min. {paymentDetails.minAmount} BTC)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="px-6 pt-6">
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-400">New to {isCrypto ? "crypto payments" : "Venmo"}?</p>
                <p className="text-xs text-gray-400">
                  Click the "Need Help?" button above for a step-by-step tutorial on how to send {isCrypto ? "Bitcoin" : "Venmo payments"}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {paymentDetails?.instructions}
                </p>
                {isCrypto && paymentDetails?.network && (
                  <p className="text-xs text-gray-500">
                    Network: {paymentDetails.network}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Box */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              {isCrypto ? "Bitcoin Address" : "Venmo Username"}
            </label>
            <div className="relative">
              <div className="bg-gray-900 rounded-lg p-4 pr-24 border border-gray-700 font-mono text-sm text-gray-300 break-all">
                {paymentDetails?.address}
              </div>
              <button
                onClick={handleCopyAddress}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors flex items-center space-x-2 border border-gray-700"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
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

          {/* Warning Box */}
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-500">Important:</p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  {isCrypto ? (
                    <>
                      <li>Send the exact amount shown above</li>
                      <li>Transactions are irreversible - double-check the address</li>
                      <li>Include your Order ID in the transaction memo (if available)</li>
                      <li>Payment may take 10-30 minutes to confirm</li>
                    </>
                  ) : (
                    <>
                      <li>Send the exact amount shown above</li>
                      <li>Include your Order ID in the payment note</li>
                      <li>Your order will be processed after verification</li>
                      <li>Allow 1-2 hours for manual verification</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>I Have Paid — Confirm My Payment</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>

          {/* Support Link */}
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    How to Pay with {isCrypto ? "Bitcoin" : "Venmo"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Steps */}
              <div className="space-y-6">
                {tutorialSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          Step {index + 1}
                        </span>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Tutorial Link */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">
                        Watch Video Tutorial
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Prefer video? Watch our step-by-step video guide.
                      </p>
                      <button
                        onClick={() => window.open(getVideoTutorial(), '_blank')}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                      >
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-400 mb-2">
                      Pro Tips:
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                      {isCrypto ? (
                        <>
                          <li>Start with a small test transaction if you're unsure</li>
                          <li>Always double-check the address before sending</li>
                          <li>Save the transaction ID for reference</li>
                          <li>Contact support if your payment isn't confirmed within 1 hour</li>
                        </>
                      ) : (
                        <>
                          <li>Make sure your Venmo account is verified</li>
                          <li>Take a screenshot of your payment confirmation</li>
                          <li>Double-check the username before sending</li>
                          <li>Contact support if you have any issues</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  handleCopyAddress();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualPaymentForm;