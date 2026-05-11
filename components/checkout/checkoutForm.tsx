import React from "react";
import type { PaymentMethod } from "../../app/checkout/checkoutContent";
import ManualPaymentForm from "../../app/checkout/manualpaymentform";
import PayblisPayment from "../../app/checkout/payBlisPaymentForm";
import CreditsPayment from "../../app/checkout/creditsPaymentForm";

interface PricingConfig {
  salesTaxRate: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface CheckoutFormProps {
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  orderId: string | null;
  paymentMethod: PaymentMethod;
  isSubscriber: boolean;
  pricingConfig: PricingConfig | null;
}

const CheckoutForm = ({
  cartItems,
  coupon,
  sessionId,
  orderId,
  paymentMethod,
  isSubscriber,
  pricingConfig,
}: CheckoutFormProps) => {
  
  const sharedProps = {
    cartItems,
    coupon,
    sessionId,
    orderId,
    isSubscriber,
    pricingConfig,
    paymentMethod,
  };

  // Log the active method for debugging

  switch (paymentMethod) {
    // ── Manual Methods ──────────────────────────────────────────
    // All these cases "fall through" to render the same component
    case "manual_crypto":
    case "venmo":
    case "cashapp":
    case "zelle":
      return <ManualPaymentForm {...sharedProps} />;

    // ── Integrated Gateways ─────────────────────────────────────
    case "payblis":
      console.log("Rendering Payblis Gateway");
      return <PayblisPayment {...sharedProps} />;

    case "credits":
      console.log("Rendering Internal Credits Payment");
      return <CreditsPayment {...sharedProps} />;

    // ── Fallback ────────────────────────────────────────────────
    default:
      console.warn("Unknown payment method selected:", paymentMethod);
      return (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Please select a valid payment method to continue.
        </div>
      );
  }
};

export default CheckoutForm;