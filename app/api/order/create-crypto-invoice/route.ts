import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import "dotenv/config";

const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID!;
const CRYPTOMUS_PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY!;

function buildSign(payload: Record<string, any>, apiKey: string): string {
  // Cryptomus signature: base64(md5(base64(JSON) + apiKey))
  const base64Json = Buffer.from(JSON.stringify(payload)).toString("base64");
  return crypto
    .createHash("md5")
    .update(base64Json + apiKey)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "USD", sessionId, order_id } = body;

    if (!amount || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      amount: String(Number(amount).toFixed(2)),
      currency,                          // fiat currency the amount is in
      order_id: order_id ?? sessionId,   // must be unique per invoice
      url_return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?sessionId=${sessionId}`,
      url_callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/cryptomus`,
      is_payment_multiple: false,        // reject partial payments
      lifetime: 3600,                    // invoice expires after 1 hour
      // to_currency: "USDT",            // uncomment to force a specific crypto
    };

    const sign = buildSign(payload, CRYPTOMUS_PAYMENT_API_KEY);

    const response = await fetch("https://api.cryptomus.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: CRYPTOMUS_MERCHANT_ID,
        sign,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.state !== 0) {
      console.error("Cryptomus error:", data);
      return NextResponse.json(
        { error: data?.message ?? "Failed to create invoice" },
        { status: 502 }
      );
    }

    const result = data.result;

    return NextResponse.json({
      url: result.url,
      address: result.address,
      currency: result.payer_currency,   // e.g. "USDT"
      network: result.network,           // e.g. "tron"
      amount: result.payer_amount,       // exact crypto amount to send
      uuid: result.uuid,                 // store this for webhook verification
    });
  } catch (err) {
    console.error("Crypto invoice error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}