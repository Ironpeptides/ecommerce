import { notFound } from "next/navigation";
import { getMyOrderById } from "@/actions/ordersEcomerce";
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BuyerPaymentActions } from "@/components/orders/BuyerPaymentActions";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import Image from "next/image";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Order Placed",  color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  CONFIRMED:  { label: "Confirmed",     color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  PROCESSING: { label: "Processing",    color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  SHIPPED:    { label: "On the way",    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" },
  DELIVERED:  { label: "Delivered ✓",  color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  CANCELLED:  { label: "Cancelled",     color: "bg-red-500/10 text-red-600 border-red-500/30" },
  REFUNDED:   { label: "Refunded",      color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
};

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const order = await getMyOrderById(resolvedParams.id);
  if (!order) notFound();

  const statusMeta = ORDER_STATUS_LABELS[order.orderStatus] ?? {
    label: order.orderStatus, color: "",
  };

  const isCryptoOrder = order.paymentMethod === "crypto" || order.paymentMethod === "cryptomus";
  const canMarkAsPaid =
    isCryptoOrder &&
    order.paymentStatus === "UNPAID" &&
    !["CANCELLED", "REFUNDED"].includes(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              Order #{order.orderNumber.slice(-8).toUpperCase()}
            </h1>
            <Badge variant="outline" className={`text-xs ${statusMeta.color}`}>
              {statusMeta.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Crypto payment CTA */}
      {canMarkAsPaid && (
        <BuyerPaymentActions orderId={order.id} totalAmount={order.totalAmount} />
      )}

      {/* Pending approval notice */}
      {order.paymentStatus === "PENDING_APPROVAL" && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-5">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            ⏳ Payment Under Review
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
            We've received your payment notification and are reviewing it. You'll
            receive a confirmation once approved — usually within a few hours.
          </p>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Your Items</h3>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover border"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                {item.variantInfo && (
                  <p className="text-xs text-muted-foreground">{item.variantInfo}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × {usd(item.price)}
                </p>
              </div>
              <p className="text-sm font-semibold">{usd(item.subTotal)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-muted/30 border-t space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{usd(order.subtotal)}</span>
          </div>
          {order.shippingFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{usd(order.shippingFee)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{usd(order.discountAmount)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{usd(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      {order.shippingAddress && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Delivery Address</h3>
          </div>
          <div className="px-5 py-4 text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Shipment tracking */}
      {order.shipments?.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Tracking</h3>
          </div>
          {order.shipments.map((s) => (
            <div key={s.id} className="px-5 py-4 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{s.carrier}</Badge>
                <span className="font-mono text-sm">{s.trackingNumber}</span>
              </div>
              {s.estimatedDelivery && (
                <p className="text-xs text-muted-foreground">
                  Est. delivery: {new Date(s.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order timeline */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold">Order Progress</h3>
        </div>
        <div className="px-5 py-4">
          <OrderTimeline history={order.statusHistory} />
        </div>
      </div>
    </div>
  );
}