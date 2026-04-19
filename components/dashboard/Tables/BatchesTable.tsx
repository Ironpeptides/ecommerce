"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "./BaseTable";

interface BatchesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function BatchesTable<TData, TValue>({ columns, data }: BatchesTableProps<TData, TValue>) {
  return (
    <BaseTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by batch number..."
      searchColumnKey="batchNumber" // column filter — batch numbers are precise lookups
      entityLabel="batch"
    />
  );
}