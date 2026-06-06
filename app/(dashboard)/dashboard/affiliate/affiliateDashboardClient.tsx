"use client";

// app/(dashboard)/dashboard/affiliate/affiliateDashboardClient.tsx

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type CommissionStatus = "PENDING" | "APPROVED" | "PAID";
type OrderStatus = string;
type PaymentStatus = string;

interface Stats {
  totalEarned: number;
  pendingEarnings: number;
  totalOrders: number;
  totalCoupons: number;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  commissionRate: number | null;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null;
  expiresAt: Date | null;
  _count: { orders: number };
}

interface Commission {
  id: string;
  amount: number;
  status: CommissionStatus;
  createdAt: Date;
  couponId: string;
  coupon: { code: string };
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  subtotal: number;
  couponCode: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  commissions: { amount: number; status: CommissionStatus }[];
}

interface Props {
  stats: Stats;
  coupons: Coupon[];
  commissions: Commission[];
  orders: Order[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function fmtDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function commissionBadgeVariant(status: CommissionStatus) {
  if (status === "PAID") return "default";
  if (status === "APPROVED") return "secondary";
  return "outline";
}

function orderStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AffiliateDashboardClient({
  stats,
  coupons,
  commissions,
  orders,
}: Props) {
  const [tab, setTab] = useState<"commissions" | "orders" | "coupons">(
    "commissions"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCommissions =
    statusFilter === "ALL"
      ? commissions
      : commissions.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Affiliate Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your referrals, coupon performance, and commissions earned.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Earned"
          value={fmt(stats.totalEarned)}
          sub="Paid commissions"
        />
        <StatCard
          label="Pending Earnings"
          value={fmt(stats.pendingEarnings)}
          sub="Pending or approved"
        />
        <StatCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          sub="Via your coupons"
        />
        <StatCard
          label="Active Coupons"
          value={String(stats.totalCoupons)}
        />
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 border-b">
        {(["commissions", "orders", "coupons"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Commissions Tab ── */}
      {tab === "commissions" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Commission History</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCommissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No commissions found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Order Total</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">
                        #{c.order.orderNumber.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {c.coupon.code}
                        </Badge>
                      </TableCell>
                      <TableCell>{fmt(c.order.totalAmount)}</TableCell>
                      <TableCell className="font-medium text-green-700">
                        {fmt(c.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={commissionBadgeVariant(c.status)}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fmtDate(c.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Orders Tab ── */}
      {tab === "orders" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referred Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No orders have been made using your coupons yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    const myCommission = o.commissions[0];
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">
                          #{o.orderNumber.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {o.couponCode && (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {o.couponCode}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{fmt(o.subtotal)}</TableCell>
                        <TableCell className="text-red-600">
                          -{fmt(o.discountAmount)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fmt(o.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {myCommission ? (
                            <span className="text-green-700 font-medium">
                              {fmt(myCommission.amount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColor(o.orderStatus)}`}
                          >
                            {o.orderStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {fmtDate(o.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Coupons Tab ── */}
      {tab === "coupons" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full text-center py-10">
              No coupons assigned to your account.
            </p>
          ) : (
            coupons.map((coupon) => (
              <Card key={coupon.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold tracking-wide">
                      {coupon.code}
                    </span>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {coupon.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {coupon.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : fmt(coupon.discountValue)}
                    </span>
                  </div>
                  {coupon.commissionRate != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Your commission
                      </span>
                      <span className="font-medium text-green-700">
                        {(coupon.commissionRate * 100).toFixed(0)}% per sale
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uses</span>
                    <span>
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </span>
                  </div>
                  {coupon.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires</span>
                      <span>{fmtDate(coupon.expiresAt)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between">
                    <span className="text-muted-foreground">
                      Total orders via this coupon
                    </span>
                    <span className="font-medium">{coupon._count.orders}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}