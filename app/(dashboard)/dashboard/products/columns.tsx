"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import Image from "next/image";
import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | null;
  salePrice?: number | null;
  sku?: string | null;
  stock: number;
  lowStock: number;
  isActive: boolean;
  isFeatured: boolean;
  casNumber?: string | null;
  formula?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string } | null;
  images?: { url: string; isPrimary: boolean }[];
  variants?: { id: string }[];
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
      return (
        <div className="flex items-center gap-3">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              width={36}
              height={36}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
              N/A
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            {product.sku && (
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? (
        <Badge variant="outline">{category.name}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      const salePrice = row.original.salePrice;
      if (!price) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col">
          {salePrice ? (
            <>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(salePrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}
              </span>
            </>
          ) : (
            <span className="font-medium">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}
            </span>
          )}
        </div>
      );
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
      const lowStock = row.original.lowStock;
      const isLow = stock <= lowStock && stock > 0;
      const isOut = stock === 0;
      return (
        <div className="flex flex-col gap-1">
          <span className={isOut ? "text-red-500 font-medium" : isLow ? "text-amber-500 font-medium" : ""}>
            {stock} units
          </span>
          {isLow && !isOut && (
            <span className="text-xs text-amber-500">Low stock</span>
          )}
          {isOut && (
            <span className="text-xs text-red-500">Out of stock</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "variants",
    header: "Variants",
    cell: ({ row }) => {
      const count = row.original.variants?.length ?? 0;
      return count > 0 ? (
        <Badge variant="secondary">{count} variant{count !== 1 ? "s" : ""}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => {
      const featured = row.getValue("isFeatured") as boolean;
      return featured ? (
        <Badge variant="default">Featured</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-muted-foreground text-sm">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${product.slug}/edit`}>
               View / Edit
             </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.slug}`} target="_blank">
                View on storefront
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];