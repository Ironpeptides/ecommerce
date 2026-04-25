import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { CouponsClient } from "./couponsClient";

export default async function CouponsPage() {
  const user = await getAuthenticatedUser();

  const [coupons, marketers] = await Promise.all([
    db.coupon.findMany({
      include: {
        marketerId: true,
        commissionRate: true, 
        marketer: { select: { id: true, name: true, email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // fetch users who are marketers to populate the marketer dropdown
    db.user.findMany({
      where: { 
        orgId: user.orgId, 
        roles: {
          some: {
            roleName: "MARKETER"
          }
        }
      },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return <CouponsClient coupons={coupons} marketers={marketers} />;
}