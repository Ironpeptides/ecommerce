import { getPeptideInfoBySlug, getAllPeptideSlugs } from "@/actions/peptideInfo";
import { PeptideInfoContent } from "@/components/peptideInfo/PeptideInfoContent";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { makeMetaDescription } from "@/lib/peptide-topics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";

export interface FAQItem {
  question: string;
  answer: string;
}

type PageParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllPeptideSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

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

  const title =
    peptide.metaTitle ||
    `${peptide.name} Research: Structure, Studies & Laboratory Applications | ${SITE_NAME}`;
  const description =
    peptide.metaDescription ||
    makeMetaDescription(
      peptide.overview,
      `Research-grade ${peptide.name} peptide overview, mechanism of action, and laboratory applications. Strictly for research use.`
    );
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
      ...(peptide.keywords ?? []),
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

  const canonicalUrl = `${SITE_URL}/peptides/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${peptide.name} Research Overview`,
    description:
      peptide.overview?.substring(0, 300) || `Research overview of ${peptide.name}`,
    url: canonicalUrl,
    about: { "@type": "MedicalEntity", name: peptide.name },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(peptide.mechanismOfAction && { text: peptide.mechanismOfAction }),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };

  // Breadcrumb for the parent page too — was missing before, and Google
  // treats breadcrumb presence per-page, not inherited from children.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: peptide.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* slug is passed separately from peptide because productSlug (the
          buy-page link) is a different value from the route slug used
          for /peptides/[slug]/[topic] links */}
      <PeptideInfoContent peptide={peptide} slug={slug} />
    </>
  );
}