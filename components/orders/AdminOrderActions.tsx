"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, XCircle, Loader2, ChevronRight,
  StickyNote, Save,
} from "lucide-react";
import {
  adminUpdateOrderStatus, adminApprovePayment,
  adminRejectPayment, addOrderNote,
} from "@/actions/ordersEcomerce";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
] as const;

type Props = {
  order: {
    id: string;
    orderStatus: string;
    paymentStatus: string;
    notes?: string | null;
    buyerPaymentProof?: string | null;
  };
};

export function AdminOrderActions({ order }: Props) {
  const [note, setNote] = useState(order.notes ?? "");
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [isPending, startTransition] = useTransition();
  const [savingNote, setSavingNote] = useState(false);

  const isPendingApproval = ["PENDING_APPROVAL", "UNPAID", "PARTIALLY_PAID"].includes(order.paymentStatus);


  

  function handleStatusChange() {
    if (selectedStatus === order.orderStatus) return;
    startTransition(async () => {
      const res = await adminUpdateOrderStatus(
        order.id,
        selectedStatus as OrderStatus,
        `Status changed to ${selectedStatus} by admin.`
      );
      if (res.success) {
        toast.success("Order status updated");
      } else {
        toast.error(res.error ?? "Failed to update status");
      }
    });
  }

  function handleApprove() {
    startTransition(async () => {
      const res = await adminApprovePayment(order.id, "Payment approved by admin.");
      if (res.success) {
        toast.success("Payment approved — order confirmed");
      } else {
        toast.error(res.error ?? "Failed to approve");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await adminRejectPayment(
        order.id,
        "Payment claim rejected by admin. Please resubmit."
      );
      if (res.success) {
        toast.success("Payment rejected — buyer notified");
      } else {
        toast.error(res.error ?? "Failed to reject");
      }
    });
  }

  async function handleSaveNote() {
    setSavingNote(true);
    const res = await addOrderNote(order.id, note);
    setSavingNote(false);
    if (res.success) {
      toast.success("Note saved");
    } else {
      toast.error("Failed to save note");
    }
  }

  return (
    <div className="space-y-4">
      {/* Crypto approval banner */}
      {isPendingApproval && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-200 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              ⏳ Payment Awaiting Approval
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
              The buyer has marked this order as paid. Review and confirm.
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {order.buyerPaymentProof && (
              <a
                href={order.buyerPaymentProof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline-offset-4 hover:underline block"
              >
                View payment proof →
              </a>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApprove}
                disabled={isPending}
              >
                {isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <CheckCircle2 className="h-3.5 w-3.5" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleReject}
                disabled={isPending}
              >
                {isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <XCircle className="h-3.5 w-3.5" />}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status changer */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-sm">Update Order Status</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="w-full gap-1.5"
            onClick={handleStatusChange}
            disabled={isPending || selectedStatus === order.orderStatus}
          >
            {isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <ChevronRight className="h-3.5 w-3.5" />}
            Apply Status
          </Button>
        </div>
      </div>

      {/* Internal note */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Internal Note</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note about this order..."
            rows={3}
            className="text-sm resize-none"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            onClick={handleSaveNote}
            disabled={savingNote}
          >
            {savingNote
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
}