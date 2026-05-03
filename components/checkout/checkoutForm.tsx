import React from "react";
import type { PaymentMethod } from "../../app/checkout/checkoutContent";
import ManualPaymentForm from "../../app/checkout/manualpaymentform";
import PayramPayment from "../../app/checkout/payramPaymentForm";
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

  // Manual methods — all share the same component, differentiated by paymentMethod prop
  if (
    paymentMethod === "manual_crypto" ||
    paymentMethod === "venmo" ||
    paymentMethod === "cashapp"
  ) {
    return <ManualPaymentForm {...sharedProps} />;
  }

  // Payram — placeholder until server is purchased
  if (paymentMethod === "payram") {
    return <PayramPayment {...sharedProps} />;
  }

  // Credits — powered by LemonSqueezy behind the scenes
  if (paymentMethod === "credits") {
    return <CreditsPayment {...sharedProps} />;
  }

  return null;
};

export default CheckoutForm;