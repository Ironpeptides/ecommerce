"use server";

import { db } from "@/prisma/db";

export async function updateCompliance(userId: string, complianceData: any) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        agreedAge18Plus: complianceData.agreedAge18Plus,
        agreedNotForHumanConsumption: complianceData.agreedNotForHumanConsumption,
        lastComplianceUpdate: new Date()
      }
    });
    return user;
  } catch (error) {
    console.error("Error updating compliance:", error);
    throw error;
  }
}
