"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Plus, Tag, Search } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { CouponForm } from "@/components/coupons/couponForm";

type Marketer = { id: string; name: string; email: string };

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  marketerId: string | null;
  commissionRate: number | null;
  marketer: Marketer | null;
  _count: { orders: number };
};

interface CouponsClientProps {
  coupons: Coupon[];
  marketers: Marketer[];
}

export function CouponsClient({ coupons: initial, marketers }: CouponsClientProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toggle active state inline
  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error();
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const onSaved = (coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.find((c) => c.id === coupon.id);
      return exists
        ? prev.map((c) => (c.id === coupon.id ? coupon : c))
        : [coupon, ...prev];
    });
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Code <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold tracking-wider text-sm">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "discountType",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.getValue("discountType") as string;
        const value = row.original.discountValue;
        return (
          <Badge variant="outline">
            {type === "PERCENTAGE" ? `${value}% off` : `$${value} off`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "Usage",
      cell: ({ row }) => {
        const used = row.original.usageCount;
        const limit = row.original.usageLimit;
        return (
          <span className="text-sm text-muted-foreground">
            {used}{limit ? ` / ${limit}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "marketer",
      header: "Marketer",
      cell: ({ row }) => {
        const marketer = row.original.marketer;
        const rate = row.original.commissionRate;
        if (!marketer) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{marketer.name}</span>
            {rate && (
              <span className="text-xs text-muted-foreground">{rate * 100}% commission</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const date = row.original.expiresAt;
        if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
        const expired = new Date(date) < new Date();
        return (
          <span className={`text-sm ${expired ? "text-red-500" : "text-muted-foreground"}`}>
            {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            {expired && " (expired)"}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => toggleActive(row.original)}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(coupon.code)}
              >
                Copy code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { setEditingCoupon(coupon); setDialogOpen(true); }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                disabled={deletingId === coupon.id}
                onClick={() => deleteCoupon(coupon.id)}
              >
                {deletingId === coupon.id ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm">
            Manage discount codes and marketer commissions.
          </p>
        </div>
        <Button
          onClick={() => { setEditingCoupon(null); setDialogOpen(true); }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length },
          { label: "Active", value: coupons.filter((c) => c.isActive).length },
          { label: "With Marketer", value: coupons.filter((c) => c.marketerId).length },
          { label: "Total Uses", value: coupons.reduce((acc, c) => acc + c.usageCount, 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by code..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("code")?.setFilterValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} coupon(s)
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <CouponForm
            coupon={editingCoupon}
            marketers={marketers}
            onSaved={onSaved}
            onCancel={() => { setDialogOpen(false); setEditingCoupon(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}