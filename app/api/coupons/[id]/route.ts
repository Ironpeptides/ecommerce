import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { DiscountType } from "@prisma/client";

// GET single coupon
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupon = await db.coupon.findUnique({
      where: { id: params.id },
      include: {
        marketer: { select: { id: true, name: true, email: true } },
        commissions: {
          include: {
            order: { select: { id: true, createdAt: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { orders: true, commissions: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error("[COUPON_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // If code is changing, check uniqueness
    if (code) {
      const existing = await db.coupon.findFirst({
        where: { code: code.toUpperCase(), NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
    }

    const coupon = await db.coupon.update({
      where: { id: params.id },
      data: {
        ...(code && { code: code.toUpperCase().trim() }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType: discountType as DiscountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(marketerId !== undefined && { marketerId: marketerId || null }),
        ...(commissionRate !== undefined && { commissionRate: commissionRate ? parseFloat(commissionRate) : null }),
      },
      include: {
        marketer: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error("[COUPON_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.coupon.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("[COUPON_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}