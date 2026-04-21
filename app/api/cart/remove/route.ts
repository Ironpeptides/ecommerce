import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
 



export async function DELETE(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();
 
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      throw new Error("Product not found");
    }
 
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return NextResponse.json({ success: true }); // nothing to remove
 
    await db.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/cart/remove]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}