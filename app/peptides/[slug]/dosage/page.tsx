import { getPeptideInfoBySlug } from "@/actions/peptideInfo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideInfoBySlug(slug);
  if (!peptide) return { title: "Peptide Not Found" };

  return {
    title: `${peptide.name} Dosage Guidance for Research | Haelolabs`,
    description: `Proper ${peptide.name} dosage recommendations for laboratory research. Learn how to safely handle and administer ${peptide.name} in your studies.`,
    alternates: {
      canonical: `https://haelolabs.com/peptides/${slug}/dosage`,
    },
    robots: { index: true, follow: true },
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

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 text-white">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/peptides/${slug}`} className="hover:text-white">
          {peptide.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">Dosage Guidance</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {peptide.name} Dosage Guidance
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Research‑based dosage recommendations for {peptide.name}. Always follow
        laboratory safety protocols and institutional guidelines.
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

      {/* Call-to-action & internal links */}
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
        <Link
          href={`/peptides/${slug}`}
          className="inline-flex items-center gap-2 text-emerald-400 hover:underline font-medium"
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
        laboratory research purposes only. Not for human consumption or clinical
        use. Always follow applicable laws and regulations.
      </div>
    </article>
  );
}