// app/payment-success/page.tsx (or pages/payment-success.tsx depending on your Next.js version)
import { CheckCircle, Package, Truck, Mail, ArrowRight, Home, Receipt, Clock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";



interface PaymentSuccessPageProps {
  searchParams: Promise<{
    sessionId?: string;
    orderId?: string;
    payment_intent?: string;
    redirect_status?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const { sessionId, payment_intent, redirect_status, orderId } = params;
  const isSuccessful = redirect_status === "succeeded";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
      {/* Confetti Animation Background */}
      {/* Confetti Animation Background */}
<div className="fixed inset-0 pointer-events-none overflow-hidden">
  <div 
    className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%2310b981\' opacity=\'0.3\'%3E%3C/circle%3E%3C/svg%3E')] bg-repeat opacity-20" 
  />
</div>
      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Success Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 px-6 py-8 md:px-10 md:py-12 text-center border-b border-white/10">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full border-2 border-emerald-500/30 mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 animate-in slide-in-from-bottom-4 duration-500">
                Payment Successful! 🎉
              </h1>
              
              <p className="text-slate-300 text-base md:text-lg max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-100">
                Your order has been confirmed and is being processed.
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-6 py-8 md:px-10">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Order Info */}
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Order Information
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="text-slate-200 font-mono text-xs">
                      {sessionId?.slice(0, 8) || orderId?.slice(0, 8)|| "N/A"}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-slate-200 font-mono text-xs">
                      {payment_intent?.slice(0, 12) || "N/A"}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-200">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-semibold">Confirmed ✓</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    What's Next?
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-emerald-400 font-bold">1</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      You'll receive a confirmation email within 5 minutes
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-emerald-400 font-bold">2</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Order processing takes 1-2 business days
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-emerald-400 font-bold">3</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Tracking number will be sent once shipped
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/dashboard/orders/buyer/${orderId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                <Package className="w-4 h-4" />
                View Order Details
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10"
              >
                <Home className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-400">
                  Need help with your order? Contact our support team
                </p>
                <div className="flex justify-center gap-4">
                  <button className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Mail className="w-4 h-4" />
                    support@haelo.fit
                  </button>
                  <span className="text-slate-600">|</span>
                  <button className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Truck className="w-4 h-4" />
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Lock, text: "Secure Payment" },
            { icon: Truck, text: "Fast Shipping" },
            { icon: Package, text: "Quality Guaranteed" },
            { icon: Headphones, text: "24/7 Support" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <item.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Import missing icon
const Lock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Headphones = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);