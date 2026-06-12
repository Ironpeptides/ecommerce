import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Store these in environment variables in production.
// Add to your .env.local:
//
//   PAYMENT_VENMO_ADDRESS=@YourVenmoHandle
//   PAYMENT_CASHAPP_ADDRESS=$YourCashtag
//   PAYMENT_ZELLE_ADDRESS=payments@haelolabs.com   (or a phone number)
//   PAYMENT_BTC_ADDRESS=bc1q...
//   PAYMENT_ETH_ADDRESS=0x...
// ─────────────────────────────────────────────────────────────────────────────


const PAYMENT_ADDRESSES = {
  venmo: {
    address:      process.env.PAYMENT_VENMO_ADDRESS      ?? "@vreloj",
    identifier:   "Venmo",
    instructions: "Search for the username below in your Venmo app and send the exact amount. Include your Order ID in the payment note for faster verification. Don't mention anything about peptides.If a must use,'Research material",
    minAmount:    1,
    currency:     "USD",
  },
  cashapp: {
    address:      process.env.PAYMENT_CASHAPP_ADDRESS   ?? "$sparklesss01",
    identifier:   "Cash App",
    instructions: "Open Cash App, tap the $ icon, search for the $Cashtag below and send the exact amount. Include your Order ID in the note. Don't mention anything about peptides.If a must use,'Research material",
    minAmount:    1,
    currency:     "USD",
  },
  zelle: {
    // Standardized 10-digit format for better UX
    address:      process.env.PAYMENT_ZELLE_ADDRESS      ?? "(682) 262-7443",
    identifier:   "Zelle",
    instructions: "Open your bank app, navigate to Zelle, and send to the phone number below. Include your Order ID in the memo field. Zelle transfers are instant and irreversible. Don't mention anything about peptides.If a must use,'Research material'",
    minAmount:    1,
    currency:     "USD",
  },
  manual_crypto: {
    address:      process.env.PAYMENT_BTC_ADDRESS       ?? "bc1qzrves68udmxxx9245j6pltsjs9rfr43tmp0x8u",
    identifier:   "Bitcoin",
    instructions: "Send the exact amount in BTC to the Bitcoin address below. The network may take 10–30 minutes to confirm your transaction.",
    network:      "Bitcoin Network",
    minAmount:    0.001,
    currency:     "BTC",
  },
  // Legacy alias — kept for backwards compatibility
  crypto: {
    address:      process.env.PAYMENT_BTC_ADDRESS       ?? "bc1qzrves68udmxxx9245j6pltsjs9rfr43tmp0x8u",
    identifier:   "Bitcoin",
    instructions: "Send the exact amount in BTC to the Bitcoin address below. Once sent, click the confirmation button.",
    network:      "Bitcoin Network",
    minAmount:    0.001,
    currency:     "BTC",
  },
  ethereum: {
    address:      process.env.PAYMENT_ETH_ADDRESS       ?? "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    identifier:   "Ethereum",
    instructions: "Send the exact amount in ETH to the Ethereum address below. Ensure you're using the Ethereum mainnet.",
    network:      "Ethereum Mainnet",
    minAmount:    0.01,
    currency:     "ETH",
  },
} as const;

type PaymentMethod = keyof typeof PAYMENT_ADDRESSES;

export async function GET(request: NextRequest) {
  try {
    const method = request.nextUrl.searchParams.get("method");

    if (!method) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    const paymentDetails = PAYMENT_ADDRESSES[method as PaymentMethod];

    if (!paymentDetails) {
      return NextResponse.json(
        { error: `Invalid payment method: ${method}` },
        { status: 400 }
      );
    }

    return NextResponse.json(paymentDetails, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[payment-details] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}