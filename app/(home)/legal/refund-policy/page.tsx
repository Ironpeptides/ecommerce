// app/legal/refund-policy/page.tsx
import { FileWarning, RefreshCw, Package, Clock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund & Return Policy | Haelolabs",
  description: "Returns, refunds, claims, and quality assurance for research peptide products.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileWarning className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Refund & Return Policy</h1>
          </div>
          <p className="text-gray-400 text-sm">Last updated: January 1, 2024</p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Due to the nature of research chemicals, all sales are final unless otherwise specified below.
                Please review this policy carefully before placing your order.
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">1. Inspection Period</h2>
            <p className="text-gray-300 leading-relaxed">
              Upon delivery, you have <span className="font-bold text-white">14 calendar days</span> to inspect the products
              for visible defects, damages, or discrepancies from your order. Claims must be submitted within this period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" /> 2. Filing a Claim
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To file a claim, email  support@haelo.fit with:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Your order number</li>
              <li>Photographic evidence of the issue</li>
              <li>Batch/lot numbers from the product label</li>
              <li>Description of the discrepancy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-gray-500" /> 3. Eligible Returns
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Returns are accepted only under the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><span className="text-white font-medium">Damaged in transit:</span> Product container compromised during shipping</li>
              <li><span className="text-white font-medium">Wrong product shipped:</span> Item differs from purchase order</li>
              <li><span className="text-white font-medium">Quality failure:</span> Product fails HPLC/MS purity specification (&lt;95%)</li>
            </ul>
            <p className="text-gray-400 text-sm italic mt-4">
              Note: Change of mind, improper storage, or incompatible research applications are not valid return reasons.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">4. Non-Returnable Items</h2>
            <p className="text-gray-300 leading-relaxed">
              The following cannot be returned under any circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Opened or reconstituted peptides</li>
              <li>Products stored outside temperature specifications</li>
              <li>Items past 30 days from delivery</li>
              <li>Custom or synthesized sequences</li>
              <li>Clearance or discounted items</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">5. Resolution Process</h2>
            <p className="text-gray-300 leading-relaxed">
              Upon approved claim, we will offer, at our discretion:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Full replacement shipment (no additional cost)</li>
              <li>Store credit for the product value</li>
              <li>Partial refund for minor purity deviations (≥90% but &lt;95%)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Shipping costs are non-refundable. Approved returns must be shipped back in original packaging with
              hazardous material documentation if applicable.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>Claims are processed within 5-7 business days of receiving returned items.</p>
          </div>
        </div>
      </div>
    </div>
  );
}