"use server";

import { db } from "@/prisma/db";

export async function createOrder(orderData: any) {
    try {
        // Guard: check if an order already exists for this payment session
        if (orderData.paymentSessionId) {
            const existing = await db.order.findUnique({
            where: { paymentSessionId: orderData.paymentSessionId },
                include: { items: true }
            });

            if (existing) {
                // Return the existing order instead of crashing
                return existing;
            }
        }

        const order = await db.order.create({
            data: {
                userId: orderData.userId,
                orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                subtotal: orderData.subtotal,
                discountAmount: orderData.discountAmount,
                totalAmount: orderData.totalAmount,
                couponCode: orderData.couponCode,
                shippingAddressId: orderData.shippingAddressId,
                paymentMethod: orderData.paymentMethod,
                orderStatus: orderData.orderStatus,
                paymentStatus: orderData.paymentStatus,
                paymentSessionId: orderData.paymentSessionId,
                termsAccepted: orderData.termsAccepted,
                items: {
                    create: orderData.items
                }
            },
            include: {
                items: true
            }
        });
        return order;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}