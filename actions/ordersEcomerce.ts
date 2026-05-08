"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/config/useAuth";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { deductStock } from "@/lib/stock"; 
// ─── shared include ──────────────────────────────────────────────────────────

const orderInclude = {
  user: { select: { id: true, name: true, email: true } },
  items: true,
  shippingAddress: true,
  statusHistory: { orderBy: { createdAt: "desc" as const } },
  payments: true,
  shipments: true,
  coupon: true,
} as const;

// ============================================================
// FETCH
// ============================================================

export async function getOrdersByStatus(filter: "all" | "pending" | "shipped" | "completed" | "refunds") {
  const whereMap = {
    all:       {},
    pending:   { orderStatus: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } },
    shipped:   { orderStatus: OrderStatus.SHIPPED },
    completed: { orderStatus: OrderStatus.DELIVERED },
    refunds:   { orderStatus: { in: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } },
  };

  try {
    return await db.order.findMany({
      where: whereMap[filter],
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(`Error fetching ${filter} orders:`, error);
    return [];
  }
}

export async function getOrdersAwaitingApproval() {
  try {
    return await db.order.findMany({
      where: { paymentStatus: PaymentStatus.PENDING_APPROVAL },
      include: orderInclude,
      orderBy: { buyerPaidAt: "asc" }, // oldest first — most urgent
    });
  } catch (error) {
    console.error("Error fetching orders awaiting approval:", error);
    return [];
  }
}

export async function getOrderById(id: string) {
  try {
    return await db.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}


/**
 * Fetch orders belonging to a specific buyer, optionally filtered by status.
 * Used exclusively by the buyer-facing dashboard — never returns other users' orders.
 */
export async function getOrdersByBuyer(
  buyerId: string,
  filter: "all" | "pending" | "shipped" | "completed" | "refunds"
) {
  const statusMap = {
    all:       {},
    pending:   { orderStatus: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } },
    shipped:   { orderStatus: OrderStatus.SHIPPED },
    completed: { orderStatus: OrderStatus.DELIVERED },
    refunds:   { orderStatus: { in: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } },
  };

  try {
    return await db.order.findMany({
      where: {
        userId: buyerId,                  // ← scope to this buyer only
        ...statusMap[filter],
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(`Error fetching buyer orders (${filter}):`, error);
    return [];
  }
}

// Buyer-scoped — only returns orders belonging to the authenticated user
export async function getMyOrders() {
  try {
    const user = await getAuthenticatedUser();
    return await db.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
        shipments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return [];
  }
}

export async function getMyOrderById(id: string) {
  try {
    const user = await getAuthenticatedUser();
    const order = await db.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    // Guard: buyer can only see their own orders
    if (!order || order.userId !== user.id) return null;
    return order;
  } catch (error) {
    console.error("Error fetching buyer order:", error);
    return null;
  }
}

// ============================================================
// STATUS UPDATES
// ============================================================

// ── Admin: set any order status directly ────────────────────
export async function adminUpdateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  note?: string
) {
  try {
    const admin = await getAuthenticatedUser();
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        orderStatus,
        statusHistory: {
          create: {
            status: orderStatus,
            note: note ?? null,
            changedBy: admin.id,
          },
        },
      },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

// ── Admin: approve a crypto payment ─────────────────────────
export async function adminApprovePayment(orderId: string, note?: string) {
  try {
    const admin = await getAuthenticatedUser();

   

    // 1. Wrap your logic in a transaction
    const result = await db.$transaction(async (tx) => {
      
      // 2. Use 'tx' instead of 'db' for the order update
      // We also include 'items' so deductStock has the data it needs
      const order = await tx.order.update({
        where: { id: orderId },
        include: { items: true }, // Crucial: ensure items are fetched to pass to deductStock
        data: {
          paymentStatus: PaymentStatus.PAID,
          adminApprovedAt: new Date(),
          adminApprovedBy: admin.id,
          orderStatus: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              status: OrderStatus.CONFIRMED,
              note: note ?? "Payment approved by admin.",
              changedBy: admin.id,
            },
          },
        },
      });

      // 3. Now 'tx' is defined and safe to pass
      await deductStock(tx, order.items, "[admin/approve]");

      return order;
    });

    // 4. Revalidate outside the transaction for better performance
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");

    return { success: true, order: result };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { success: false, error: "Failed to approve payment" };
  }
}

// ── Admin: reject a crypto payment claim ────────────────────
export async function adminRejectPayment(orderId: string, note?: string) {
  try {
    const admin = await getAuthenticatedUser();
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.UNPAID,
        buyerPaidAt: null,
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            note: note ?? "Payment claim rejected by admin.",
            changedBy: admin.id,
          },
        },
      },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true, order };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { success: false, error: "Failed to reject payment" };
  }
}

// ── Buyer: mark crypto payment as sent ──────────────────────
export async function buyerMarkAsPaid(
  orderId: string,
  proofUrl?: string,
  txId?: string
) {
  try {
    const user = await getAuthenticatedUser();

    // Verify order belongs to this buyer
    const existing = await db.order.findUnique({ where: { id: orderId } });
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: "Order not found" };
    }
    if (existing.paymentStatus === PaymentStatus.PAID) {
      return { success: false, error: "Order is already marked as paid" };
    }

    const order = await db.order.update({
  where: { id: orderId },
  data: {
    paymentStatus: PaymentStatus.PENDING_APPROVAL,
    buyerPaidAt: new Date(),
    buyerPaymentProof: proofUrl ?? null,
    payments: {
      
      create: [{
        method: existing.paymentMethod ?? "manual",
        currency: 'usd',
        amount: existing.totalAmount,
        status: PaymentStatus.PENDING_APPROVAL,
        transactionId: txId ?? null,
        proofUrl: proofUrl ?? null,
      }],
    },
  },
});
    revalidatePath(`/orders/${orderId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error marking order as paid:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

// ── Stripe webhook: auto-confirm payment ────────────────────
export async function stripeConfirmPayment(
  paymentIntentId: string,
  transactionId?: string
) {
  try {
    const order = await db.order.findFirst({
      where: { paymentIntentId },
    });
    if (!order) return { success: false, error: "Order not found" };

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.CONFIRMED,
        adminApprovedAt: new Date(),
        statusHistory: {
          create: {
            status: OrderStatus.CONFIRMED,
            note: "Payment confirmed automatically via Stripe.",
          },
        },
        payments: {
          create:[
            {
            method: "stripe",
            currency: 'usd',
            amount: order.totalAmount,
            status: PaymentStatus.PAID,
            transactionId: transactionId ?? paymentIntentId,
          },
          ] 
        },
      },
    });
    revalidatePath(`/dashboard/orders/${order.id}`);
    return { success: true };
  } catch (error) {
    console.error("Stripe payment confirmation error:", error);
    return { success: false, error: "Failed to confirm Stripe payment" };
  }
}

// ── Admin: add internal note ─────────────────────────────────
export async function addOrderNote(orderId: string, note: string) {
  try {
    const admin = await getAuthenticatedUser();
    const order = await db.order.update({
      where: { id: orderId },
      data: { notes: note },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error adding order note:", error);
    return { success: false, error: "Failed to save note" };
  }
}

// ── Admin: add shipment tracking ─────────────────────────────
export async function addShipmentTracking(
  orderId: string,
  data: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: Date;
  }
) {
  try {
    const admin = await getAuthenticatedUser();
    await db.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.SHIPPED,
        shipments: { create: [{ ...data, shippedAt: new Date(), status: OrderStatus.SHIPPED }] },
        statusHistory: {
          create: {
            status: OrderStatus.SHIPPED,
            note: `Shipped via ${data.carrier} — tracking: ${data.trackingNumber}`,
            changedBy: admin.id,
          },
        },
      },
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error) {
    console.error("Error adding shipment:", error);
    return { success: false, error: "Failed to add shipment" };
  }
}