import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { DiscountType } from "@prisma/client";

// GET — fetch all coupons
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    console.log("Authenticated user:", user);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await db.coupon.findMany({
  where: { 
    orders: { 
      some: { 
        user: { 
          orgId: user.orgId 
        } 
      } 
    } 
  },
  include: {
    marketer: { select: { id: true, name: true, email: true } },
    _count: { select: { orders: true, commissions: true } },
  },
  orderBy: { createdAt: "desc" },
});

    return NextResponse.json({ data: coupons });
  } catch (error) {
    console.error("[COUPONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create coupon
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
      marketerId,
      commissionRate,
    } = body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "code, discountType, and discountValue are required" },
        { status: 400 }
      );
    }

    // Check code is unique
    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description,
        discountType: discountType as DiscountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        marketerId: marketerId || null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
      },
      include: {
        marketer: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    console.error("[COUPONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}