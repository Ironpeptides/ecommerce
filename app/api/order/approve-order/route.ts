// app/api/admin/approve-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { sendOrderConfirmationEmails } from "@/lib/mail-service";
import { deductStock } from "@/lib/stock"; 

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, adminUserId } = await req.json();

    const result = await db.$transaction(async (tx) => {
      // 1. Fetch the Order with all details
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true },
      });

      if (!order) throw new Error("Order not found");
      if (order.paymentStatus === "PAID") throw new Error("Order is already paid");

      // 2. Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          buyerPaidAt: new Date(),
        },
      });

      // 3. Log the history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "CONFIRMED",
          note: "Manual payment verified and approved by Administrator",
          changedBy: adminUserId,
        },
      });

       await deductStock(tx, order.items, "[admin/approve]");

      // 4. Create Payment Audit Record
      await tx.payment.create({
        data: {
          orderId,
          method: order.paymentMethod || "manual",
          amount: order.totalAmount,
          status: "PAID",
          transactionId: `MANUAL-APPV-${order.orderNumber}`,
          currency: "USD",
          paidAt: new Date(),
        },
      });

      // 5. Clear the Buyer's Cart (since it wasn't cleared during the PENDING stage)
      await tx.cart.deleteMany({
        where: { userId: order.userId },
      });

      // 6. Fetch all Admins for the CC list (reusing your logic)
      const admins = await tx.user.findMany({
        where: { roles: { some: { roleName: "admin" } } },
        select: { email: true }
      });
      const adminEmails = admins.map(a => a.email);

      // 7. Trigger the Confirmation Emails
      await sendOrderConfirmationEmails({
        buyerEmail: order.user.email,
        buyerName: order.user.firstName || "Customer",
        adminEmails: adminEmails,
        orderNumber: updatedOrder.orderNumber,
        totalAmount: updatedOrder.totalAmount,
        items: order.items.map(i => ({
          name: i.productName,
          quantity: i.quantity,
          price: i.price
        }))
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    console.error("Approval Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}