"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "./BaseTable";

interface ProductTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ProductTable<TData, TValue>({ columns, data }: ProductTableProps<TData, TValue>) {
  return (
    <BaseTable
      columns={columns}
      data={data}
      searchPlaceholder="Search products..."
      entityLabel="product"
      // global filter so it searches across name + SKU + category
    />
  );
}