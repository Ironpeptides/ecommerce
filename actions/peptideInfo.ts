"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { TOPIC_KEYS } from "@/lib/peptide-topics";

export type PeptideInfoProps = {
  slug: string;
  name: string;
  overview: string;
  mechanismOfAction?: string;
  benefits?: string; // NEW
  researchHighlights?: string;
  dosageGuidance?: string;
  sideEffects?: string; // NEW
  safetyHandling?: string;
  reconstitution?: string; // NEW
  comparisons?: string;
  faq?: { question: string; answer: string }[];
  productSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[]; // NEW
  seoOverrides?: Record<
    string,
    { title?: string; description?: string; keywords?: string[] }
  >; // NEW
};

/**
 * Revalidates the parent peptide page + every topic subpage for a slug.
 * Call this any time content changes, including on the OLD slug if a
 * slug was just renamed (otherwise the old URL serves stale cached
 * content indefinitely since it's statically generated).
 */
function revalidatePeptidePages(slug: string) {
  revalidatePath(`/peptides/${slug}`);
  for (const topic of TOPIC_KEYS) {
    revalidatePath(`/peptides/${slug}/${topic}`);
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertValidSlug(slug: string) {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}" — use lowercase letters, numbers, and hyphens only (e.g. "ghk-cu").`
    );
  }
}

// Create a new peptide info page
export async function createPeptideInfo(data: PeptideInfoProps) {
  try {
    assertValidSlug(data.slug);

    const existing = await db.peptideInfo.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return { error: "Slug already exists" };
    }

    const peptide = await db.peptideInfo.create({
      data: {
        ...data,
        faq: data.faq ?? undefined,
        keywords: data.keywords ?? [],
        seoOverrides: data.seoOverrides ?? undefined,
      },
    });

    revalidatePath("/dashboard/peptides");
    revalidatePeptidePages(peptide.slug);
    return { success: true, data: peptide };
  } catch (error) {
    console.error("createPeptideInfo error:", error);
    return { error: error instanceof Error ? error.message : "Failed to create peptide info" };
  }
}

// Update existing peptide info by id
export async function updatePeptideInfo(id: string, data: Partial<PeptideInfoProps>) {
  try {
    if (data.slug) assertValidSlug(data.slug);

    // Need the OLD slug so we can revalidate it too, in case the
    // slug is being changed — otherwise the old URL keeps serving
    // stale statically-generated content forever.
    const existing = await db.peptideInfo.findUnique({
      where: { id },
      select: { slug: true },
    });

    const updated = await db.peptideInfo.update({
      where: { id },
      data: {
        ...data,
        faq: data.faq ?? undefined,
        keywords: data.keywords ?? undefined,
        seoOverrides: data.seoOverrides ?? undefined,
      },
    });

    revalidatePath("/dashboard/peptides");
    if (existing && existing.slug !== updated.slug) {
      revalidatePeptidePages(existing.slug);
    }
    revalidatePeptidePages(updated.slug);

    return { success: true, data: updated };
  } catch (error) {
    console.error("updatePeptideInfo error:", error);
    return { error: error instanceof Error ? error.message : "Failed to update peptide info" };
  }
}

// Get a single peptide info by slug (for the front-end informational page)
// Includes customTopics so both fixed and admin-created topics render
// from one fetch.
export async function getPeptideInfoBySlug(slug: string) {
  try {
    return await db.peptideInfo.findUnique({
      where: { slug },
      include: { customTopics: { orderBy: { order: "asc" } } },
    });
  } catch (error) {
    console.error("getPeptideInfoBySlug error:", error);
    return null;
  }
}

// Combined {slug, topic} pairs for generateStaticParams on the
// [slug]/[topic] route — covers BOTH the fixed topics (dosage, benefits,
// etc.) and any admin-created custom topics.
export async function getAllPeptideTopicParams() {
  try {
    const peptides = await db.peptideInfo.findMany({
      select: { slug: true, customTopics: { select: { topicKey: true } } },
    });
    return peptides.flatMap((p) => [
      ...TOPIC_KEYS.map((topic) => ({ slug: p.slug, topic })),
      ...p.customTopics.map((ct) => ({ slug: p.slug, topic: ct.topicKey })),
    ]);
  } catch (error) {
    console.error("getAllPeptideTopicParams error:", error);
    return [];
  }
}

// Get all peptide infos (for admin listing)
export async function getAllPeptideInfos() {
  try {
    return await db.peptideInfo.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        productSlug: true,
        metaTitle: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("getAllPeptideInfos error:", error);
    return [];
  }
}

// Get all peptide slugs (for static generation)
export async function getAllPeptideSlugs() {
  try {
    return await db.peptideInfo.findMany({ select: { slug: true } });
  } catch (error) {
    console.error("getAllPeptideSlugs error:", error);
    return [];
  }
}

// Delete a peptide info by id
export async function deletePeptideInfo(id: string) {
  try {
    const existing = await db.peptideInfo.findUnique({
      where: { id },
      select: { slug: true },
    });

    await db.peptideInfo.delete({ where: { id } });

    revalidatePath("/dashboard/peptides");
    if (existing) revalidatePeptidePages(existing.slug);

    return { success: true };
  } catch (error) {
    console.error("deletePeptideInfo error:", error);
    return { error: "Failed to delete" };
  }
}

export async function getPeptideInfoById(id: string) {
  try {
    return await db.peptideInfo.findUnique({
      where: { id },
      include: { customTopics: { orderBy: { order: "asc" } } },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Lean query for the sitemap: pulls just enough to know which topic
// pages have actual content (so empty/noindexed pages aren't submitted
// to Google) and accurate lastModified timestamps.
export async function getAllPeptidesForSitemap() {
  try {
    return await db.peptideInfo.findMany({
      select: {
        slug: true,
        updatedAt: true,
        mechanismOfAction: true,
        benefits: true,
        dosageGuidance: true,
        sideEffects: true,
        safetyHandling: true,
        reconstitution: true,
        researchHighlights: true,
        comparisons: true,
        faq: true,
        customTopics: {
          select: { topicKey: true, updatedAt: true, content: true },
        },
      },
    });
  } catch (error) {
    console.error("getAllPeptidesForSitemap error:", error);
    return [];
  }
}