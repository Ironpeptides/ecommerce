"use server";

import { db } from "@/prisma/db";

export async function validateCoupon(code: string, subtotal: number) {
    try {
        const coupon = await db.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });
        
        if (!coupon) {
            return { isValid: false, message: "Coupon not found" };
        }
        
        if (!coupon.isActive) {
            return { isValid: false, message: "Coupon is inactive" };
        }
        
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { isValid: false, message: "Coupon has expired" };
        }
        
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { isValid: false, message: "Coupon usage limit reached" };
        }
        
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return { 
                isValid: false, 
                message: `Minimum order amount of $${coupon.minOrderAmount} required` 
            };
        }
        
        return { isValid: true, coupon };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { isValid: false, message: "Error validating coupon" };
    }
}

export async function getCoupon(code: string) {
    try {
        return await db.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return null;
    }
}