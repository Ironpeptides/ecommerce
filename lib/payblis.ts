// lib/payblis.ts
// Payblis payment integration service
// Replicates PHP serialize() + base64 encoding as required by Payblis API

import crypto from "crypto";

const PAYBLIS_API_KEY    = process.env.PAYBLIS_MERCHANT_KEY!;
const PAYBLIS_SECRET_KEY = process.env.PAYBLIS_SECRET_KEY!;
const PAYBLIS_SANDBOX = process.env.PAYBLIS_SANDBOX === "true";
const APP_URL            = process.env.NEXT_PUBLIC_APP_URL!;

// ─────────────────────────────────────────────────────────────────────────────
// PHP serialize() replication
// Payblis expects the payload to be PHP-serialized then base64-encoded.
// PHP serialize format for arrays:
//   a:<count>:{s:<keyLen>:"<key>";s:<valLen>:"<val>"; ...}
// ─────────────────────────────────────────────────────────────────────────────
function phpSerialize(obj: Record<string, string>): string {
  const entries = Object.entries(obj);
  const parts = entries.map(([key, val]) => {
    return `s:${Buffer.byteLength(key, "utf8")}:"${key}";s:${Buffer.byteLength(val, "utf8")}:"${val}";`;
  });
  return `a:${entries.length}:{${parts.join("")}}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HMAC-SHA256 signature
// ─────────────────────────────────────────────────────────────────────────────
export function generateSignature(payload: Record<string, string>): string {
  // Sort keys alphabetically, concatenate values, sign
  const dataToSign = Object.keys(payload)
    .sort()
    .map((k) => payload[k])
    .join("|");
  return crypto
    .createHmac("sha256", PAYBLIS_SECRET_KEY)
    .update(dataToSign)
    .digest("hex");
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify IPN signature from Payblis webhook
// IMPORTANT: Remove "signature" field from payload before verifying
// ─────────────────────────────────────────────────────────────────────────────
export function verifyIpnSignature(
  rawBody: string,
  headerSignature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", PAYBLIS_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(headerSignature, "hex")
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build checkout URL (Checkout mode)
// ─────────────────────────────────────────────────────────────────────────────
export interface PayblisCheckoutParams {
  amount: number;
  currency?: "USD" | "EUR" | "CAD" | "GBP";
  productName: string;
  refOrder: string;           // your unique order ID
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  country: string;            // ISO code e.g. "US"
  userIp: string;
  method?: "credit_cards" | "apple_pay" | "google_pay" | "paypal" | "revolut" | "sepa" | "open_banking";
  storeName?: string;
  lang?: string;
}

export function buildCheckoutUrl(params: PayblisCheckoutParams): string {
  const payload: Record<string, string> = {
    MerchantKey:        PAYBLIS_API_KEY,
    amount:             params.amount.toFixed(2),
    currency:           params.currency ?? "USD",
    product_name:       params.productName,
    method:             params.method ?? "credit_cards",
    RefOrder:           params.refOrder,
    Customer_Email:     params.customerEmail,
    Customer_Name:      params.customerLastName,
    Customer_FirstName: params.customerFirstName,
    country:            params.country,
    userIP:             params.userIp,
    lang:               params.lang ?? "en",
    store_name:         params.storeName ?? "Store",
    urlOK:              `${APP_URL}/payment-success?ref=${params.refOrder}`,
    urlKO:              `${APP_URL}/payment-failed?ref=${params.refOrder}`,
    ipnURL:             `${APP_URL}/api/payblis/ipn`,
  };

  // Add sandbox flag only in test mode
  if (PAYBLIS_SANDBOX) {
    payload.sandbox = "true";
  }

  // Add HMAC signature
  payload.signature = generateSignature(payload);

  // PHP serialize → base64
  const serialized = phpSerialize(payload);
  const encoded    = Buffer.from(serialized).toString("base64");

  return `https://pay.payblis.com/api/payment_gateway.php?token=${encoded}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build direct provider URL (Direct Provider mode)
// Use this if you want to send users directly to a specific provider
// e.g. provider_or = "pb-moonpay"
// ─────────────────────────────────────────────────────────────────────────────
export function buildDirectProviderUrl(
  params: PayblisCheckoutParams & { providerName: string }
): string {
  const payload: Record<string, string> = {
    MerchantKey:        PAYBLIS_API_KEY,
    provider_or:        params.providerName,
    amount:             params.amount.toFixed(2),
    currency:           params.currency ?? "USD",
    product_name:       params.productName,
    RefOrder:           params.refOrder,
    Customer_Email:     params.customerEmail,
    Customer_Name:      params.customerLastName,
    Customer_FirstName: params.customerFirstName,
    country:            params.country,
    userIP:             params.userIp,
    lang:               params.lang ?? "en",
    store_name:         params.storeName ?? "Store",
    urlOK:              `${APP_URL}/payment-success?ref=${params.refOrder}`,
    urlKO:              `${APP_URL}/payment-failed?ref=${params.refOrder}`,
    ipnURL:             `${APP_URL}/api/payblis/ipn`,
  };

  if (PAYBLIS_SANDBOX) {
    payload.sandbox = "true";
  }

  payload.signature = generateSignature(payload);

  const serialized = phpSerialize(payload);
  const encoded    = Buffer.from(serialized).toString("base64");

  return `https://pay.payblis.com/api/dp-onramp.php?token=${encoded}`;
}