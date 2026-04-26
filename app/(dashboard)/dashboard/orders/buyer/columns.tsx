"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Copy, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// ─── Type ─────────────────────────────────────────────────────────────────────
export type Order = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  buyerPaidAt?: Date | null;
  user: { id: string; name: string; email: string };
  items: { id: string; productId: string; productName: string; quantity: number; price: number }[];
  shippingAddress?: {
    fullName: string; city: string; country: string;
  } | null;
};

// ─── Style maps ───────────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  CONFIRMED:  "bg-blue-500/10 text-blue-600 border-blue-500/30",
  PROCESSING: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  SHIPPED:    "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  DELIVERED:  "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  CANCELLED:  "bg-red-500/10 text-red-600 border-red-500/30",
  REFUNDED:   "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  UNPAID:           "bg-red-500/10 text-red-600 border-red-500/30",
  PENDING_APPROVAL: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  PAID:             "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  PARTIALLY_PAID:   "bg-blue-500/10 text-blue-600 border-blue-500/30",
  REFUNDED:         "bg-orange-500/10 text-orange-600 border-orange-500/30",
  FAILED:           "bg-red-500/10 text-red-600 border-red-500/30",
};

// ─── Buyer-friendly status labels ─────────────────────────────────────────────
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    "Order Received",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Being Prepared",
  SHIPPED:    "On the Way",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID:           "Not Paid",
  PENDING_APPROVAL: "Payment Under Review",
  PAID:             "Paid",
  PARTIALLY_PAID:   "Partially Paid",
  REFUNDED:         "Refunded",
  FAILED:           "Payment Failed",
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

// ─── Columns ──────────────────────────────────────────────────────────────────
export const columns: ColumnDef<Order>[] = [
  // ── Order # + item count ────────────────────────────────────────────────────
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono text-sm font-semibold">
          #{row.original.orderNumber.slice(-8).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.items.length} item{row.original.items.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
  },

  // ── What they ordered (first item + overflow) ───────────────────────────────
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items;
      const first = items[0];
      const rest = items.length - 1;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-[180px]">
            {first?.productName ?? "—"}
          </span>
          {rest > 0 && (
            <span className="text-xs text-muted-foreground">
              +{rest} more
            </span>
          )}
        </div>
      );
    },
  },

  // ── Ship to ─────────────────────────────────────────────────────────────────
  {
    accessorKey: "shippingAddress",
    header: "Ship To",
    cell: ({ row }) => {
      const addr = row.original.shippingAddress;
      return addr ? (
        <div className="flex flex-col">
          <span className="text-sm">{addr.fullName}</span>
          <span className="text-xs text-muted-foreground">
            {addr.city}, {addr.country}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },

  // ── Total ───────────────────────────────────────────────────────────────────
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{usd(row.original.totalAmount)}</span>
        {row.original.discountAmount > 0 && (
          <span className="text-xs text-emerald-600">
            -{usd(row.original.discountAmount)} saved
          </span>
        )}
      </div>
    ),
  },

  // ── Order status (buyer-friendly label) ─────────────────────────────────────
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const isShipped = status === "SHIPPED";
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`text-xs font-medium w-fit ${ORDER_STATUS_STYLES[status] ?? ""}`}
          >
            {isShipped && <Package className="mr-1 h-3 w-3" />}
            {ORDER_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      );
    },
  },

  // ── Payment status ──────────────────────────────────────────────────────────
   {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const method = row.original.paymentMethod;
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`text-xs font-medium w-fit ${PAYMENT_STATUS_STYLES[status] ?? ""}`}
          >
            {PAYMENT_STATUS_LABELS[status] ?? status}
          </Badge>
          {method && (
            <span className="text-xs text-muted-foreground capitalize">
              via {method}
            </span>
          )}
        </div>
      );
    },
  }, 

  // ── Date ────────────────────────────────────────────────────────────────────
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    ),
  },

  // ── Actions ─────────────────────────────────────────────────────────────────
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Order Actions</DropdownMenuLabel>

            {/* View order — buyer-facing route, not admin route */}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/buyer/${order.id}`}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                View Order
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Write a Review submenu with individual items */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Star className="mr-2 h-3.5 w-3.5" />
                Write a Review
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {order.items.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link href={`/reviews/${item.productId}`}>
                      <span className="truncate max-w-[200px]">
                        {item.productName}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Copy order number for support / tracking reference */}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderNumber)}
            >
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy Order #
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];