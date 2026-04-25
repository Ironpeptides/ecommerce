"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Marketer = { id: string; name: string; email: string };
type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  marketerId: string | null;
  commissionRate: number | null;
  marketer: Marketer | null;
  _count: { orders: number };
};

interface CouponFormProps {
  coupon?: Coupon | null;
  marketers: Marketer[];
  onSaved: (coupon: Coupon) => void;
  onCancel: () => void;
}

export function CouponForm({ coupon, marketers, onSaved, onCancel }: CouponFormProps) {
  const isEdit = !!coupon;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    discountType: coupon?.discountType ?? "PERCENTAGE",
    discountValue: coupon?.discountValue?.toString() ?? "",
    minOrderAmount: coupon?.minOrderAmount?.toString() ?? "",
    maxDiscount: coupon?.maxDiscount?.toString() ?? "",
    usageLimit: coupon?.usageLimit?.toString() ?? "",
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split("T")[0]
      : "",
    isActive: coupon?.isActive ?? true,
    marketerId: coupon?.marketerId ?? "",
    commissionRate: coupon?.commissionRate
      ? (coupon.commissionRate * 100).toString()
      : "",
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async () => {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (!form.discountValue) { toast.error("Discount value is required"); return; }
    if (form.marketerId && !form.commissionRate) {
      toast.error("Commission rate is required when a marketer is assigned");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        commissionRate: form.commissionRate
          ? parseFloat(form.commissionRate) / 100  // store as decimal
          : null,
        marketerId: form.marketerId || null,
        expiresAt: form.expiresAt || null,
        minOrderAmount: form.minOrderAmount || null,
        maxDiscount: form.maxDiscount || null,
        usageLimit: form.usageLimit || null,
        description: form.description || null,
      };

      const res = await fetch(
        isEdit ? `/api/coupons/${coupon.id}` : "/api/coupons",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }

      toast.success(isEdit ? "Coupon updated" : "Coupon created");
      onSaved(json.data);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 py-2">
      {/* Code */}
      <div className="space-y-1.5">
        <Label>Coupon Code <span className="text-red-500">*</span></Label>
        <Input
          placeholder="e.g. SUMMER20"
          value={form.code}
          onChange={set("code")}
          className="uppercase font-mono"
        />
        <p className="text-xs text-muted-foreground">Will be saved in uppercase automatically.</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="Optional note about this coupon..."
          value={form.description}
          onChange={set("description")}
          rows={2}
        />
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Discount Type <span className="text-red-500">*</span></Label>
          <Select
            value={form.discountType}
            onValueChange={(v) => setForm((p) => ({ ...p, discountType: v as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>
            Discount Value <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 10"}
            value={form.discountValue}
            onChange={set("discountValue")}
          />
        </div>
      </div>

      {/* Min order + max discount */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Min Order Amount</Label>
          <Input
            type="number"
            placeholder="e.g. 50"
            value={form.minOrderAmount}
            onChange={set("minOrderAmount")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Max Discount Cap</Label>
          <Input
            type="number"
            placeholder="e.g. 100"
            value={form.maxDiscount}
            onChange={set("maxDiscount")}
          />
        </div>
      </div>

      {/* Usage limit + expiry */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Usage Limit</Label>
          <Input
            type="number"
            placeholder="Leave empty for unlimited"
            value={form.usageLimit}
            onChange={set("usageLimit")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Expiry Date</Label>
          <Input
            type="date"
            value={form.expiresAt}
            onChange={set("expiresAt")}
          />
        </div>
      </div>

      {/* Marketer */}
      <div className="space-y-1.5">
        <Label>Assign to Marketer</Label>
        <Select
          value={form.marketerId || "none"}
          onValueChange={(v) =>
            setForm((p) => ({ ...p, marketerId: v === "none" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="No marketer (general coupon)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No marketer</SelectItem>
            {marketers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} — {m.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Commission rate — only show if marketer selected */}
      {form.marketerId && (
        <div className="space-y-1.5">
          <Label>Commission Rate (%) <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            placeholder="e.g. 10 for 10%"
            value={form.commissionRate}
            onChange={set("commissionRate")}
          />
          <p className="text-xs text-muted-foreground">
            The marketer earns this % of the order value each time this coupon is used.
          </p>
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Active</p>
          <p className="text-xs text-muted-foreground">
            Inactive coupons cannot be applied at checkout.
          </p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={submit} disabled={loading} className="flex-1">
          {loading ? (
            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
          ) : isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </div>
  );
}