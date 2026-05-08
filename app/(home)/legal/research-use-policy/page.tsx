// app/legal/research-use-policy/page.tsx
import { ShieldAlert, FileText, AlertTriangle, BookOpen } from "lucide-react";

export const metadata = {
  title: "Research Use Policy | Haelolabs",
  description: "Terms governing non-human, non-clinical research applications of our peptide products.",
};

export default function ResearchUsePolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Research Use Policy</h1>
          </div>
          <p className="text-gray-400 text-sm">Last updated: January 1, 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-gray max-w-none">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-400/90 text-sm font-medium">
                IMPORTANT NOTICE: All products sold on this website are intended for laboratory research purposes only.
                None of the products are for human consumption, clinical use, or veterinary applications.
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" /> 1. Scope of Use
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              By purchasing any product from Haelolabs, you expressly acknowledge and agree that all products are
              supplied strictly for in-vitro laboratory research and non-clinical animal studies conducted by qualified
              research personnel in properly equipped facilities.
            </p>
            <p className="text-gray-300 leading-relaxed">
              These products are not intended for diagnostic, therapeutic, or prophylactic use in humans or animals.
              No products have been approved by the FDA, EMA, or any other regulatory agency for human consumption.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">2. Purchaser Representation</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>You are at least 21 years of age</li>
              <li>You are purchasing products for legitimate research purposes</li>
              <li>Your research facility maintains appropriate safety protocols</li>
              <li>You will not administer products to humans or animals</li>
              <li>You understand the chemical and biological hazards of research compounds</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">3. Prohibited Activities</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Human or animal consumption under any circumstances</li>
              <li>Clinical trials without explicit regulatory approval</li>
              <li>Distribution to unauthorized third parties</li>
              <li>Use in cosmetic or personal care products</li>
              <li>Re-sale without proper documentation and compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">4. Compliance with Laws</h2>
            <p className="text-gray-300 leading-relaxed">
              You are solely responsible for compliance with all applicable local, state, federal, and international
              laws governing the purchase, possession, and use of research compounds. This includes obtaining any
              necessary licenses or permits required by your jurisdiction.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>For questions regarding this Research Use Policy, contact  support@haelo.fit</p>
          </div>
        </div>
      </div>
    </div>
  );
}