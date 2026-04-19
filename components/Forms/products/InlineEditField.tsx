"use client";

import { useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type FieldType = "text" | "number" | "textarea" | "currency";

type Props = {
  label: string;
  value: string | number | null | undefined;
  fieldKey: string;
  productId: string;
  type?: FieldType;
  hint?: string;
  formatter?: (val: string | number) => string;
  onSave: (fieldKey: string, value: string | number) => Promise<void>;
};

export function InlineEditField({
  label,
  value,
  fieldKey,
  productId,
  type = "text",
  hint,
  formatter,
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);

  const displayValue = formatter
    ? formatter(value ?? "")
    : (value ?? <span className="text-muted-foreground italic">Not set</span>);

  async function handleSave() {
    setSaving(true);
    try {
      const parsed = type === "number" || type === "currency"
        ? parseFloat(inputVal)
        : inputVal;
      await onSave(fieldKey, parsed);
      toast.success(`${label} updated`);
      setEditing(false);
    } catch {
      toast.error(`Failed to update ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setInputVal(String(value ?? ""));
    setEditing(false);
  }

  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>

        {editing ? (
          <div className="space-y-2 pr-4">
            {type === "textarea" ? (
              <Textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                rows={3}
                autoFocus
                className="text-sm"
              />
            ) : (
              <Input
                type={type === "currency" ? "number" : type}
                step={type === "currency" ? "0.01" : undefined}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
                className="text-sm max-w-xs"
              />
            )}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        ) : (
          <p className={cn("text-sm", !value && "text-muted-foreground italic")}>
            {displayValue}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 ml-4 flex-shrink-0 pt-0.5">
        {editing ? (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}