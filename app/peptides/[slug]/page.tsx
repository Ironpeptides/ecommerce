import { getPeptideInfoBySlug, getAllPeptideSlugs } from "@/actions/peptideInfo";
import { PeptideInfoContent } from "@/components/peptideInfo/PeptideInfoContent";
import { notFound } from "next/navigation";

// Define the exact shape your component expects
export interface FAQItem {
  question: string;
  answer: string;
}

// Type definition for Page Params
type PageParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllPeptideSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export default async function PeptideInfoPage({ 
  params 
}: { 
  params: PageParams 
}) {
  const { slug } = await params;
  const rawPeptide = await getPeptideInfoBySlug(slug);

  if (!rawPeptide) notFound();

  // Safely cast or parse the JSON field
  const peptide = {
    ...rawPeptide,
    faq: (rawPeptide.faq as FAQItem[] | null) ?? undefined,
  };

  return <PeptideInfoContent peptide={peptide} />;
}