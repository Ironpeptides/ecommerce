"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { TOPIC_KEYS } from "@/lib/peptide-topics";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CustomTopicProps = {
  peptideId: string;
  topicKey: string;
  label: string;
  content: string;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

function assertValidTopicKey(topicKey: string) {
  if (!SLUG_PATTERN.test(topicKey)) {
    throw new Error(
      `Invalid topic key "${topicKey}" — lowercase letters, numbers, and hyphens only (e.g. "purity-testing").`
    );
  }
  if ((TOPIC_KEYS as string[]).includes(topicKey)) {
    throw new Error(
      `"${topicKey}" is a reserved built-in topic name. Choose a different key.`
    );
  }
}

export async function createCustomTopic(data: CustomTopicProps) {
  try {
    assertValidTopicKey(data.topicKey);

    const peptide = await db.peptideInfo.findUnique({
      where: { id: data.peptideId },
      select: { slug: true },
    });
    if (!peptide) return { error: "Peptide not found" };

    const existing = await db.peptideTopicContent.findUnique({
      where: {
        peptideId_topicKey: { peptideId: data.peptideId, topicKey: data.topicKey },
      },
    });
    if (existing) {
      return { error: "A topic with this key already exists for this peptide" };
    }

    const topic = await db.peptideTopicContent.create({
      data: { ...data, keywords: data.keywords ?? [] },
    });

    revalidatePath("/dashboard/peptides");
    revalidatePath(`/peptides/${peptide.slug}`);
    revalidatePath(`/peptides/${peptide.slug}/${data.topicKey}`);

    return { success: true, data: topic };
  } catch (error) {
    console.error("createCustomTopic error:", error);
    return { error: error instanceof Error ? error.message : "Failed to create topic" };
  }
}

export async function updateCustomTopic(id: string, data: Partial<CustomTopicProps>) {
  try {
    if (data.topicKey) assertValidTopicKey(data.topicKey);

    const existing = await db.peptideTopicContent.findUnique({
      where: { id },
      include: { peptide: { select: { slug: true } } },
    });
    if (!existing) return { error: "Topic not found" };

    const updated = await db.peptideTopicContent.update({
      where: { id },
      data: { ...data, keywords: data.keywords ?? undefined },
    });

    revalidatePath("/dashboard/peptides");
    revalidatePath(`/peptides/${existing.peptide.slug}`);
    revalidatePath(`/peptides/${existing.peptide.slug}/${existing.topicKey}`);
    // if the key itself changed, the old URL needs revalidating too
    // so it doesn't keep serving a stale statically-generated page
    if (data.topicKey && data.topicKey !== existing.topicKey) {
      revalidatePath(`/peptides/${existing.peptide.slug}/${data.topicKey}`);
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("updateCustomTopic error:", error);
    return { error: error instanceof Error ? error.message : "Failed to update topic" };
  }
}

export async function deleteCustomTopic(id: string) {
  try {
    const existing = await db.peptideTopicContent.findUnique({
      where: { id },
      include: { peptide: { select: { slug: true } } },
    });
    if (!existing) return { error: "Topic not found" };

    await db.peptideTopicContent.delete({ where: { id } });

    revalidatePath("/dashboard/peptides");
    revalidatePath(`/peptides/${existing.peptide.slug}`);
    revalidatePath(`/peptides/${existing.peptide.slug}/${existing.topicKey}`);

    return { success: true };
  } catch (error) {
    console.error("deleteCustomTopic error:", error);
    return { error: "Failed to delete topic" };
  }
}

export async function getCustomTopicsForPeptide(peptideId: string) {
  try {
    return await db.peptideTopicContent.findMany({
      where: { peptideId },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("getCustomTopicsForPeptide error:", error);
    return [];
  }
}