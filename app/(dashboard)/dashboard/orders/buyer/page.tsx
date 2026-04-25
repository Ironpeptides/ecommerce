import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrdersByBuyer } from "@/actions/ordersEcomerce";
import { BaseTable } from "@/components/dashboard/Tables/BaseTable";
import { columns } from "./columns";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getServerSession } from "next-auth";


// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = ["all", "pending", "shipped", "completed", "refunds"] as const;
// Note: no "awaiting-approval" — that's admin-only territory

type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { label: string; description: string }> = {
  all: {
    label: "All Orders",
    description: "Every order you have placed.",
  },
  pending: {
    label: "Pending",
    description: "Orders being confirmed or processed.",
  },
  shipped: {
    label: "Shipped",
    description: "Orders on their way to you.",
  },
  completed: {
    label: "Delivered",
    description: "Orders you have received.",
  },
  refunds: {
    label: "Cancelled / Refunds",
    description: "Orders that were cancelled or refunded.",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BuyerOrdersPage() {

 const session = await getServerSession(authOptions);
  // Guard: should never reach here without a session, but be explicit
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Confirm the user is actually a buyer before fetching anything
  const isBuyer = (session.user as any).roles?.some(
    (r: { roleName: string }) => r.roleName === "buyer"
  );

  if (!isBuyer) {
    redirect("/dashboard"); // staff lands on the admin orders page instead
  }

  const userId = session.user.id;

  // Fetch all tab data in parallel — scoped to this buyer only
  const [all, pending, shipped, completed, refunds] = await Promise.all([
    getOrdersByBuyer(userId, "all"),
    getOrdersByBuyer(userId, "pending"),
    getOrdersByBuyer(userId, "shipped"),
    getOrdersByBuyer(userId, "completed"),
    getOrdersByBuyer(userId, "refunds"),
  ]);

  const dataMap: Record<Tab, typeof all> = {
    all,
    pending,
    shipped,
    completed,
    refunds,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage all your orders in one place.
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {TABS.map((tab) => {
            const count = dataMap[tab].length;
            // Highlight shipped orders — buyer probably wants to track those
            const isUrgent = tab === "shipped" && count > 0;

            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary capitalize"
              >
                {TAB_META[tab].label}
                {count > 0 && (
                  <Badge
                    variant={isUrgent ? "default" : "secondary"}
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
              searchPlaceholder="Search by order # or status..."
              entityLabel="order"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}