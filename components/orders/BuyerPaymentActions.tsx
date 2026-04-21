"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { UploadDropzone } from "@/lib/uploadthing";
import { buyerMarkAsPaid } from "@/actions/ordersEcomerce";
import toast from "react-hot-toast";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const schema = z.object({
  txId: z.string().optional(),
});

type Props = { orderId: string; totalAmount: number };

export function BuyerPaymentActions({ orderId, totalAmount }: Props) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const res = await buyerMarkAsPaid(
        orderId,
        proofUrl ?? undefined,
        values.txId
      );
      if (res.success) {
        setSubmitted(true);
        toast.success("Payment submitted for review!");
      } else {
        toast.error(res.error ?? "Failed to submit");
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-6 flex flex-col items-center text-center gap-3">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-400">
            Payment submitted!
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Our team will review and confirm your payment shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-primary/20 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Confirm Your Payment</h3>
      </div>
      <div className="px-5 py-5 space-y-5">
        <p className="text-sm text-muted-foreground">
          Once you have sent{" "}
          <span className="font-semibold text-foreground">{usd(totalAmount)}</span>{" "}
          in cryptocurrency, let us know below. Optionally upload a screenshot or
          paste your transaction ID for faster verification.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tx ID */}
            <FormField
              control={form.control}
              name="txId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Transaction ID <span className="text-muted-foreground">(optional but recommended)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x1a2b3c4d..."
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proof upload */}
            <div>
              <p className="text-xs font-medium mb-2">
                Payment screenshot <span className="text-muted-foreground">(optional)</span>
              </p>
              {proofUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-700 flex-1 truncate">
                    Screenshot uploaded
                  </span>
                  <button
                    type="button"
                    onClick={() => setProofUrl(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="paymentProofUploader"
                  onClientUploadComplete={(res) => setProofUrl(res[0].url)}
                  onUploadError={(err) => {
                    toast.error(`Upload failed: ${err.message}`);
                  }}
                  className="border-dashed border-2 border-border rounded-lg ut-label:text-xs ut-button:bg-primary ut-button:text-primary-foreground ut-button:rounded-md ut-button:text-xs"
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isPending}
            >
              {isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              I've Sent the Payment
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}