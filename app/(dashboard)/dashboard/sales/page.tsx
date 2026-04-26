import { getOrderStats, getCustomerStats, getTransactionStats, getMonthlyRevenueSeries } from "@/actions/statistics";
import { SalesClient } from "./salesClient";

export default async function SalesPage() {
  const [orders, customers, transactions, revenueSeries] = await Promise.all([
    getOrderStats(),
    getCustomerStats(),
    getTransactionStats(),
    getMonthlyRevenueSeries(6),
  ]);

  return (
    <SalesClient
      orders={orders}
      customers={customers}
      transactions={transactions}
      revenueSeries={revenueSeries}
    />
  );
}