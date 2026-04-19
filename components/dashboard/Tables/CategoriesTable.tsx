"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "./BaseTable";

interface CategoriesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function CategoriesTable<TData, TValue>({ columns, data }: CategoriesTableProps<TData, TValue>) {
  return (
    <BaseTable
      columns={columns}
      data={data}
      searchPlaceholder="Search categories..."
      searchColumnKey="name"
      entityLabel="category"
    />
  );
}