// app/(dashboard)/dashboard/affiliate/page.tsx
import { getMyAffiliateStats, getMyAffiliateOrders } from "@/actions/affiliate";
import { AffiliateDashboardClient } from "./affiliateDashboardClient";
import { redirect } from "next/navigation";

export default async function AffiliateDashboardPage() {
  const [stats, orders] = await Promise.all([
    getMyAffiliateStats(),
    getMyAffiliateOrders(),
  ]);

  if (!stats) redirect("/dashboard");

  return (
    <AffiliateDashboardClient
      stats={stats.stats}
      coupons={stats.coupons}
      commissions={stats.commissions}
      orders={orders}
    />
  );
}