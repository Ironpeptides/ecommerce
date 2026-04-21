import { NextRequest, NextResponse } from 'next/server';

// Static payment addresses (in production, store these in environment variables or database)
const PAYMENT_ADDRESSES = {
  venmo: {
    address: "@YourVenmoHandle",
    identifier: "Venmo",
    instructions: "Send the exact amount to the Venmo username above. Include your order ID in the payment note for faster verification.",
    minAmount: 1,
    currency: "USD"
  },
  crypto: {
    address: "bc1qzrves68udmxxx9245j6pltsjs9rfr43tmp0x8u", // Example Bitcoin address
    identifier: "Bitcoin",
    instructions: "Send the exact amount in BTC to the Bitcoin address above. The network may take 10-30 minutes to confirm your transaction.",
    network: "Bitcoin Network",
    minAmount: 0.001,
    currency: "BTC"
  },
  manual_crypto: {
    address: "bc1qzrves68udmxxx9245j6pltsjs9rfr43tmp0x8u",
    identifier: "Bitcoin",
    instructions: "Send the exact amount in BTC to the Bitcoin address above. Once sent, click the confirmation button below.",
    network: "Bitcoin Network",
    minAmount: 0.001,
    currency: "BTC"
  },
  ethereum: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    identifier: "Ethereum",
    instructions: "Send the exact amount in ETH to the Ethereum address above. Ensure you're using the Ethereum mainnet.",
    network: "Ethereum Mainnet",
    minAmount: 0.01,
    currency: "ETH"
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get('method');

    if (!method) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Get payment details for the requested method
    let paymentDetails;
    
    if (method === "venmo") {
      paymentDetails = PAYMENT_ADDRESSES.venmo;
    } else if (method === "crypto" || method === "manual_crypto") {
      paymentDetails = PAYMENT_ADDRESSES.crypto;
    } else if (method === "ethereum") {
      paymentDetails = PAYMENT_ADDRESSES.ethereum;
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // In production, you might want to generate a unique address per order
    // or fetch from a crypto payment provider API
    
    return NextResponse.json(paymentDetails, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}