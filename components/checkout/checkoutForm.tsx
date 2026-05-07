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

  if (
    paymentMethod === "manual_crypto" ||
    paymentMethod === "venmo" ||
    paymentMethod === "cashapp"
  ) {
    return <ManualPaymentForm {...sharedProps} />;
  }

  if (paymentMethod === "payblis") {
    return <PayblisPayment {...sharedProps} />;
  }

  if (paymentMethod === "credits") {
    return <CreditsPayment {...sharedProps} />;
  }

  return null;
};

export default CheckoutForm;