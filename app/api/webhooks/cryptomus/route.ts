// app/api/webhooks/cryptomus/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";
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

    // 1. Signature Verification
    if (!verifySign(body, body.sign)) {
      console.error("Cryptomus webhook: Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { orderId, status, uuid, amount, currency } = body;

    if (!orderId) {
      console.error("Cryptomus webhook: Missing orderId");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 2. Handle successful payment
    if (status === "paid" || status === "paid_over") {
      await db.$transaction(async (tx) => {
        // Find existing order + include items for the receipt
        const existingOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!existingOrder) {
          console.error(`Cryptomus webhook: Order ${orderId} not found`);
          throw new Error("Order not found");
        }

        // Update Order
        const updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "cryptomus",
            paymentIntentId: uuid, // Store UUID as reference
            buyerPaidAt: new Date(),
            orderStatus: "CONFIRMED",
            totalAmount: parseFloat(amount || "0"),
          },
        });

        // Create Payment record
        await tx.payment.create({
          data: {
            orderId: updatedOrder.id,
            method: "cryptomus",
            amount: parseFloat(amount || "0"),
            status: "PAID",
            transactionId: uuid,
            currency: (currency || "USD").toUpperCase(),
            paidAt: new Date(),
          },
        });

        // Add history
        await tx.orderStatusHistory.create({
          data: {
            orderId: updatedOrder.id,
            status: "CONFIRMED",
            note: `Payment received via Cryptomus (UUID: ${uuid})`,
            changedBy: existingOrder.userId,
          },
        });

        // Clear Cart
        await tx.cart.deleteMany({
          where: { userId: existingOrder.userId },
        });

        
        
        // Fetch Buyer details
        const buyer = await tx.user.findUnique({
          where: { id: existingOrder.userId },
          select: { email: true, firstName: true }
        });
  const admins = await tx.user.findMany({
  where: { roles: { some: { roleName: "admin" } } },
  select: { email: true }
});
const adminEmails = admins.map(a => a.email);

  // 6. Send Emails
  if (buyer && adminEmails.length > 0) {
  await sendOrderConfirmationEmails({
    buyerEmail: buyer.email,
    buyerName: buyer.firstName || "Customer",
    adminEmails: adminEmails, // Passing the array here
    orderNumber: updatedOrder.orderNumber,
    totalAmount: updatedOrder.totalAmount,
    items: existingOrder.items.map(i => ({ 
      name: i.productName, 
      quantity: i.quantity, 
      price: i.price 
    }))
  });
}
        
        // --- END NOTIFICATION LOGIC ---

        console.log(`✅ Cryptomus success: ${updatedOrder.orderNumber}`);
      });
    }

    // 3. Handle failures
    else if (status === "cancel" || status === "fail") {
      const updated = await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          orderStatus: "CANCELLED",
        },
      });

      await db.orderStatusHistory.create({
        data: {
          orderId: updated.id,
          status: "CANCELLED",
          note: `Cryptomus payment ${status} (UUID: ${uuid})`,
        },
      });

      console.log(`❌ Cryptomus ${status}: ${orderId}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Cryptomus webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}