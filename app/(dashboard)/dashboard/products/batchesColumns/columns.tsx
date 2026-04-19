"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Batch = {
  id: string;
  batchNumber: string;
  purity?: number | null;
  coaUrl?: string | null;
  manufacturedAt?: Date | null;
  expiryDate?: Date | null;
  quantity?: number | null;
  createdAt?: Date;
  productId: string;
  product?: { id: string; name: string; slug: string };
};

export const batchColumns: ColumnDef<Batch>[] = [
  {
    accessorKey: "batchNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Batch #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.getValue("batchNumber")}
      </span>
    ),
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original.product;
      return product ? (
        <span className="font-medium">{product.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "purity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Purity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const purity = row.getValue("purity") as number | null;
      if (purity == null) return <span className="text-muted-foreground">—</span>;
      const isHigh = purity >= 98;
      return (
        <Badge variant={isHigh ? "default" : "secondary"}>
          {purity.toFixed(1)}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => {
      const qty = row.getValue("quantity") as number | null;
      return qty != null ? (
        <span>{qty} units</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "manufacturedAt",
    header: "Manufactured",
    cell: ({ row }) => {
      const date = row.getValue("manufacturedAt") as Date | null;
      if (!date) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-muted-foreground text-sm">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Expiry
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("expiryDate") as Date | null;
      if (!date) return <span className="text-muted-foreground">—</span>;
      const expired = new Date(date) < new Date();
      return (
        <span className={`text-sm ${expired ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {expired && " — Expired"}
        </span>
      );
    },
  },
  {
    accessorKey: "coaUrl",
    header: "CoA",
    cell: ({ row }) => {
      const url = row.getValue("coaUrl") as string | null;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const batch = row.original;
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(batch.batchNumber)}
            >
              Copy batch number
            </DropdownMenuItem>
            {batch.coaUrl && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.open(batch.coaUrl!, "_blank")}
                >
                  Open CoA
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete batch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];