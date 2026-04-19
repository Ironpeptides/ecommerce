"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { addProductVariant, deleteProductVariant } from "@/actions/products";

const UNITS = ["mg", "mcg", "g", "ml", "IU"] as const;

const schema = z.object({
  quantity: z.coerce.number().positive("Must be a positive number"),
  unit: z.enum(UNITS),
  price: z.coerce.number().min(0, "Must be 0 or more"),
  stock: z.coerce.number().int().min(0, "Must be 0 or more"),
  sku: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Variant = {
  id: string;
  name: string;
  value: string;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
  stock: number;
  sku?: string | null;
};

type Props = {
  product: { id: string; name: string; variants: Variant[] };
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function VariantsTab({ product }: Props) {
  const [variants, setVariants] = useState<Variant[]>(product.variants ?? []);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "mg", stock: 0, price: 0 },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const variant = await addProductVariant(product.id, {
          name: "Quantity",
          value: `${values.quantity}${values.unit}`,
          quantity: values.quantity,
          unit: values.unit,
          price: values.price,
          stock: values.stock,
          sku: values.sku || undefined,
        });
        setVariants((prev) => [...prev, variant]);
        form.reset({ unit: "mg", stock: 0, price: 0 });
        setShowForm(false);
        toast.success("Variant added");
      } catch {
        toast.error("Failed to add variant");
      }
    });
  }

  async function handleDelete(variantId: string) {
    setDeletingId(variantId);
    try {
      await deleteProductVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success("Variant removed");
    } catch {
      toast.error("Failed to remove variant");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Quantity Variants</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each variant is a different quantity of {product.name} at its own price.
              </p>
            </div>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Variant
            </Button>
          )}
        </div>

        {/* Variants list */}
        <div className="divide-y">
          {variants.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No variants yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Add variants for different quantities, e.g. 2mg, 5mg, 10mg — each with its own price and stock.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 gap-1.5"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add first variant
              </Button>
            </div>
          )}

          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                  {variant.quantity != null
                    ? `${variant.quantity}${variant.unit ?? ""}`
                    : variant.value}
                </Badge>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {variant.price != null ? usd(variant.price) : "— no price set"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {variant.stock} in stock
                    {variant.sku && ` · SKU: ${variant.sku}`}
                  </span>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    disabled={deletingId === variant.id}
                  >
                    {deletingId === variant.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this variant?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the{" "}
                      <strong>
                        {variant.quantity}{variant.unit}
                      </strong>{" "}
                      variant. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleDelete(variant.id)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {/* Inline add form */}
          {showForm && (
            <div className="px-6 py-5 bg-muted/20">
              <p className="text-sm font-medium mb-4">New variant</p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Quantity + Unit */}
                    <div className="col-span-2 flex gap-2">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem className="w-28">
                            <FormLabel className="text-xs">Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNITS.map((u) => (
                                  <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Stock */}
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Stock</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SKU */}
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">
                            SKU <span className="text-muted-foreground">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. BPC157-5MG" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Variant
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowForm(false); form.reset(); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}