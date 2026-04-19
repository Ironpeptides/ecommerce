"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "./BaseTable";

interface VariantsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function VariantsTable<TData, TValue>({ columns, data }: VariantsTableProps<TData, TValue>) {
  return (
    <BaseTable
      columns={columns}
      data={data}
      searchPlaceholder="Search variants..."
      entityLabel="variant"
      // global filter searches across product name + SKU + value
    />
  );
}