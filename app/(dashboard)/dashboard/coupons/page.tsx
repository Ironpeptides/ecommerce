import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { CouponsClient } from "./couponsClient";

export default async function CouponsPage() {
  const user = await getAuthenticatedUser();

  const [coupons, marketers] = await Promise.all([
    db.coupon.findMany({
      include: {
        marketer: { select: { id: true, name: true, email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // fetch users who are marketers to populate the marketer dropdown
    db.user.findMany({
  where: {
    roles: {
      some: {
        roleName: {
          in: ["affiliate_", "buyer_"], 
        },
      },
    },
  },
  select: { id: true, name: true, email: true },
}),
  ]);

  console.log("Fetched coupons:", coupons);
  console.log("Fetched marketers:", marketers);

  return <CouponsClient coupons={coupons} marketers={marketers} />;
}