import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import type { PaymentMethod } from "../../app/checkout/CheckoutContent";
import StripePaymentForm from "../../app/checkout/stripepaymentform";
import CryptoPaymentForm from "../../app/checkout/cryptopaymentform";
import "dotenv/config";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
  paymentMethod: PaymentMethod;
  isSubscriber: boolean;
}

const CheckoutForm = ({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
  paymentMethod,
  isSubscriber,
}: CheckoutFormProps) => {
  const sharedProps = { cartItems, coupon, sessionId, isSubscriber };

  if (paymentMethod === "stripe") {
    if (!clientSecret) {
      return (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400 text-sm">Preparing card payment...</p>
        </div>
      );
    }

    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#7c3aed",
              colorBackground: "#0a0a0c",
              colorText: "#f3f4f6",
              fontFamily: "system-ui, sans-serif",
            },
          },
        }}
      >
        <StripePaymentForm clientSecret={clientSecret} {...sharedProps} />
      </Elements>
    );
  }

  // Crypto — zero Stripe involvement
  return <CryptoPaymentForm {...sharedProps} />;
};

export default CheckoutForm;