"use client";

import { useState } from "react";
import { cancelSubscription, resumeSubscription } from "@/actions/subscription";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, CreditCard, Calendar, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",    color: "text-green-400",  bg: "bg-green-500/10  border-green-500/20",  icon: CheckCircle2  },
  TRIALING:  { label: "Trial",     color: "text-blue-400",   bg: "bg-blue-500/10   border-blue-500/20",   icon: Clock         },
  CANCELLED: { label: "Cancelled", color: "text-red-400",    bg: "bg-red-500/10    border-red-500/20",    icon: XCircle       },
  PAST_DUE:  { label: "Past Due",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle },
  INACTIVE:  { label: "Inactive",  color: "text-gray-400",   bg: "bg-white/5       border-white/10",      icon: XCircle       },
};

const CARD_ICONS: Record<string, string> = {
  visa:       "💳 Visa",
  mastercard: "💳 Mastercard",
  amex:       "💳 Amex",
  discover:   "💳 Discover",
};

export function SubscriptionStatus({
  subscription,
  onResubscribe,
}: {
  subscription: any;
  onResubscribe: () => void;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [resuming,   setResuming]   = useState(false);

  const cfg = STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.INACTIVE;
  const StatusIcon = cfg.icon;

  const isActive    = subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  const isCancelled = subscription.status === "CANCELLED";
  const isPastDue   = subscription.status === "PAST_DUE";

  const handleCancel = async () => {
    setCancelling(true);
    const res = await cancelSubscription();
    if (res.success) {
      toast.success("Subscription cancelled — access continues until period ends");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
    setCancelling(false);
  };

  const handleResume = async () => {
    setResuming(true);
    const res = await resumeSubscription();
    if (res.success) {
      toast.success("Subscription resumed!");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to resume");
    }
    setResuming(false);
  };

  return (
    <div className="space-y-4">

      {/* Status card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-300">Current Status</p>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Payment method */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Payment Method
            </p>
            <p className="text-sm font-medium text-gray-200">
              {subscription.paymentMethodLast4
                ? `${CARD_ICONS[subscription.paymentMethodBrand] ?? "💳"} •••• ${subscription.paymentMethodLast4}`
                : "—"}
            </p>
          </div>

          {/* Next billing / cancelled date */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {isCancelled ? "Access Until" : "Next Billing"}
            </p>
            <p className="text-sm font-medium text-gray-200">
              {subscription.renewalDate
                ? new Date(subscription.renewalDate).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "—"}
            </p>
          </div>

          {/* Started */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Started</p>
            <p className="text-sm font-medium text-gray-200">
              {subscription.startDate
                ? new Date(subscription.startDate).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "—"}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-medium text-gray-200">
              ${subscription.amount} / {subscription.interval}
            </p>
          </div>
        </div>

        {/* Past due warning */}
        {isPastDue && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              Your last payment failed. Please update your payment method to avoid losing access.
            </p>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Your subscription is cancelled but you retain full access until{" "}
              <strong className="text-blue-200">
                {subscription.renewalDate
                  ? new Date(subscription.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })
                  : "your billing period ends"}
              </strong>
              .
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {isActive && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {cancelling ? <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling...</> : "Cancel Subscription"}
          </button>
        )}

        {isCancelled && (
          <button
            onClick={handleResume}
            disabled={resuming}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {resuming ? <><Loader2 className="h-4 w-4 animate-spin" /> Resuming...</> : "Resume Subscription"}
          </button>
        )}

        {(subscription.status === "INACTIVE" || isPastDue) && (
          <button
            onClick={onResubscribe}
            className="w-full px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Subscribe Now
          </button>
        )}
      </div>
    </div>
  );
}