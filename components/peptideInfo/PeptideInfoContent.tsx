"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";

interface PeptideInfo {
  name: string;
  overview: string;
  mechanismOfAction?: string | null;
  researchHighlights?: string | null;
  dosageGuidance?: string | null;
  safetyHandling?: string | null;
  comparisons?: string | null;
  faq?: { question: string; answer: string }[];
  productSlug?: string | null;
}

export function PeptideInfoContent({ peptide }: { peptide: PeptideInfo }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", content: peptide.overview },
    { key: "mechanism", label: "Mechanism of Action", content: peptide.mechanismOfAction },
    { key: "research", label: "Research Highlights", content: peptide.researchHighlights },
    { key: "dosage", label: "Dosage Guidance", content: peptide.dosageGuidance },
    { key: "safety", label: "Safety & Handling", content: peptide.safetyHandling },
    { key: "comparisons", label: "Comparisons", content: peptide.comparisons },
    { key: "faq", label: "FAQ" },
  ].filter(tab => tab.key === "faq" ? peptide.faq?.length : tab.content);

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
          {activeTab !== "faq" && (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {tabs.find((t) => t.key === activeTab)?.content}
            </p>
          )}

          {activeTab === "faq" && peptide.faq && (
            <div className="space-y-4">
              {peptide.faq.map((item, i) => (
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
            </div>
          )}
          {activeTab === "dosage" && peptide.dosageGuidance && (
  <div className="mt-4">
    <Link
      href={`/peptides/${peptide.productSlug}/dosage`}
      className="text-emerald-400 text-sm hover:underline"
    >
      → View detailed dosage guide for {peptide.name}
    </Link>
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