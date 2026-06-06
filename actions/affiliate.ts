// app/(dashboard)/dashboard/affiliate/actions.ts
"use server";

import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function getMyAffiliateStats() {
  try {
    const user = await getAuthenticatedUser();

    const [coupons, commissions] = await Promise.all([
      db.coupon.findMany({
        where: { marketerId: user.id },
        select: {
          id: true,
          code: true,
          description: true,
          discountType: true,
          discountValue: true,
          commissionRate: true,
          isActive: true,
          usageCount: true,
          usageLimit: true,
          expiresAt: true,
          _count: { select: { orders: true } },
        },
      }),
      db.commission.findMany({
        where: { marketerId: user.id },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          couponId: true,
          coupon: { select: { code: true } },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              orderStatus: true,
              paymentStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalEarned = commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.amount, 0);

    const pendingEarnings = commissions
      .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      coupons,
      commissions,
      stats: {
        totalEarned,
        pendingEarnings,
        totalOrders: commissions.length,
        totalCoupons: coupons.length,
      },
    };
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    return null;
  }
}

export async function getMyAffiliateOrders() {
  try {
    const user = await getAuthenticatedUser();

    // Fetch all orders that used one of this affiliate's coupons
    const couponCodes = await db.coupon
      .findMany({
        where: { marketerId: user.id },
        select: { code: true },
      })
      .then((coupons) => coupons.map((c) => c.code));

    if (couponCodes.length === 0) return [];

    return await db.order.findMany({
      where: { couponCode: { in: couponCodes } },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        discountAmount: true,
        subtotal: true,
        couponCode: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        commissions: {
          where: { marketerId: user.id },
          select: { amount: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching affiliate orders:", error);
    return [];
  }
}