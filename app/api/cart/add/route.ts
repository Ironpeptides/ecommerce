import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
 
export async function POST(req: NextRequest) {
  try {
    const { userId, productId, variantId, quantity = 1 } = await req.json();
 
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }


const product = await db.product.findUnique({
  where: { id: productId },
});

if (!product) {
  throw new Error("Product not found");
}

 
    // Find or create the cart for this user
    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }
 
    // Check if this product (+ variant) is already a cart item
    const existing = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    });
 
    if (existing) {
      // Bump quantity
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      // New item
      await db.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId ?? null, quantity },
      });
    }
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/cart/add]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}