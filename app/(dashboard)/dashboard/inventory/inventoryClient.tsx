"use client";

import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Search, Download, Package, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export";

type StockProduct = {
  id: string; name: string; slug: string; sku: string | null;
  stock: number; lowStock: number; isActive: boolean;
  stockStatus: string;
  category: { title: string } | null;
  images: { url: string }[];
  variants: { id: string; name: string; value: string; stock: number; unit: string | null }[];
  variantStockTotal: number;
};

const STATUS_BADGE: Record<string, { label: string; variant: any; icon: any }> = {
  OUT_OF_STOCK: { label: "Out of Stock", variant: "destructive", icon: XCircle },
  LOW_STOCK:    { label: "Low Stock",    variant: "warning",     icon: AlertTriangle },
  HEALTHY:      { label: "In Stock",     variant: "default",     icon: CheckCircle2 },
};

function StockTable({ data, filter }: { data: StockProduct[]; filter: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<StockProduct>[] = [
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
          {row.original.sku && <span className="text-xs text-muted-foreground">SKU: {row.original.sku}</span>}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.category?.title ?? "—"}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Stock <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const { stock, lowStock } = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${stock === 0 ? "text-destructive" : stock <= lowStock ? "text-yellow-600" : "text-green-600"}`}>
              {stock}
            </span>
            <span className="text-xs text-muted-foreground">/ {lowStock} min</span>
          </div>
        );
      },
    },
    {
      accessorKey: "variantStockTotal",
      header: "Variant Stock",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.variants.length > 0 ? row.original.variantStockTotal : "—"}</span>
      ),
    },
    {
      accessorKey: "stockStatus",
      header: "Status",
      cell: ({ row }) => {
        const cfg = STATUS_BADGE[row.original.stockStatus] ?? STATUS_BADGE.HEALTHY;
        const Icon = cfg.icon;
        return (
          <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" /> {cfg.label}
          </Badge>
        );
      },
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => {
        const variants = row.original.variants;
        if (!variants.length) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {variants.slice(0, 3).map((v) => (
              <Badge key={v.id} variant="outline" className="text-xs">
                {v.value}: {v.stock}
              </Badge>
            ))}
            {variants.length > 3 && (
              <Badge variant="outline" className="text-xs">+{variants.length - 3}</Badge>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
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
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} product(s)</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}

export function InventoryClient({ stockData }: { stockData: any }) {
  const { data, outOfStockCount, lowStockCount, healthyCount, totalProducts, categorized } = stockData;

  const handleExportCSV = () => {
    exportToCSV(
      data.map((p: StockProduct) => ({
        Name: p.name, SKU: p.sku ?? "", Category: p.category?.title ?? "",
        Stock: p.stock, MinStock: p.lowStock, Status: p.stockStatus,
        VariantStock: p.variantStockTotal,
      })),
      "stock-levels"
    );
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: "Stock Levels Report",
      headers: ["Product", "SKU", "Category", "Stock", "Min", "Status"],
      rows: data.map((p: StockProduct) => [
        p.name, p.sku ?? "—", p.category?.title ?? "—",
        String(p.stock), String(p.lowStock), p.stockStatus,
      ]),
      filename: "stock-levels",
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor stock levels across all products and variants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products",  value: totalProducts,    icon: Package,        color: "text-foreground" },
          { label: "Healthy Stock",   value: healthyCount,     icon: CheckCircle2,   color: "text-green-600" },
          { label: "Low Stock",       value: lowStockCount,    icon: AlertTriangle,  color: "text-yellow-600" },
          { label: "Out of Stock",    value: outOfStockCount,  icon: XCircle,        color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs by status */}
      <Tabs defaultValue="all">
        <TabsList className="inline-flex h-auto w-full justify-start gap-2 rounded-none border-b bg-transparent p-0">
          {[
            { value: "all",           label: `All (${totalProducts})` },
            { value: "out_of_stock",  label: `Out of Stock (${outOfStockCount})` },
            { value: "low_stock",     label: `Low Stock (${lowStockCount})` },
            { value: "healthy",       label: `Healthy (${healthyCount})` },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="border-b-2 border-transparent px-4 pb-3 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="pt-4"><StockTable data={data} filter="all" /></TabsContent>
        <TabsContent value="out_of_stock" className="pt-4"><StockTable data={categorized.outOfStock} filter="out" /></TabsContent>
        <TabsContent value="low_stock" className="pt-4"><StockTable data={categorized.lowStock} filter="low" /></TabsContent>
        <TabsContent value="healthy" className="pt-4"><StockTable data={categorized.healthy} filter="healthy" /></TabsContent>
      </Tabs>
    </div>
  );
}