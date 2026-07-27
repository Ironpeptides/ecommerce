"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export type PeptideInfoProps = {
  slug: string;
  name: string;
  overview: string;
  mechanismOfAction?: string;
  researchHighlights?: string;
  dosageGuidance?: string;
  safetyHandling?: string;
  comparisons?: string;
  faq?: { question: string; answer: string }[];
  productSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
};

// Create a new peptide info page
export async function createPeptideInfo(data: PeptideInfoProps) {
  try {
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
      },
    });

    revalidatePath("/dashboard/peptides"); // adjust path as needed
    return { success: true, data: peptide };
  } catch (error) {
    console.error("createPeptideInfo error:", error);
    return { error: "Failed to create peptide info" };
  }
}

// Update existing peptide info by id
export async function updatePeptideInfo(id: string, data: Partial<PeptideInfoProps>) {
  try {
    const updated = await db.peptideInfo.update({
      where: { id },
      data: {
        ...data,
        faq: data.faq ?? undefined,
      },
    });

    revalidatePath("/dashboard/peptides");
    return { success: true, data: updated };
  } catch (error) {
    console.error("updatePeptideInfo error:", error);
    return { error: "Failed to update peptide info" };
  }
}

// Get a single peptide info by slug (for the front-end informational page)
export async function getPeptideInfoBySlug(slug: string) {
  try {
    return await db.peptideInfo.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("getPeptideInfoBySlug error:", error);
    return null;
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
    const peptides = await db.peptideInfo.findMany({
      select: { slug: true },
    });
    return peptides;
  } catch (error) {
    console.error("getAllPeptideSlugs error:", error);
    return [];
  }
}

// Delete a peptide info by id
export async function deletePeptideInfo(id: string) {
  try {
    await db.peptideInfo.delete({
      where: { id },
    });
    revalidatePath("/dashboard/peptides");
    return { success: true };
  } catch (error) {
    console.error("deletePeptideInfo error:", error);
    return { error: "Failed to delete" };
  }
}

export async function getPeptideInfoById(id: string) {
  try {
    return await db.peptideInfo.findUnique({ where: { id } });
  } catch (error) {
    console.error(error);
    return null;
  }
}