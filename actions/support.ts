"use server";

import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";
import { revalidatePath } from "next/cache";

export async function submitSupportTicket(data: {
  type: "BUG" | "FEATURE_REQUEST" | "IMPROVEMENT" | "THANKS" | "OTHER";
  title: string;
  content: string;
}) {
  const user = await getAuthenticatedUser();

  const ticket = await db.feedback.create({
    data: {
      type:    data.type,
      title:   data.title,
      content: data.content,
      userId:  user.id,
      status:  "PENDING",
    },
  });

  revalidatePath("/support");
  return { success: true, ticketId: ticket.id };
}

export async function getUserTickets() {
  const user = await getAuthenticatedUser();

  return db.feedback.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}