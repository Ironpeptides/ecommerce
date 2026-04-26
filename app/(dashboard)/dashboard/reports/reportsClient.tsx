"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, Search, ArrowUpDown, TrendingUp, TrendingDown, Star } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";

const CHART_COLORS = [
  "hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
];

function ReportTable<T>({ data, columns, searchKey, placeholder }: {
  data: T[]; columns: ColumnDef<T>[]; searchKey: string; placeholder: string;
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
          placeholder={placeholder}
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
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No data.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} record(s)</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}

export function ReportsClient({ products, customers, orders, revenueSeries }: {
  products: any[]; customers: any; orders: any; revenueSeries: any[];
}) {

  // ── Product report columns ────────────────────────────────────────────────────
  const productColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Product <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.category?.title ?? "Uncategorised"}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalUnitsSold",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Units Sold <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-semibold">{row.original.totalUnitsSold}</span>,
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Revenue <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-semibold">${row.original.totalRevenue.toFixed(2)}</span>,
    },
    {
      accessorKey: "averageRating",
      header: "Avg Rating",
      cell: ({ row }) => {
        const r = row.original.averageRating;
        return r ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{r}</span>
          </div>
        ) : <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span className={`text-sm font-medium ${row.original.stock === 0 ? "text-destructive" : row.original.stock <= row.original.lowStock ? "text-yellow-600" : "text-green-600"}`}>
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      cell: ({ row }) => (
        <Badge variant={row.original.stockStatus === "Out of Stock" ? "destructive" : row.original.stockStatus === "Low Stock" ? "outline" : "default"}>
          {row.original.stockStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "_count",
      header: "Reviews",
      cell: ({ row }) => <span className="text-sm">{row.original._count?.reviews ?? 0}</span>,
    },
  ];

  // ── Customer report columns ──────────────────────────────────────────────────
  const customerColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Customer <ArrowUpDown className="ml-1 h-3 w-3" />
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
      accessorKey: "_count",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Orders <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-semibold">{row.original._count?.orders ?? 0}</span>,
    },
    {
      accessorKey: "reviews",
      header: "Reviews",
      cell: ({ row }) => <span>{row.original._count?.reviews ?? 0}</span>,
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
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  // ── Sales report columns ─────────────────────────────────────────────────────
  const salesColumns: ColumnDef<any>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }) => <span className="text-sm">{row.original.user?.name ?? "—"}</span>,
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
      accessorKey: "discountAmount",
      header: "Discount",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.discountAmount > 0 ? `-$${row.original.discountAmount.toFixed(2)}` : "—"}</span>
      ),
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => <Badge variant="outline">{row.original.orderStatus}</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  // ── Derived chart data ────────────────────────────────────────────────────────
  const topProducts = [...products].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 8);
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star}★`,
    count: products.filter((p) => Math.round(p.averageRating ?? 0) === star).length,
  }));
  const customerOrderDist = [
    { range: "0 orders",  count: (customers?.data ?? []).filter((c: any) => c._count?.orders === 0).length },
    { range: "1–3",       count: (customers?.data ?? []).filter((c: any) => c._count?.orders >= 1 && c._count?.orders <= 3).length },
    { range: "4–10",      count: (customers?.data ?? []).filter((c: any) => c._count?.orders >= 4 && c._count?.orders <= 10).length },
    { range: "10+",       count: (customers?.data ?? []).filter((c: any) => c._count?.orders > 10).length },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Analytics and exportable reports across products, customers, and sales.</p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="inline-flex h-auto w-full justify-start gap-2 rounded-none border-b bg-transparent p-0">
          {[
            { value: "products",  label: "Product Reports" },
            { value: "customers", label: "Customer Reports" },
            { value: "sales",     label: "Sales Reports" },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="border-b-2 border-transparent px-5 pb-3 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Product Reports ── */}
        <TabsContent value="products" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Products",   value: products.length },
              { label: "Total Units Sold", value: products.reduce((a, p) => a + p.totalUnitsSold, 0).toLocaleString() },
              { label: "Total Revenue",    value: `$${products.reduce((a, p) => a + p.totalRevenue, 0).toLocaleString()}` },
              { label: "Out of Stock",     value: products.filter((p) => p.stockStatus === "Out of Stock").length },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Top Products by Revenue</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topProducts.map((p) => ({ name: p.name.substring(0, 12), revenue: p.totalRevenue }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: any) => [`$${v.toFixed(2)}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Products by Rating</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ratingDist}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="star" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(products.map((p) => ({ Name: p.name, Category: p.category?.title ?? "", "Units Sold": p.totalUnitsSold, Revenue: p.totalRevenue.toFixed(2), Rating: p.averageRating ?? "—", Stock: p.stock, Status: p.stockStatus })), "product-report")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: "Product Report", filename: "product-report", headers: ["Product", "Category", "Units Sold", "Revenue", "Rating", "Stock", "Status"], rows: products.map((p) => [p.name, p.category?.title ?? "—", String(p.totalUnitsSold), `$${p.totalRevenue.toFixed(2)}`, String(p.averageRating ?? "—"), String(p.stock), p.stockStatus]) })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <ReportTable data={products} columns={productColumns} searchKey="name" placeholder="Search products..." />
        </TabsContent>

        {/* ── Customer Reports ── */}
        <TabsContent value="customers" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Customers",       value: customers?.count ?? 0 },
              { label: "New This Month",         value: customers?.newThisMonth ?? 0 },
              { label: "Active Subscriptions",   value: (customers?.data ?? []).filter((u: any) => u.subscriptionStatus === "active").length },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Customer Order Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={customerOrderDist}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Subscription Status Split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active",   value: (customers?.data ?? []).filter((u: any) => u.subscriptionStatus === "active").length },
                        { name: "Inactive", value: (customers?.data ?? []).filter((u: any) => u.subscriptionStatus !== "active").length },
                      ]}
                      cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {CHART_COLORS.slice(0, 2).map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV((customers?.data ?? []).map((c: any) => ({ Name: c.name, Email: c.email, Phone: c.phone ?? "", Orders: c._count?.orders ?? 0, Subscription: c.subscriptionStatus ?? "inactive", Joined: new Date(c.createdAt).toLocaleDateString() })), "customer-report")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: "Customer Report", filename: "customer-report", headers: ["Name", "Email", "Phone", "Orders", "Subscription", "Joined"], rows: (customers?.data ?? []).map((c: any) => [c.name, c.email, c.phone ?? "—", String(c._count?.orders ?? 0), c.subscriptionStatus ?? "inactive", new Date(c.createdAt).toLocaleDateString()]) })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <ReportTable data={customers?.data ?? []} columns={customerColumns} searchKey="name" placeholder="Search customers..." />
        </TabsContent>

        {/* ── Sales Reports ── */}
        <TabsContent value="sales" className="pt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Orders",   value: orders?.count ?? 0 },
              { label: "Total Revenue",  value: `$${(orders?.data ?? []).reduce((a: number, o: any) => a + o.totalAmount, 0).toLocaleString()}` },
              { label: "This Month",     value: `$${(revenueSeries[revenueSeries.length - 1]?.revenue ?? 0).toLocaleString()}`, trend: orders?.trendLabel, trendUp: orders?.trendUp },
              { label: "Avg Order",      value: orders?.count ? `$${((orders?.data ?? []).reduce((a: number, o: any) => a + o.totalAmount, 0) / orders.count).toFixed(2)}` : "$0" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  {s.trend && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${s.trendUp ? "text-green-600" : "text-red-500"}`}>
                      {s.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {s.trend}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Revenue Trend — 6 Months</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Orders per Month</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV((orders?.data ?? []).map((o: any) => ({ "Order #": o.orderNumber, Customer: o.user?.name ?? "", Total: o.totalAmount, Discount: o.discountAmount, Status: o.orderStatus, Date: new Date(o.createdAt).toLocaleDateString() })), "sales-report")} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: "Sales Report", filename: "sales-report", headers: ["Order #", "Customer", "Total", "Discount", "Status", "Date"], rows: (orders?.data ?? []).map((o: any) => [o.orderNumber, o.user?.name ?? "—", `$${o.totalAmount}`, o.discountAmount > 0 ? `-$${o.discountAmount}` : "—", o.orderStatus, new Date(o.createdAt).toLocaleDateString()]) })} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>

          <ReportTable data={orders?.data ?? []} columns={salesColumns} searchKey="orderNumber" placeholder="Search by order number..." />
        </TabsContent>
      </Tabs>
    </div>
  );
}