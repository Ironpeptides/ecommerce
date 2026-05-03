"use client";
import React from "react";
import { CreditCard, Clock } from "lucide-react";

interface PayramPaymentProps {
  cartItems: any[];
  coupon?: any;
  isSubscriber: boolean;
  pricingConfig: any;
  paymentMethod: string;
}

const PayramPayment = ({ pricingConfig, cartItems, isSubscriber }: PayramPaymentProps) => {
  // Reuse the same price calculation logic
  const getItemPrice = (item: any) => {
    if (item.selectedVariant?.price !== undefined) return Number(item.selectedVariant.price);
    return Number(item.sale_price || item.price || 0);
  };

  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * (Number(item.quantity) || 1),
    0
  );

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/40 to-[#1a1a1a] px-6 py-5 border-b border-purple-900/30">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Payram</h3>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Secure card payment processing
        </p>
      </div>

      {/* Coming soon body */}
      <div className="p-10 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Clock className="w-8 h-8 text-purple-400" />
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Coming Soon</h4>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Payram card payments are being set up and will be available shortly.
            In the meantime, please use one of the other available payment methods.
          </p>
        </div>

        <div className="w-full max-w-xs p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order Total</p>
          <p className="text-2xl font-bold text-white">${rawSubtotal.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Select another payment method above to complete your order
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayramPayment;