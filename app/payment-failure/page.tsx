// app/payment-failed/page.tsx
"use client";

import { XCircle, AlertTriangle, RefreshCw, HelpCircle, ArrowLeft, Mail, MessageCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Inner component that uses useSearchParams
function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const errorCode = searchParams.get("error_code");
  // Remove the useState for showRetry if not needed, or keep it

  const commonIssues = [
    {
      title: "Insufficient Funds",
      description: "Ensure your payment method has enough balance",
      icon: CreditCard,
    },
    {
      title: "Card Declined",
      description: "Try a different payment method or contact your bank",
      icon: XCircle,
    },
    {
      title: "Network Error",
      description: "Check your internet connection and try again",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Failure Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-red-600/20 to-red-500/10 px-6 py-8 md:px-10 md:py-12 text-center border-b border-white/10">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full border-2 border-red-500/30 mb-6 animate-pulse">
                <XCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                Payment Failed
              </h1>
              
              <p className="text-slate-300 text-base md:text-lg max-w-md mx-auto">
                We couldn't process your payment. Please try again or use another method.
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="px-6 py-8 md:px-10">
            {/* Error Message Box */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Transaction Failed</h3>
                  <p className="text-sm text-slate-300">
                    {errorCode 
                      ? `Error code: ${errorCode}. Please contact support if the issue persists.`
                      : "Your payment could not be processed. This could be due to insufficient funds, incorrect details, or a temporary issue with your payment provider."
                    }
                  </p>
                  {sessionId && (
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      Session ID: {sessionId.slice(0, 12)}...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                Common Issues & Solutions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {commonIssues.map((issue, idx) => (
                  <div key={idx} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <issue.icon className="w-8 h-8 text-red-400 mb-2" />
                    <h4 className="text-sm font-semibold text-white mb-1">{issue.title}</h4>
                    <p className="text-xs text-slate-400">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Try Payment Again
              </Link>
              
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Cart
              </Link>
            </div>

            {/* Alternative Payment Methods */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 text-center">
                Alternative Payment Methods
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/checkout?method=crypto"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors border border-white/5"
                >
                  Crypto (USDC)
                </Link>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors border border-white/5">
                  Bank Transfer
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors border border-white/5">
                  PayPal
                </button>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-400">
                  Still having issues? Our support team is here to help
                </p>
                <div className="flex justify-center gap-4">
                  <button className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Mail className="w-4 h-4" />
                    support@haelo.fit
                  </button>
                  <span className="text-slate-600">|</span>
                  <button className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold">💡</span>
            </div>
            <div>
              <p className="text-sm text-slate-300">
                <span className="text-blue-400 font-semibold">Tip:</span> If your payment was deducted but not confirmed, 
                please wait 5-10 minutes and check your order status. Sometimes there are processing delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}