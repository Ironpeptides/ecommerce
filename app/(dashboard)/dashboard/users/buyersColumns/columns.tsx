"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Replace your Buyer type with this
// Update this in your columns file
export type Buyer = {
  id: string;
  name: string;
  email: string;
  status: boolean; // Match Prisma Boolean
  roles: any[];    // Prisma include: { roles: true } returns an array
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // If these are calculated fields, they are likely optional
  totalOrders?: number;
  totalSpent?: number;
};

export const buyerColumns: ColumnDef<Buyer>[] = [
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
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.getValue("phone") ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ row }) => {
      const val = row.getValue("totalOrders") as number | undefined;
      return val ?? <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => {
      const amount = row.getValue("totalSpent") as number | undefined;
      if (!amount) return <span className="text-muted-foreground">—</span>;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },
  {
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const isActive = row.getValue("status") as boolean; // This is now a true boolean
    
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
        Joined
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
];