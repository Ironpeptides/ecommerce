"use server";

import { db } from "@/prisma/db";

export async function createOrder(orderData: any) {
    try {
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