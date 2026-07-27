import { getPeptideInfoBySlug, getAllPeptideSlugs } from "@/actions/peptideInfo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";

// PRE-BUILD ALL DOSAGE PAGES AT DEPLOY TIME
export async function generateStaticParams() {
  const slugs = await getAllPeptideSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideInfoBySlug(slug);

  if (!peptide) {
    return {
      title: "Peptide Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${peptide.name} Dosage: Research Concentrations & Laboratory Guidelines | ${SITE_NAME}`;
  const description =
    peptide.dosageGuidance?.substring(0, 155) ||
    `Research-based ${peptide.name} dosage concentrations and laboratory handling guidelines. Strictly for research use.`;
  const canonicalUrl = `${SITE_URL}/peptides/${slug}/dosage`;

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
      `${peptide.name} dosage`,
      `${peptide.name} research dosage`,
      `${peptide.name} laboratory concentration`,
      "peptide dosage research",
      "research peptide guidelines",
    ],
    openGraph: {
      title: `${peptide.name} Dosage Guidelines | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${peptide.name} Dosage Guidelines | ${SITE_NAME}`,
      description,
      site: "@haelolabs",
      creator: "@haelolabs",
    },
  };
}

export default async function PeptideDosagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = await getPeptideInfoBySlug(slug);
  if (!peptide) notFound();

  const canonicalUrl = `${SITE_URL}/peptides/${slug}/dosage`;

  // BreadcrumbList schema for rich snippets
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: peptide.name,
        item: `${SITE_URL}/peptides/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Dosage Guidance",
        item: canonicalUrl,
      },
    ],
  };

  // Article schema for the dosage page
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${peptide.name} Dosage Guidance for Research`,
    description:
      peptide.dosageGuidance?.substring(0, 300) ||
      `Research-based dosage guidelines for ${peptide.name}.`,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: {
      "@type": "MedicalEntity",
      name: peptide.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-12 text-white">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-gray-400 mb-6"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li>
              <Link
                href={`/peptides/${slug}`}
                className="hover:text-white transition-colors"
              >
                {peptide.name}
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-300" aria-current="page">
              Dosage Guidance
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {peptide.name} Dosage Guidance
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Research‑based dosage recommendations for {peptide.name}. Always
          follow laboratory safety protocols and institutional guidelines.
        </p>

        {peptide.dosageGuidance ? (
          <div className="prose prose-invert max-w-none">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 whitespace-pre-wrap text-gray-300 leading-relaxed">
              {peptide.dosageGuidance}
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-amber-400/80 text-sm">
            Detailed dosage information for {peptide.name} is currently being
            compiled by our research team. Please check back soon or contact us
            for the latest lab guidelines.
          </div>
        )}

        {/* Internal links & CTA */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
          <Link
            href={`/peptides/${slug}`}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            ← Back to {peptide.name} Overview
          </Link>

          {peptide.productSlug && (
            <Link
              href={`/product/${peptide.productSlug}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Purchase {peptide.name} for Research
            </Link>
          )}
        </div>

        {/* Research disclaimer */}
        <div className="mt-10 bg-black/50 border border-amber-500/20 rounded-lg p-4 text-xs text-amber-400/70">
          <strong>Research Use Only:</strong> This product is intended for
          laboratory research purposes only. Not for human consumption or
          clinical use. Always follow applicable laws and regulations.
        </div>
      </article>
    </>
  );
}