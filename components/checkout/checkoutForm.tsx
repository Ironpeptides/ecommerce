import React from "react";
import type { PaymentMethod } from "../../app/checkout/checkoutContent";
import NexaPayPaymentForm from "../../app/checkout/nexapayPaymentForm";
import ManualPaymentForm from "../../app/checkout/manualpaymentform";

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

  // 1. NexaPay — card payment, no discount, auto crypto settlement
  if (paymentMethod === "nexapay") {
    return <NexaPayPaymentForm {...sharedProps} />;
  }

  // 2. Manual Crypto — 15% discount, direct wallet transfer
  return <ManualPaymentForm {...sharedProps} />;
};

export default CheckoutForm;