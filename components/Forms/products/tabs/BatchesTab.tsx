"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Trash2, Loader2, FlaskConical,
  ExternalLink, CalendarDays, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { addProductBatch, deleteProductBatch } from "@/actions/products";

const schema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  purity: z.coerce.number().min(0).max(100).optional(),
  quantity: z.coerce.number().positive().optional(),
  coaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  manufacturedAt: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Batch = {
  id: string;
  batchNumber: string;
  purity?: number | null;
  coaUrl?: string | null;
  quantity?: number | null;
  manufacturedAt?: Date | null;
  expiryDate?: Date | null;
  createdAt?: Date;
};

type Props = {
  product: { id: string; name: string; batches: Batch[] };
};

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function isExpired(date: Date | null | undefined) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function BatchesTab({ product }: Props) {
  const [batches, setBatches] = useState<Batch[]>(product.batches ?? []);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { batchNumber: "", coaUrl: "" },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const batch = await addProductBatch(product.id, {
          ...values,
          manufacturedAt: values.manufacturedAt
            ? new Date(values.manufacturedAt)
            : undefined,
          expiryDate: values.expiryDate
            ? new Date(values.expiryDate)
            : undefined,
          coaUrl: values.coaUrl || undefined,
        });
        setBatches((prev) => [batch, ...prev]);
        form.reset({ batchNumber: "", coaUrl: "" });
        setShowForm(false);
        toast.success("Batch added");
      } catch {
        toast.error("Failed to add batch");
      }
    });
  }

  async function handleDelete(batchId: string) {
    setDeletingId(batchId);
    try {
      await deleteProductBatch(batchId);
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      toast.success("Batch removed");
    } catch {
      toast.error("Failed to remove batch");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <FlaskConical className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold">Production Batches</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track purity, expiry, and certificates per batch.
              </p>
            </div>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Batch
            </Button>
          )}
        </div>

        {/* Batch list */}
        <div className="divide-y">
          {batches.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No batches recorded</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Add production batches to track purity levels, expiry dates, and certificates of analysis.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 gap-1.5"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add first batch
              </Button>
            </div>
          )}

          {batches.map((batch) => {
            const expired = isExpired(batch.expiryDate);
            return (
              <div
                key={batch.id}
                className="px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold">
                        {batch.batchNumber}
                      </span>
                      {batch.purity != null && (
                        <Badge
                          variant={batch.purity >= 98 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {batch.purity.toFixed(1)}% purity
                        </Badge>
                      )}
                      {expired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      {batch.quantity != null && (
                        <span>{batch.quantity} units</span>
                      )}
                      {batch.manufacturedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Mfg: {formatDate(batch.manufacturedAt)}
                        </span>
                      )}
                      {batch.expiryDate && (
                        <span className={cn(
                          "flex items-center gap-1",
                          expired && "text-red-500 font-medium"
                        )}>
                          <CalendarDays className="h-3 w-3" />
                          Exp: {formatDate(batch.expiryDate)}
                        </span>
                      )}
                      {batch.coaUrl && (
  <a
    href={batch.coaUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 text-primary hover:underline underline-offset-4"
  >
    <ExternalLink className="h-3 w-3" />
    View CoA
  </a>
)}
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        disabled={deletingId === batch.id}
                      >
                        {deletingId === batch.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove batch?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove batch{" "}
                          <strong>{batch.batchNumber}</strong>. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(batch.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}

          {/* Inline add form */}
          {showForm && (
            <div className="px-6 py-5 bg-muted/20">
              <p className="text-sm font-medium mb-4">New batch</p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">Batch Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. BPC157-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Purity (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="100" placeholder="99.2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Quantity (units)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manufacturedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Manufactured</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coaUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">
                            CoA URL <span className="text-muted-foreground">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Batch
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