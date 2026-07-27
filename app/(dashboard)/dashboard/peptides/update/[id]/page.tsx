import { getPeptideInfoById } from "@/actions/peptideInfo";
import { PeptideInfoForm } from "@/components/dashboard/peptides/peptide-info-form";
import { notFound } from "next/navigation";

export default async function UpdatePeptidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peptide = await getPeptideInfoById(id);
  if (!peptide) notFound();

  // Convert database types to form-compatible types
  const initialData = {
    name: peptide.name,
    slug: peptide.slug,
    overview: peptide.overview,
    mechanismOfAction: peptide.mechanismOfAction ?? undefined,
    researchHighlights: peptide.researchHighlights ?? undefined,
    dosageGuidance: peptide.dosageGuidance ?? undefined,
    safetyHandling: peptide.safetyHandling ?? undefined,
    comparisons: peptide.comparisons ?? undefined,
    productSlug: peptide.productSlug ?? undefined,
    metaTitle: peptide.metaTitle ?? undefined,
    metaDescription: peptide.metaDescription ?? undefined,
    // Ensure faq is always an array of the correct type
    faq: Array.isArray(peptide.faq)
      ? (peptide.faq as { question: string; answer: string }[])
      : [],
  };

  return (
    <div className="p-8">
      <PeptideInfoForm initialData={initialData} editingId={id} />
    </div>
  );
}