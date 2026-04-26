"use client";

import { useState } from "react";
import { Loader2, CreditCard, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelSubscription, createCheckoutSession } from "@/actions/profile";

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: any }> = {
  ACTIVE:    { label: "Active",    variant: "default",     icon: CheckCircle2 },
  INACTIVE:  { label: "Inactive",  variant: "secondary",   icon: XCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: XCircle },
  PAST_DUE:  { label: "Past Due",  variant: "destructive", icon: AlertCircle },
  TRIALING:  { label: "Trial",     variant: "outline",     icon: Zap },
};

export function BillingTab({ user, subscription }: { user: any; subscription: any }) {
  const [cancelling, setCancelling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const status = subscription?.status ?? "INACTIVE";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  const StatusIcon = cfg.icon;
  const isActive = status === "ACTIVE" || status === "TRIALING";

  const handleCancel = async () => {
    setCancelling(true);
    const res = await cancelSubscription(user.id);
    if (res.success) toast.success("Subscription cancelled — you'll retain access until the period ends");
    else toast.error(res.error ?? "Failed to cancel");
    setCancelling(false);
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    const res = await createCheckoutSession(user.id, user.email);
    if (res.success && res.url) window.location.href = res.url;
    else { toast.error(res.error ?? "Failed to start checkout"); setSubscribing(false); }
  };

  return (
    <div className="space-y-8">

      {/* Current plan card */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Current Plan
            </p>
            <h2 className="text-xl font-bold">{subscription?.plan ?? "Free"}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isActive
                ? `$${subscription?.amount ?? 39}/${subscription?.interval ?? "month"} — renews ${
                    subscription?.renewalDate
                      ? new Date(subscription.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "—"
                  }`
                : "No active subscription"}
            </p>
          </div>
          <Badge variant={cfg.variant} className="flex items-center gap-1.5 px-3 py-1">
            <StatusIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </Badge>
        </div>

        {/* Plan features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            "Unlimited products",
            "Team members",
            "Analytics dashboard",
            "Priority support",
            "Custom domain",
            "API access",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={cancelling}>
                  {cancelling
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Cancelling...</>
                    : "Cancel Subscription"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll keep access until{" "}
                    <strong>
                      {subscription?.renewalDate
                        ? new Date(subscription.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "the end of your billing period"}
                    </strong>
                    . After that, your account will revert to the free plan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleSubscribe} disabled={subscribing} className="gap-2">
              {subscribing
                ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</>
                : <><Zap className="h-4 w-4" />Subscribe — $39/month</>}
            </Button>
          )}
        </div>
      </div>

      {/* Payment method */}
      {subscription?.paymentMethodLast4 && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Payment Method</p>
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-md p-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">
                {subscription.paymentMethodBrand} •••• {subscription.paymentMethodLast4}
              </p>
              <p className="text-xs text-muted-foreground">
                Managed via Stripe
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing history note */}
      <p className="text-xs text-muted-foreground">
        Invoices and full billing history are available in your{" "}
        <a
          href="https://billing.stripe.com/p/login/test_placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Stripe billing portal
        </a>
        .
      </p>
    </div>
  );
}