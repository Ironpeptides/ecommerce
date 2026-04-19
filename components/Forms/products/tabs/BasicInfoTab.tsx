"use client";

import { InlineEditField } from "../InlineEditField";
import { updateProductField } from "@/actions/products";

type Props = { product: any };

export function BasicInfoTab({ product }: Props) {
  async function onSave(fieldKey: string, value: string | number) {
    await updateProductField(product.id, fieldKey, value);
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-6 py-4 border-b">
        <h3 className="font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Click the pencil icon next to any field to edit it individually.
        </p>
      </div>
      <div className="px-6">
        <InlineEditField
          label="Product Name"
          value={product.name}
          fieldKey="name"
          productId={product.id}
          onSave={onSave}
        />
        <InlineEditField
          label="Slug"
          value={product.slug}
          fieldKey="slug"
          productId={product.id}
          hint="URL-friendly identifier — changing this will break existing links."
          onSave={onSave}
        />
        <InlineEditField
          label="Description"
          value={product.description}
          fieldKey="description"
          productId={product.id}
          type="textarea"
          onSave={onSave}
        />
        <InlineEditField
          label="SKU"
          value={product.sku}
          fieldKey="sku"
          productId={product.id}
          hint="Stock keeping unit — must be unique."
          onSave={onSave}
        />
        <InlineEditField
          label="Barcode"
          value={product.barcode}
          fieldKey="barcode"
          productId={product.id}
          onSave={onSave}
        />
      </div>
    </div>
  );
}