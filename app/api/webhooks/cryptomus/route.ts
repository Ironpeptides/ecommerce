// app/api/webhooks/cryptomus/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/prisma/db";
import "dotenv/config";

const CRYPTOMUS_PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY!;

function verifySign(payload: Record<string, any>, receivedSign: string): boolean {
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
      console.error("Cryptomus webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { orderNumber, status, uuid, amount, currency } = body;

    if (!orderNumber) {
      console.error("Cryptomus webhook: Missing orderNumber");
      return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
    }

    // Handle successful payment
    if (status === "paid" || status === "paid_over") {
      await db.$transaction(async (tx) => {
        // 1. Find the existing order
        const existingOrder = await tx.order.findUnique({
          where: { orderNumber: orderNumber },
        });

        if (!existingOrder) {
          console.error(`Cryptomus webhook: Order with orderNumber ${orderNumber} not found`);
          throw new Error("Order not found");
        }

        // 2. Update the Order
        const updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "cryptomus",
            // You can store uuid if you want to track it
            paymentSessionId: uuid || null,        // or add a field like cryptomusUuid if preferred
            buyerPaidAt: new Date(),
            orderStatus: "CONFIRMED",              // Change to "PROCESSING" if you prefer
            totalAmount: parseFloat(amount || "0"), // In case it differs slightly
          },
        });

        // 3. Create Payment record
        await tx.payment.create({
          data: {
            orderId: updatedOrder.id,
            method: "cryptomus",
            amount: parseFloat(amount || "0"),
            status: "PAID",
            transactionId: uuid,                    // Cryptomus UUID as transaction reference
            currency: (currency || "USD").toUpperCase(),
            paidAt: new Date(),
          },
        });

        // 4. Add to Order Status History
        await tx.orderStatusHistory.create({
          data: {
            orderId: updatedOrder.id,
            status: "CONFIRMED",
            note: `Payment received via Cryptomus (UUID: ${uuid})`,
            changedBy: existingOrder.userId,
          },
        });

        // 5. Clear the user's cart
        await tx.cart.deleteMany({
          where: { userId: existingOrder.userId },
        });

        console.log(`✅ Cryptomus payment confirmed for order ${updatedOrder.orderNumber} (UUID: ${uuid})`);
      });
    }

    // Handle other statuses (optional but recommended)
    else if (status === "cancel" || status === "fail") {
      await db.order.update({
        where: { orderNumber: orderNumber },
        data: {
          paymentStatus: "FAILED",
          orderStatus: "CANCELLED",
        },
      });

      // Optional: Add history entry
      const failedOrder = await db.order.findUnique({ where: { orderNumber: orderNumber } });
      if (failedOrder) {
        await db.orderStatusHistory.create({
          data: {
            orderId: failedOrder.id,
            status: "CANCELLED",
            note: `Cryptomus payment ${status} (UUID: ${uuid})`,
          },
        });
      }

      console.log(`❌ Cryptomus payment ${status} for order ${orderNumber}`);
    }

    // Cryptomus requires 200 response
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Cryptomus webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}