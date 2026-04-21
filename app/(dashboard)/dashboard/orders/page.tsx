import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrdersByStatus, getOrdersAwaitingApproval } from "@/actions/ordersEcomerce";
import { BaseTable } from "@/components/dashboard/Tables/BaseTable";
import { columns } from "./columns";
import { Badge } from "@/components/ui/badge";

const TABS = ["all", "pending", "shipped", "completed", "refunds", "awaiting-approval"] as const;

const TAB_META: Record<
  (typeof TABS)[number],
  { label: string; description: string }
> = {
  all: { label: "All Orders", description: "Every order placed in your store." },
  pending: { label: "Pending", description: "Orders awaiting processing or confirmation." },
  shipped: { label: "Shipped", description: "Orders currently in transit." },
  completed: { label: "Completed", description: "Successfully delivered orders." },
  refunds: { label: "Refunds", description: "Cancelled or refunded orders." },
  "awaiting-approval": {
    label: "Awaiting Approval",
    description: "Crypto payments that buyers have marked as paid — review and confirm.",
  },
};

export default async function OrdersPage() {
  const [all, pending, shipped, completed, refunds, awaitingApproval] =
    await Promise.all([
      getOrdersByStatus("all"),
      getOrdersByStatus("pending"),
      getOrdersByStatus("shipped"),
      getOrdersByStatus("completed"),
      getOrdersByStatus("refunds"),
      getOrdersAwaitingApproval(),
    ]);

  const dataMap = { all, pending, shipped, completed, refunds, "awaiting-approval": awaitingApproval };

  return (
    <div className="p-8">
      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {TABS.map((tab) => {
            const count = dataMap[tab].length;
            const isUrgent = tab === "awaiting-approval" && count > 0;
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary capitalize"
              >
                {TAB_META[tab].label}
                {count > 0 && (
                  <Badge
                    variant={isUrgent ? "destructive" : "secondary"}
                    className="text-[10px] h-4 px-1.5 min-w-[18px] justify-center"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {TAB_META[tab].label}
              </h2>
              <p className="text-muted-foreground text-sm">
                {TAB_META[tab].description}
              </p>
            </div>
            <BaseTable
              columns={columns}
              data={dataMap[tab]}
              searchPlaceholder="Search by order #, buyer, or status..."
              entityLabel="order"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}