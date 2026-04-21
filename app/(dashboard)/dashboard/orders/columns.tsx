"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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
  adminApprovedAt?: Date | null;
  user: { id: string; name: string; email: string };
  items: { id: string; productName: string; quantity: number; price: number }[];
  shippingAddress?: {
    fullName: string; city: string; country: string;
  } | null;
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  CONFIRMED:   "bg-blue-500/10 text-blue-600 border-blue-500/30",
  PROCESSING:  "bg-purple-500/10 text-purple-600 border-purple-500/30",
  SHIPPED:     "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  DELIVERED:   "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  CANCELLED:   "bg-red-500/10 text-red-600 border-red-500/30",
  REFUNDED:    "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  UNPAID:           "bg-red-500/10 text-red-600 border-red-500/30",
  PENDING_APPROVAL: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  PAID:             "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  PARTIALLY_PAID:   "bg-blue-500/10 text-blue-600 border-blue-500/30",
  REFUNDED:         "bg-orange-500/10 text-orange-600 border-orange-500/30",
  FAILED:           "bg-red-500/10 text-red-600 border-red-500/30",
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
  {
    accessorKey: "user",
    header: "Buyer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{row.original.user.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "shippingAddress",
    header: "Ship To",
    cell: ({ row }) => {
      const addr = row.original.shippingAddress;
      return addr ? (
        <span className="text-sm text-muted-foreground">
          {addr.city}, {addr.country}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{usd(row.original.totalAmount)}</span>
        {row.original.discountAmount > 0 && (
          <span className="text-xs text-emerald-600">
            -{usd(row.original.discountAmount)} off
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      return (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${ORDER_STATUS_STYLES[status] ?? ""}`}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const method = row.original.paymentMethod;
      const awaitingApproval = status === "PENDING_APPROVAL";
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`text-xs font-medium w-fit ${PAYMENT_STATUS_STYLES[status] ?? ""}`}
          >
            {awaitingApproval ? "⏳ Awaiting Approval" : status.replace(/_/g, " ")}
          </Badge>
          {method && (
            <span className="text-xs text-muted-foreground capitalize">{method}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric",
        })}
      </span>
    ),
  },
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/admin/${order.id}`}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.orderNumber)}
            >
              Copy order #
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.user.email)}
            >
              Copy buyer email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];