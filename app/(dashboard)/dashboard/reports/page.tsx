import { getProductReportData, getCustomerStats, getOrderStats, getMonthlyRevenueSeries } from "@/actions/statistics";
import { ReportsClient } from "./reportsClient";

export default async function ReportsPage() {
  const [products, customers, orders, revenueSeries] = await Promise.all([
    getProductReportData(),
    getCustomerStats(),
    getOrderStats(),
    getMonthlyRevenueSeries(6),
  ]);

  return (
    <ReportsClient
      products={products}
      customers={customers}
      orders={orders}
      revenueSeries={revenueSeries}
    />
  );
}