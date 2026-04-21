import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();
 
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }
 
    const wishlist = await db.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return NextResponse.json({ success: true });
 
    await db.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/wishlist/remove]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}