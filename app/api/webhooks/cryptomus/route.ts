import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import "dotenv/config";
const CRYPTOMUS_PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY!;

function verifySign(payload: Record<string, any>, receivedSign: string): boolean {
  // Remove the sign field before hashing
  const { sign: _removed, ...rest } = payload;
  const base64Json = Buffer.from(JSON.stringify(rest)).toString("base64");
  const expected = crypto
    .createHash("md5")
    .update(base64Json + CRYPTOMUS_PAYMENT_API_KEY)
    .digest("hex");
  return expected === receivedSign;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!verifySign(body, body.sign)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { order_id, status, uuid } = body;

    // status values: "paid", "paid_over", "wrong_amount", "cancel", "fail", "check"
    if (status === "paid" || status === "paid_over") {
      // TODO: mark order as paid in your DB
      // await db.order.update({ where: { id: order_id }, data: { status: "paid" } });
      console.log(`Order ${order_id} (Cryptomus UUID: ${uuid}) paid.`);
    }

    // Cryptomus requires a 200 response or it will retry
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}