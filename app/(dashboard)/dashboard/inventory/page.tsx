import { getStockLevels } from "@/actions/statistics";
import { InventoryClient } from "./inventoryClient";

export default async function InventoryPage() {
  const stockData = await getStockLevels();
  return <InventoryClient stockData={stockData} />;
}