// app/api/payblis/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { buildCheckoutUrl } from "@/lib/payblis";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      amount,
      currency = "USD",
      country = "US",
    } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, amount" },
        { status: 400 }
      );
    }

    // Fetch order + user from DB to build accurate payload
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get user IP from request headers
    const userIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const checkoutUrl = buildCheckoutUrl({
      amount: order.totalAmount,
      currency,
      productName: "Research Materials Order",   // generic — no peptide mention
      refOrder: order.orderNumber,
      customerEmail: order.user.email,
      customerFirstName: order.user.firstName ?? "Customer",
      customerLastName: order.user.lastName ?? ".",
      country,
      userIp,
      method: "credit_cards",
      storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "Store",
    });

    // Mark order as awaiting payment
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PENDING_APPROVAL",
        paymentMethod: "payblis",
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error("[payblis/checkout] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}