import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Find the user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      // No cart exists → already empty, success
      return NextResponse.json({ success: true, message: "Cart was already empty" });
    }

    // Delete all cart items for this cart
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Optional: You can also delete the Cart record itself if you want a truly empty cart
    // await db.cart.delete({ where: { id: cart.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/cart/clear]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}