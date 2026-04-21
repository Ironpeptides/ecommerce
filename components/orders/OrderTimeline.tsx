"use client";

import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Clock, Package, Truck,
  Home, XCircle, RotateCcw, Circle,
} from "lucide-react";

type HistoryItem = {
  id: string;
  status: OrderStatus;
  note?: string | null;
  changedBy?: string | null;
  createdAt: Date;
};

const STATUS_META: Record<OrderStatus, { icon: React.ElementType; color: string; label: string }> = {
  PENDING:    { icon: Clock,       color: "text-yellow-500", label: "Order Placed" },
  CONFIRMED:  { icon: CheckCircle2, color: "text-blue-500",  label: "Confirmed" },
  PROCESSING: { icon: Package,     color: "text-purple-500", label: "Processing" },
  SHIPPED:    { icon: Truck,       color: "text-indigo-500", label: "Shipped" },
  DELIVERED:  { icon: Home,        color: "text-emerald-500", label: "Delivered" },
  CANCELLED:  { icon: XCircle,     color: "text-red-500",    label: "Cancelled" },
  REFUNDED:   { icon: RotateCcw,   color: "text-orange-500", label: "Refunded" },
};

export function OrderTimeline({ history }: { history: HistoryItem[] }) {
  if (!history.length) {
    return (
      <p className="text-sm text-muted-foreground py-2">No status history yet.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {history.map((item, idx) => {
        const meta = STATUS_META[item.status];
        const Icon = meta?.icon ?? Circle;
        const isLast = idx === history.length - 1;

        return (
          <li key={item.id} className="flex gap-4">
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                "bg-background border-2",
                idx === 0 ? "border-primary" : "border-border"
              )}>
                <Icon className={cn("h-3.5 w-3.5", idx === 0 ? meta?.color : "text-muted-foreground")} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            {/* Content */}
            <div className={cn("pb-6 min-w-0 flex-1", isLast && "pb-0")}>
              <p className={cn(
                "text-sm font-medium",
                idx === 0 ? "" : "text-muted-foreground"
              )}>
                {meta?.label ?? item.status}
              </p>
              {item.note && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                  year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}