import {
  getPeptideInfoBySlug,
  getAllPeptideTopicParams,
} from "@/actions/peptideInfo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  PEPTIDE_TOPICS,
  TOPIC_KEYS,
  TopicKey,
  resolveTopicSeo,
  sanitizeText,
  makeMetaDescription,
  PeptideInfoLike,
} from "@/lib/peptide-topics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haelolabs.com";
const SITE_NAME = "Haelo Labs";

export async function generateStaticParams() {
  return getAllPeptideTopicParams();
}

function isFixedTopic(topic: string): topic is TopicKey {
  return (TOPIC_KEYS as string[]).includes(topic);
}

type CustomTopic = {
  id: string;
  topicKey: string;
  label: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
};

type ResolvedPage =
  | { kind: "fixed"; peptide: PeptideInfoLike; topicKey: TopicKey }
  | { kind: "custom"; peptide: PeptideInfoLike; custom: CustomTopic };

async function resolvePage(slug: string, topic: string): Promise<ResolvedPage | null> {
  const peptide = (await getPeptideInfoBySlug(slug)) as
    | (PeptideInfoLike & { customTopics?: CustomTopic[] })
    | null;
  if (!peptide) return null;

  if (isFixedTopic(topic)) {
    return { kind: "fixed", peptide, topicKey: topic };
  }

  const custom = peptide.customTopics?.find((t) => t.topicKey === topic);
  if (custom) {
    return { kind: "custom", peptide, custom };
  }

  return null;
}

// ============================================================
// Metadata
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}): Promise<Metadata> {
  const { slug, topic } = await params;
  const resolved = await resolvePage(slug, topic);

  if (!resolved) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalUrl = `${SITE_URL}/peptides/${slug}/${topic}`;
  let title: string;
  let description: string;
  let keywords: string[];
  let hasContent: boolean;

  if (resolved.kind === "fixed") {
    const seo = resolveTopicSeo(resolved.peptide, resolved.topicKey);
    title = seo.title;
    description = seo.description;
    keywords = seo.keywords;
    const field = PEPTIDE_TOPICS[resolved.topicKey].field;
    hasContent =
      field === "faq"
        ? Array.isArray(resolved.peptide.faq) && resolved.peptide.faq.length > 0
        : Boolean(sanitizeText(resolved.peptide[field as keyof PeptideInfoLike] as string));
  } else {
    const { custom, peptide } = resolved;
    title = custom.metaTitle || `${peptide.name} ${custom.label}`;
    description =
      custom.metaDescription ||
      makeMetaDescription(custom.content, `${custom.label} information for ${peptide.name}.`);
    keywords = [...custom.keywords, ...(peptide.keywords || [])];
    hasContent = Boolean(sanitizeText(custom.content));
  }

  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonicalUrl },
    robots: {
      index: hasContent,
      follow: true,
      googleBot: {
        index: hasContent,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: "@haelolabs",
      creator: "@haelolabs",
    },
  };
}

// ============================================================
// Page
// ============================================================
export default async function PeptideTopicPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic } = await params;
  const resolved = await resolvePage(slug, topic);
  if (!resolved) notFound();

  const { peptide } = resolved;
  const canonicalUrl = `${SITE_URL}/peptides/${slug}/${topic}`;

  const label =
    resolved.kind === "fixed" ? PEPTIDE_TOPICS[resolved.topicKey].label : resolved.custom.label;
  const heading =
    resolved.kind === "fixed"
      ? PEPTIDE_TOPICS[resolved.topicKey].heading(peptide.name)
      : `${peptide.name} ${resolved.custom.label}`;
  const intro =
    resolved.kind === "fixed"
      ? PEPTIDE_TOPICS[resolved.topicKey].intro(peptide.name)
      : `Research information on ${resolved.custom.label.toLowerCase()} for ${peptide.name}.`;

  const isFaq = resolved.kind === "fixed" && resolved.topicKey === "faq";
  const faqItems = isFaq && Array.isArray(peptide.faq) ? peptide.faq : [];
  const bodyText = isFaq
    ? ""
    : sanitizeText(
        resolved.kind === "fixed"
          ? (peptide[PEPTIDE_TOPICS[resolved.topicKey].field as keyof PeptideInfoLike] as string | null)
          : resolved.custom.content
      );

  const hasContent = isFaq ? faqItems.length > 0 : Boolean(bodyText);

  // ----- JSON-LD -----
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: peptide.name,
        item: `${SITE_URL}/peptides/${slug}`,
      },
      { "@type": "ListItem", position: 3, name: label, item: canonicalUrl },
    ],
  };

  const articleJsonLd = !isFaq
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: heading,
        description: bodyText.slice(0, 300) || `${label} information for ${peptide.name}`,
        url: canonicalUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        about: { "@type": "MedicalEntity", name: peptide.name },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }
    : null;

  const faqJsonLd =
    isFaq && faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  // ----- Sibling links: fixed topics + any custom topics, minus current -----
  const fixedSiblings = TOPIC_KEYS.filter(
    (t) => !(resolved.kind === "fixed" && t === resolved.topicKey)
  ).map((t) => ({ key: t, label: PEPTIDE_TOPICS[t].label }));

  const customSiblings = ((peptide as { customTopics?: CustomTopic[] }).customTopics ?? [])
    .filter((t) => !(resolved.kind === "custom" && t.topicKey === resolved.custom.topicKey))
    .map((t) => ({ key: t.topicKey, label: t.label }));

  const siblings = [...fixedSiblings, ...customSiblings];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="max-w-4xl mx-auto px-4 py-12 text-white">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li>
              <Link href={`/peptides/${slug}`} className="hover:text-white transition-colors">
                {peptide.name}
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-300" aria-current="page">
              {label}
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h1>
        <p className="text-gray-400 text-lg mb-8">{intro}</p>

        {hasContent ? (
          isFaq ? (
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="font-semibold text-lg mb-2">{item.question}</h2>
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 whitespace-pre-wrap text-gray-300 leading-relaxed">
                {bodyText}
              </div>
            </div>
          )
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-amber-400/80 text-sm">
            Detailed {label.toLowerCase()} information for {peptide.name} is currently being
            compiled by our research team. Please check back soon or contact us for the latest
            lab guidelines.
          </div>
        )}

        {siblings.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
              More about {peptide.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.key}
                  href={`/peptides/${slug}/${s.key}`}
                  className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-gray-300 transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
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

        <div className="mt-10 bg-black/50 border border-amber-500/20 rounded-lg p-4 text-xs text-amber-400/70">
          <strong>Research Use Only:</strong> This product is intended for laboratory research
          purposes only. Not for human consumption or clinical use. Always follow applicable laws
          and regulations.
        </div>
      </article>
    </>
  );
}