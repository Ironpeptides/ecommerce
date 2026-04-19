"use client";

import { useState, useTransition } from "react";
import { InlineEditField } from "../InlineEditField";
import { updateProductField } from "@/actions/products";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical, Settings2, Eye, Star, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  product: {
    id: string;
    isActive: boolean;
    isFeatured: boolean;
    casNumber?: string | null;
    formula?: string | null;
    molarMass?: string | null;
  };
};

function ToggleField({
  label,
  description,
  checked,
  onToggle,
  activeLabel,
  inactiveLabel,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (val: boolean) => Promise<void>;
  activeLabel: string;
  inactiveLabel: string;
}) {
  const [value, setValue] = useState(checked);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setValue(next);
    startTransition(async () => {
      try {
        await onToggle(next);
        toast.success(`${label} updated`);
      } catch {
        setValue(!next); // revert
        toast.error(`Failed to update ${label.toLowerCase()}`);
      }
    });
  }

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="flex-1 pr-6">
        <Label className="text-sm font-medium cursor-pointer" htmlFor={label}>
          {label}
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={value ? "default" : "secondary"} className="text-xs min-w-[70px] justify-center">
          {value ? activeLabel : inactiveLabel}
        </Badge>
        {isPending
          ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          : <Switch id={label} checked={value} onCheckedChange={handleChange} />}
      </div>
    </div>
  );
}

export function AdvancedTab({ product }: Props) {
  async function onSave(fieldKey: string, value: string | number) {
    await updateProductField(product.id, fieldKey, value);
  }

  async function toggleField(fieldKey: string, value: boolean) {
    await updateProductField(product.id, fieldKey, value);
  }

  return (
    <div className="space-y-6">
      {/* Visibility */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-500/10 flex items-center justify-center">
            <Settings2 className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold">Visibility & Status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control how this product appears to customers.
            </p>
          </div>
        </div>
        <div className="px-6">
          <ToggleField
            label="Active"
            description="Inactive products are hidden from the storefront entirely."
            checked={product.isActive}
            onToggle={(val) => toggleField("isActive", val)}
            activeLabel="Active"
            inactiveLabel="Inactive"
          />
          <ToggleField
            label="Featured"
            description="Featured products appear on the homepage and at the top of listings."
            checked={product.isFeatured}
            onToggle={(val) => toggleField("isFeatured", val)}
            activeLabel="Featured"
            inactiveLabel="Not featured"
          />
        </div>
      </div>

      {/* Peptide / Chemical details */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FlaskConical className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold">Chemical Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scientific metadata displayed on the product page for informed buyers.
            </p>
          </div>
        </div>
        <div className="px-6">
          <InlineEditField
            label="CAS Number"
            value={product.casNumber}
            fieldKey="casNumber"
            productId={product.id}
            hint="e.g. 137525-51-0"
            onSave={onSave}
          />
          <InlineEditField
            label="Molecular Formula"
            value={product.formula}
            fieldKey="formula"
            productId={product.id}
            hint="e.g. C₃₈H₄₉N₉O₅"
            onSave={onSave}
          />
          <InlineEditField
            label="Molar Mass"
            value={product.molarMass}
            fieldKey="molarMass"
            productId={product.id}
            hint="e.g. 751.87 g/mol"
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}