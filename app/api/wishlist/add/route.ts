

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";


export async function POST_WISHLIST(req: NextRequest) {
  try {
    const { userId, productId } = await req.json();
 
    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }
 
    // Find or create wishlist
    let wishlist = await db.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await db.wishlist.create({ data: { userId } });
    }
 
    // Avoid duplicates
    const existing = await db.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });
 
    if (!existing) {
      await db.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
    }
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/wishlist/add]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 