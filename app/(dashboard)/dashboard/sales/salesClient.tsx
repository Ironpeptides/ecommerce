"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ArrowUpDown, Search, Download, TrendingUp, TrendingDown } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";

// ── Shared search+table wrapper ───────────────────────────────────────────────

function SearchableTable<T>({ data, columns, searchKey, searchPlaceholder }: {
  data: T[]; columns: ColumnDef<T>[]; searchKey: string; searchPlaceholder: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} result(s)</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "secondary", CONFIRMED: "outline", PROCESSING: "outline",
  SHIPPED: "default", DELIVERED: "default", CANCELLED: "destructive", REFUNDED: "destructive",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "default", UNPAID: "secondary", FAILED: "destructive",
  PENDING_APPROVAL: "outline", REFUNDED: "destructive",
};

export function SalesClient({ orders, customers, transactions, revenueSeries }: {
  orders: any; customers: any; transactions: any; revenueSeries: any[];
}) {

  // ── Order columns ────────────────────────────────────────────────────────────
  const orderColumns: ColumnDef<any>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.user?.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-semibold">${row.original.totalAmount?.toFixed(2)}</span>,
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={ORDER_STATUS_COLORS[row.original.orderStatus] as any ?? "secondary"}>
          {row.original.orderStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant={PAYMENT_STATUS_COLORS[row.original.paymentStatus] as any ?? "secondary"}>
          {row.original.paymentStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  // ── Customer columns ─────────────────────────────────────────────────────────
  const customerColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.original.phone ?? "—"}</span>,
    },
    {
      accessorKey: "_count",
      header: "Orders",
      cell: ({ row }) => <span className="font-semibold text-sm">{row.original._count?.orders ?? 0}</span>,
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Subscription",
      cell: ({ row }) => (
        <Badge variant={row.original.subscriptionStatus === "active" ? "default" : "secondary"}>
          {row.original.subscriptionStatus ?? "inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status ? "default" : "destructive"}>
          {row.original.status ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  // ── Transaction columns ──────────────────────────────────────────────────────
  const transactionColumns: ColumnDef<any>[] = [
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.transactionId ?? "—"}</span>
      ),
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">{row.original.order?.orderNumber}</span>
          <span className="text-xs text-muted-foreground">{row.original.order?.user?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Amount <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">${row.original.amount?.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">{row.original.method}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={PAYMENT_STATUS_COLORS[row.original.status] as any ?? "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "paidAt",
      header: "Paid At",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.paidAt
            ? new Date(row.original.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>
      ),
    },
  ];

  const StatCard = ({ label, value, trend, trendUp }: any) => (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trendUp ? "text-green-600" : "text-red-500"}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground text-sm mt-1">Track orders, customers, and transactions.</p>
        </div>
      </div>

      <Tabs defaultValue="allSales">
        <TabsList className="inline-flex h-auto w-full justify-start gap-2 rounded-none border-b bg-transparent p-0">
          {[
            { value: "allSales",     label: "All Sales" },
            { value: "customers",    label: "Customers" },
            { value: "transactions", label: "Transactions" },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="border-b-2 border-transparent px-5 pb-3 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── All Sales ── */}
        <TabsContent value="allSales" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Orders" value={orders?.count ?? 0} trend={orders?.trendLabel} trendUp={orders?.trendUp} />
            <StatCard label="Total Revenue" value={`$${(orders?.data?.reduce((a: number, o: any) => a + o.totalAmount, 0) ?? 0).toLocaleString()}`} />
            <StatCard label="This Month" value={`$${(revenueSeries[revenueSeries.length - 1]?.revenue ?? 0).toLocaleString()}`} trend={orders?.trendLabel} trendUp={orders?.trendUp} />
            <StatCard label="Avg Order Value" value={orders?.count ? `$${((orders?.data?.reduce((a: number, o: any) => a + o.totalAmount, 0) ?? 0) / orders.count).toFixed(2)}` : "$0"} />
          </div>

          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(orders?.data ?? [], "orders")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({
              title: "Sales Report", filename: "sales",
              headers: ["Order #", "Customer", "Total", "Status", "Date"],
              rows: (orders?.data ?? []).map((o: any) => [o.orderNumber, o.user?.name ?? "", `$${o.totalAmount}`, o.orderStatus, new Date(o.createdAt).toLocaleDateString()]),
            })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <SearchableTable data={orders?.data ?? []} columns={orderColumns} searchKey="orderNumber" searchPlaceholder="Search by order number..." />
        </TabsContent>

        {/* ── Customers ── */}
        <TabsContent value="customers" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Total Customers" value={customers?.count ?? 0} trend={customers?.trendLabel} trendUp={customers?.trendUp} />
            <StatCard label="New This Month" value={customers?.newThisMonth ?? 0} />
            <StatCard label="Active Subscriptions" value={(customers?.data ?? []).filter((u: any) => u.subscriptionStatus === "active").length} />
          </div>

          {/* Customer growth chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders per Customer (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(customers?.data ?? []).slice(0, 10).map((c: any) => ({ name: c.name?.split(" ")[0], orders: c._count?.orders ?? 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(customers?.data ?? [], "customers")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({
              title: "Customers Report", filename: "customers",
              headers: ["Name", "Email", "Phone", "Orders", "Subscription", "Joined"],
              rows: (customers?.data ?? []).map((c: any) => [c.name, c.email, c.phone ?? "—", String(c._count?.orders ?? 0), c.subscriptionStatus ?? "inactive", new Date(c.createdAt).toLocaleDateString()]),
            })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <SearchableTable data={customers?.data ?? []} columns={customerColumns} searchKey="name" searchPlaceholder="Search customers..." />
        </TabsContent>

        {/* ── Transactions ── */}
        <TabsContent value="transactions" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Transactions" value={transactions?.count ?? 0} />
            <StatCard label="Total Value" value={`$${(transactions?.totalValue ?? 0).toLocaleString()}`} trend={transactions?.trend} trendUp={transactions?.trendUp} />
            <StatCard label="This Month" value={`$${(transactions?.thisMonthValue ?? 0).toLocaleString()}`} />
            <StatCard label="Paid" value={transactions?.byStatus?.PAID ?? 0} />
          </div>

          {/* Method breakdown chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Payments by Method</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(transactions?.byMethod ?? {}).map(([method, count]) => ({ method, count }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(transactions?.data ?? [], "transactions")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({
              title: "Transactions Report", filename: "transactions",
              headers: ["Transaction ID", "Order #", "Customer", "Amount", "Method", "Status", "Date"],
              rows: (transactions?.data ?? []).map((t: any) => [t.transactionId ?? "—", t.order?.orderNumber ?? "—", t.order?.user?.name ?? "—", `$${t.amount}`, t.method, t.status, t.paidAt ? new Date(t.paidAt).toLocaleDateString() : "—"]),
            })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <SearchableTable data={transactions?.data ?? []} columns={transactionColumns} searchKey="transactionId" searchPlaceholder="Search by transaction ID..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}