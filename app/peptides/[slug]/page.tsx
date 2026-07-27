import { getPeptideInfoBySlug, getAllPeptideSlugs } from "@/actions/peptideInfo";
import { PeptideInfoContent } from "@/components/peptideInfo/PeptideInfoContent";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";

export interface FAQItem {
  question: string;
  answer: string;
}

type PageParams = Promise<{ slug: string }>;

// PRE-BUILD ALL PEPTIDE INFO PAGES AT DEPLOY TIME
export async function generateStaticParams() {
  const slugs = await getAllPeptideSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

// DYNAMIC METADATA FOR SEO
export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideInfoBySlug(slug);

  if (!peptide) {
    return {
      title: "Peptide Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${peptide.name} Research: Structure, Studies & Laboratory Applications | ${SITE_NAME}`;
  const description =
    peptide.overview?.substring(0, 155) ||
    `Research-grade ${peptide.name} peptide overview, mechanism of action, and laboratory applications. Strictly for research use.`;
  const canonicalUrl = `${SITE_URL}/peptides/${slug}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    keywords: [
      peptide.name,
      `${peptide.name} peptide`,
      `${peptide.name} research`,
      "research peptides",
      "laboratory grade",
      peptide.name.toLowerCase().replace(/\s/g, ""),
    ],
    openGraph: {
      title: `${peptide.name} Research | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${peptide.name} Research | ${SITE_NAME}`,
      description,
      site: "@haelolabs",
      creator: "@haelolabs",
    },
  };
}

export default async function PeptideInfoPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const rawPeptide = await getPeptideInfoBySlug(slug);

  if (!rawPeptide) notFound();

  const peptide = {
    ...rawPeptide,
    faq: (rawPeptide.faq as FAQItem[] | null) ?? undefined,
  };

  // JSON-LD Structured Data for the peptide info page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${peptide.name} Research Overview`,
    description:
      peptide.overview?.substring(0, 300) ||
      `Research overview of ${peptide.name}`,
    url: `${SITE_URL}/peptides/${slug}`,
    about: {
      "@type": "MedicalEntity",
      name: peptide.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(peptide.mechanismOfAction && {
      text: peptide.mechanismOfAction,
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/peptides/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PeptideInfoContent peptide={peptide} />
    </>
  );
}