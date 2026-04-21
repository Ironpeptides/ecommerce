"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Plus, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { addShipmentTracking } from "@/actions/ordersEcomerce";
import toast from "react-hot-toast";

const schema = z.object({
  carrier: z.string().min(1, "Carrier is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  estimatedDelivery: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Shipment = {
  id: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: Date | null;
  estimatedDelivery?: Date | null;
  deliveredAt?: Date | null;
};

type Props = {
  orderId: string;
  shipments: Shipment[];
  orderStatus: string;
};

export function ShipmentPanel({ orderId, shipments, orderStatus }: Props) {
  const [list, setList] = useState(shipments);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const canAddShipment = !["DELIVERED", "CANCELLED", "REFUNDED"].includes(orderStatus);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const res = await addShipmentTracking(orderId, {
        carrier: values.carrier,
        trackingNumber: values.trackingNumber,
        estimatedDelivery: values.estimatedDelivery
          ? new Date(values.estimatedDelivery)
          : undefined,
      });
      if (res.success) {
        toast.success("Shipment tracking added — order marked as shipped");
        setShowForm(false);
        form.reset();
      } else {
        toast.error(res.error ?? "Failed to add tracking");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Shipment Tracking</h3>
        </div>
        {canAddShipment && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="gap-1.5 h-7 text-xs">
            <Plus className="h-3 w-3" />
            Add Tracking
          </Button>
        )}
      </div>

      <div className="divide-y">
        {list.length === 0 && !showForm && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No shipments recorded yet.</p>
            {canAddShipment && (
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add tracking info
              </Button>
            )}
          </div>
        )}

        {list.map((shipment) => (
          <div key={shipment.id} className="px-6 py-4 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{shipment.carrier}</Badge>
              <span className="font-mono text-sm">{shipment.trackingNumber}</span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {shipment.shippedAt && (
                <span>Shipped: {new Date(shipment.shippedAt).toLocaleDateString()}</span>
              )}
              {shipment.estimatedDelivery && (
                <span>Est. delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
              )}
              {shipment.deliveredAt && (
                <span className="text-emerald-600 font-medium">
                  Delivered: {new Date(shipment.deliveredAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}

        {showForm && (
          <div className="px-6 py-5 bg-muted/20">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Carrier</FormLabel>
                        <FormControl>
                          <Input placeholder="DHL, FedEx..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trackingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tracking #</FormLabel>
                        <FormControl>
                          <Input placeholder="1Z999AA1..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedDelivery"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Est. Delivery <span className="text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); form.reset(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}