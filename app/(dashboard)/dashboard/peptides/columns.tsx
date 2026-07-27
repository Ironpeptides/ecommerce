"use client";

import { ColumnDef } from "@tanstack/react-table";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import Link from "next/link";
import { Eye } from "lucide-react";

export type PeptideInfoRow = {
  id: string;
  slug: string;
  name: string;
  productSlug: string | null;
  metaTitle: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<PeptideInfoRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "productSlug",
    header: "Product",
    cell: ({ row }) => {
      const slug = row.original.productSlug;
      return slug ? (
        <Link
          href={`/product/${slug}`}
          className="text-blue-500 hover:underline"
          target="_blank"
        >
          {slug}
        </Link>
      ) : (
        <span className="text-gray-500">—</span>
      );
    },
  },
  {
    accessorKey: "view",
    header: "View Page",
    cell: ({ row }) => (
      <Link
        href={`/peptides/${row.original.slug}`}
        target="_blank"
        className="flex items-center justify-center text-blue-500"
      >
        <Eye size={16} />
      </Link>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const peptide = row.original;
      return (
        <ActionColumn
          row={row}
          model="peptideInfo"
          editEndpoint={`peptides/update/${peptide.id}`}
          id={peptide.id}
        />
      );
    },
  },
];