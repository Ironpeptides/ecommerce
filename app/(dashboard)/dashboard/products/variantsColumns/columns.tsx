"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
  stock: number;
  sku?: string | null;
  productId: string;
  product?: { id: string; name: string; slug: string };
};

export const variantColumns: ColumnDef<ProductVariant>[] = [
  {
    accessorKey: "product",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    accessorKey: "name",
    header: "Option",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const unit = row.original.unit;
      // prefer structured quantity+unit over raw value string
      const display = quantity != null ? `${quantity}${unit ?? ""}` : row.getValue("value");
      return <Badge variant="outline">{display as string}</Badge>;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price Override
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number | null;
      if (!price) return <span className="text-muted-foreground">—</span>;
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stock
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const isOut = stock === 0;
      return (
        <span className={isOut ? "text-red-500 font-medium" : ""}>
          {stock} units{isOut ? " — Out of stock" : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      const sku = row.getValue("sku") as string | null;
      return sku ? (
        <span className="font-mono text-xs">{sku}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
];