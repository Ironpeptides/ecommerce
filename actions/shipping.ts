"use server";

import { db } from "@/prisma/db";

export async function getShippingAddresses(userId: string) {
    try {
        return await db.shippingAddress.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }
}

export async function createShippingAddress(addressData: any) {
    try {
        const address = await db.shippingAddress.create({
            data: addressData
        });
        return address;
    } catch (error) {
        console.error("Error creating address:", error);
        throw error;
    }
}