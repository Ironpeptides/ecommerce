// app/api/checkout/pricing-config/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // These live server-side only — never exposed as env vars to the client
  return NextResponse.json({
    salesTaxRate:    Number(process.env.SALES_TAX_RATE)    || 0.10,
    creditCardFee:   Number(process.env.CREDIT_CARD_FEE)   || 0.05,
    cryptoDiscount:  Number(process.env.CRYPTO_DISCOUNT)   || 0.15,
    subDiscount:     Number(process.env.SUB_DISCOUNT)       || 0.20,
    shippingCost:    Number(process.env.SHIPPING_COST)      || 11.00,
    freeShippingMin: Number(process.env.FREE_SHIPPING_MIN)  || 200.00,
  });
}