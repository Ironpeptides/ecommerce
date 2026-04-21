import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import type { PaymentMethod } from "../../app/checkout/checkoutContent";
import StripePaymentForm from "../../app/checkout/stripepaymentform";
import CryptoPaymentForm from "../../app/checkout/cryptopaymentform";
import ManualPaymentForm from "../../app/checkout/manualpaymentform"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PricingConfig {
  salesTaxRate: number;
  creditCardFee: number;
  cryptoDiscount: number;
  subDiscount: number;
  shippingCost: number;
  freeShippingMin: number;
}

interface CheckoutFormProps {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  orderId: string | null;
  paymentMethod: PaymentMethod;
  isSubscriber: boolean;
  pricingConfig: PricingConfig | null;
  onSwitchToCrypto?: () => void;
}

const CheckoutForm = ({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
  paymentMethod,
  isSubscriber,
  pricingConfig,
  onSwitchToCrypto,
}: CheckoutFormProps) => {
  const sharedProps = { cartItems, coupon, sessionId, isSubscriber, pricingConfig, paymentMethod };



  const manualProps = {
    cartItems: cartItems,
    coupon: coupon,
    isSubscriber: isSubscriber,
    pricingConfig: pricingConfig,
    paymentMethod: paymentMethod
  };

  // 1. Stripe Logic
  if (paymentMethod === "stripe") {
    if (!clientSecret) {
      return <div className="py-10 text-center text-gray-400">Preparing card payment...</div>;
    }
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
        <StripePaymentForm 
          clientSecret={clientSecret} 
          onSwitchToCrypto={onSwitchToCrypto} 
          {...sharedProps} 
        />
      </Elements>
    );
  }

  // 2. Automated Crypto (Cryptomus)
  if (paymentMethod === "crypto") {
    return <CryptoPaymentForm {...sharedProps} />;
  }

  // 3. Manual Methods (Venmo, Manual Crypto, etc.)
  return <ManualPaymentForm {...manualProps} />;
};

export default CheckoutForm;