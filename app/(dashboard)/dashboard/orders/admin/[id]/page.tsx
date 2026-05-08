import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/ordersEcomerce";
import { ArrowLeft, Clock, Package, CreditCard, MapPin, FileText, Truck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminOrderActions } from "@/components/orders/AdminOrderActions";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ShipmentPanel } from "@/components/orders/ShipmentPanel";
import Image from "next/image";

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  CONFIRMED:  "bg-blue-500/10 text-blue-600 border-blue-500/30",
  PROCESSING: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  SHIPPED:    "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  DELIVERED:  "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  CANCELLED:  "bg-red-500/10 text-red-600 border-red-500/30",
  REFUNDED:   "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // 1. Update the type to a Promise
}) {
  const resolvedParams = await params; // 2. Await the params
  const id = resolvedParams.id;

  const order = await getOrderById(id);
  
  if (!order) notFound();

  const isPendingApproval = order.paymentStatus === "PENDING_APPROVAL";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back + header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">
                Order #{order.orderNumber.slice(-8).toUpperCase()}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs ${ORDER_STATUS_STYLES[order.orderStatus]}`}
              >
                {order.orderStatus.charAt(0) + order.orderStatus.slice(1).toLowerCase()}
              </Badge>
              {isPendingApproval && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  ⏳ Awaiting Payment Approval
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order items */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">
                Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-13 w-13 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    {item.variantInfo && (
                      <p className="text-xs text-muted-foreground">{item.variantInfo}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {usd(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{usd(item.subTotal)}</p>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="px-6 py-4 bg-muted/30 border-t space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{usd(order.subtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{usd(order.shippingFee)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{usd(order.taxAmount)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{usd(order.discountAmount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{usd(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Order Timeline</h3>
            </div>
            <div className="px-6 py-4">
              <OrderTimeline history={order.statusHistory} />
            </div>
          </div>

          {/* Shipment tracking */}
          <ShipmentPanel
            orderId={order.id}
            shipments={order.shipments}
            orderStatus={order.orderStatus}
          />
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-6">

          {/* Admin actions */}
          <AdminOrderActions order={order} />

          {/* Buyer info */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Buyer</h3>
            </div>
            <div className="px-6 py-4 space-y-1">
              <p className="text-sm font-medium">{order.user.name}</p>
              <p className="text-xs text-muted-foreground">{order.user.email}</p>
              <Link
                href={`/dashboard/users/${order.user.id}`}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                View profile
              </Link>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Ship To</h3>
              </div>
              <div className="px-6 py-4 text-sm space-y-0.5 text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Payment</h3>
            </div>
            <div className="px-6 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{order.paymentMethod ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs">
                  {order.paymentStatus.replace(/_/g, " ")}
                </Badge>
              </div>
              {order.buyerPaidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer paid at</span>
                  <span>{new Date(order.buyerPaidAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.adminApprovedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved at</span>
                  <span>{new Date(order.adminApprovedAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.buyerPaymentProof && (
                <a
                  href={order.buyerPaymentProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs underline-offset-4 hover:underline block pt-1"
                >
                  View payment proof →
                </a>
              )}
            </div>
          </div>

          {/* Internal notes */}
          {order.notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-900">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
                  Internal Note
                </h3>
              </div>
              <p className="px-6 py-4 text-sm text-amber-700 dark:text-amber-300">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}