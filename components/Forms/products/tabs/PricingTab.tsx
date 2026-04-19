"use client";

import { InlineEditField } from "../InlineEditField";
import { updateProductField } from "@/actions/products";

type Props = { product: any };

const usd = (val: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(val));

export function PricingTab({ product }: Props) {
  async function onSave(fieldKey: string, value: string | number) {
    await updateProductField(product.id, fieldKey, value);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium">Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Set the regular price and an optional sale price. If a sale price is
            set, it will be shown to customers instead.
          </p>
        </div>
        <div className="px-6">
          <InlineEditField
            label="Regular Price"
            value={product.price}
            fieldKey="price"
            productId={product.id}
            type="currency"
            formatter={usd}
            onSave={onSave}
          />
          <InlineEditField
            label="Sale Price"
            value={product.salePrice}
            fieldKey="salePrice"
            productId={product.id}
            type="currency"
            formatter={usd}
            hint="Leave blank to show regular price."
            onSave={onSave}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium">Stock</h3>
        </div>
        <div className="px-6">
          <InlineEditField
            label="Stock Quantity"
            value={product.stock}
            fieldKey="stock"
            productId={product.id}
            type="number"
            onSave={onSave}
          />
          <InlineEditField
            label="Low Stock Threshold"
            value={product.lowStock}
            fieldKey="lowStock"
            productId={product.id}
            type="number"
            hint="You'll be alerted when stock falls to or below this number."
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}