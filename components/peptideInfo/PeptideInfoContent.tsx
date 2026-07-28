"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { PEPTIDE_TOPICS, TOPIC_KEYS, makeExcerpt } from "@/lib/peptide-topics";

interface CustomTopic {
  topicKey: string;
  label: string;
  content: string;
  order: number;
}

interface PeptideInfo {
  name: string;
  overview: string;
  mechanismOfAction?: string | null;
  benefits?: string | null;
  researchHighlights?: string | null;
  dosageGuidance?: string | null;
  sideEffects?: string | null;
  safetyHandling?: string | null;
  reconstitution?: string | null;
  comparisons?: string | null;
  faq?: { question: string; answer: string }[];
  productSlug?: string | null;
  customTopics?: CustomTopic[]; // admin-created topics, no code changes needed
}

// This is the route slug — different from productSlug, which is the
// buy-page link. Passed down separately from the parent page.
export function PeptideInfoContent({
  peptide,
  slug,
}: {
  peptide: PeptideInfo;
  slug: string;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Every topic tab (except overview, which lives only on this page)
  // is generated from the shared config — add a topic there and it
  // shows up here automatically, no edits needed in this file.
  const fixedTopicTabs = TOPIC_KEYS.filter((key) => key !== "faq").map((key) => ({
    key,
    label: PEPTIDE_TOPICS[key].label,
    content: peptide[PEPTIDE_TOPICS[key].field as keyof PeptideInfo] as
      | string
      | null
      | undefined,
  }));

  const customTopicTabs = [...(peptide.customTopics ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ key: t.topicKey, label: t.label, content: t.content }));

  const tabs = [
    { key: "overview", label: "Overview", content: peptide.overview },
    ...fixedTopicTabs,
    ...customTopicTabs,
    { key: "faq", label: "FAQ", content: undefined },
  ].filter((tab) => (tab.key === "faq" ? peptide.faq?.length : tab.content));

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;
  const isOverview = activeTab === "overview";
  const isFaq = activeTab === "faq";
  const isTopicTab = !isOverview && !isFaq;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {peptide.name} Research Guide
        </h1>
        <p className="text-gray-400 mb-8">
          Comprehensive research information for laboratory professionals
        </p>

        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          {/* Overview: full text, lives only here, nothing duplicated */}
          {isOverview && (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {peptide.overview}
            </p>
          )}

          {/* Topic tabs (dosage, benefits, side effects, etc.): TEASER only,
              full content lives at /peptides/[slug]/[topic] — this is what
              avoids the duplicate-content problem */}
          {isTopicTab && (
            <div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {makeExcerpt(activeContent, 400)}
              </p>
              <div className="mt-4">
                <Link
                  href={`/peptides/${slug}/${activeTab}`}
                  className="text-emerald-400 text-sm hover:underline"
                >
                  → Read the full {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} guide for {peptide.name}
                </Link>
              </div>
            </div>
          )}

          {/* FAQ: show first 3 as a teaser, link to full FAQ page if more exist */}
          {isFaq && peptide.faq && (
            <div className="space-y-4">
              {peptide.faq.slice(0, 3).map((item, i) => (
                <details
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer"
                >
                  <summary className="text-emerald-400 font-medium">
                    {item.question}
                  </summary>
                  <p className="text-gray-300 mt-2">{item.answer}</p>
                </details>
              ))}
              {peptide.faq.length > 3 && (
                <Link
                  href={`/peptides/${slug}/faq`}
                  className="text-emerald-400 text-sm hover:underline inline-block mt-2"
                >
                  → View all {peptide.faq.length} FAQs for {peptide.name}
                </Link>
              )}
            </div>
          )}
        </div>

        {peptide.productSlug && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href={`/product/${peptide.productSlug}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ShoppingBag size={18} />
              Purchase {peptide.name} for Research
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}