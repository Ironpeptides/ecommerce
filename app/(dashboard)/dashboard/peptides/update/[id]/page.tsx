import { getPeptideInfoById } from "@/actions/peptideInfo";
import { PeptideInfoForm } from "@/components/dashboard/peptides/peptide-info-form";
import { PeptideCustomTopicsManager } from "@/components/dashboard/peptides/peptide-custom-topics-manager";
import { notFound } from "next/navigation";

export default async function UpdatePeptidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peptide = await getPeptideInfoById(id);
  if (!peptide) notFound();

  const initialData = {
    name: peptide.name,
    slug: peptide.slug,
    overview: peptide.overview,
    mechanismOfAction: peptide.mechanismOfAction ?? undefined,
    benefits: peptide.benefits ?? undefined,
    researchHighlights: peptide.researchHighlights ?? undefined,
    dosageGuidance: peptide.dosageGuidance ?? undefined,
    sideEffects: peptide.sideEffects ?? undefined,
    safetyHandling: peptide.safetyHandling ?? undefined,
    reconstitution: peptide.reconstitution ?? undefined,
    comparisons: peptide.comparisons ?? undefined,
    productSlug: peptide.productSlug ?? undefined,
    metaTitle: peptide.metaTitle ?? undefined,
    metaDescription: peptide.metaDescription ?? undefined,
    keywords: peptide.keywords ?? [],
    faq: Array.isArray(peptide.faq)
      ? (peptide.faq as { question: string; answer: string }[])
      : [],
  };

  return (
    <div className="p-8">
      <PeptideInfoForm initialData={initialData} editingId={id} />

      {/* Custom topics need a real peptideId (foreign key), so this only
          shows up once the peptide already exists — i.e. here, not on
          the create form. */}
      <PeptideCustomTopicsManager
        peptideId={id}
        initialTopics={peptide.customTopics}
      />
    </div>
  );
}