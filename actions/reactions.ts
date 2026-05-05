"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export type ReactionCount = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

const ALLOWED_EMOJIS = ["❤️", "🔥", "👏", "🤔", "😮", "💡"];

export async function getReactions(
  blogId: string,
  sessionId?: string
): Promise<ReactionCount[]> {
  try {
    const grouped = await db.blogReaction.groupBy({
      by: ["emoji"],
      where: { blogId },
      _count: { emoji: true },
    });

    // Which ones did this session already react with?
    const userReactions = sessionId
      ? await db.blogReaction.findMany({
          where: { blogId, sessionId },
          select: { emoji: true },
        })
      : [];
    const userSet = new Set(userReactions.map((r) => r.emoji));

    // Return all allowed emojis, even with 0 count, so UI is stable
    return ALLOWED_EMOJIS.map((emoji) => {
      const found = grouped.find((g) => g.emoji === emoji);
      return {
        emoji,
        count: found?._count.emoji ?? 0,
        userReacted: userSet.has(emoji),
      };
    });
  } catch (error) {
    console.error("getReactions error:", error);
    return ALLOWED_EMOJIS.map((emoji) => ({ emoji, count: 0, userReacted: false }));
  }
}

export async function toggleReaction(
  blogId: string,
  emoji: string,
  sessionId: string
): Promise<ReactionCount[]> {
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    throw new Error("Invalid emoji");
  }

  try {
    const existing = await db.blogReaction.findFirst({
      where: { blogId, emoji, sessionId },
    });

    if (existing) {
      await db.blogReaction.delete({ where: { id: existing.id } });
    } else {
      await db.blogReaction.create({
        data: { blogId, emoji, sessionId },
      });
    }

    revalidatePath(`/blogs/${blogId}`);
    return getReactions(blogId, sessionId);
  } catch (error) {
    console.error("toggleReaction error:", error);
    throw error;
  }
}