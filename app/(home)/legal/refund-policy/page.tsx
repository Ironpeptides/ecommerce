// app/legal/refund-policy/page.tsx
import { FileWarning, RefreshCw, Package, Clock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund & Return Policy | Haelolabs",
  description:
    "Returns, refunds, claims, and quality assurance for research peptide products at Haelolabs.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileWarning className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
              Refund & Return Policy
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Effective Date: May 11, 2026</p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          {/* Research Use Only Notice */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                All products are sold strictly for laboratory and in‑vitro research
                purposes only. Not for human or veterinary use.
              </p>
            </div>
          </div>

          {/* General Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">General Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              Due to the sensitive, perishable, and research‑grade nature of our
              peptide compounds, all sales are considered final once an order has
              been fulfilled and shipped. We cannot re‑certify, retest, or restock
              opened or used compounds once they leave our custody. However, we
              stand behind our quality and are committed to making things right when
              the issue is on our end.
            </p>
          </section>

          {/* Eligible for Refund or Reship */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-gray-500" />
              Eligible for Refund or Reship
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white">
                    <th className="py-2 pr-4 font-medium">Situation</th>
                    <th className="py-2 pl-4 font-medium">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4">Wrong item received</td>
                    <td className="py-2 pl-4">Full refund or reship at our cost</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Visibly damaged in transit</td>
                    <td className="py-2 pl-4">Full refund or reship at our cost</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Lost in transit (confirmed by carrier)</td>
                    <td className="py-2 pl-4">Full reship or store credit</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Verified quality/purity issue (with documentation)</td>
                    <td className="py-2 pl-4">Full refund or reship</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Order cancelled before shipment</td>
                    <td className="py-2 pl-4">Full refund, no restocking fee</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Not Eligible */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Not Eligible for Refund</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Opened, reconstituted, or used products</li>
              <li>Buyer’s remorse or change of mind after shipment</li>
              <li>Improper storage or handling after delivery</li>
              <li>Orders placed with incorrect shipping addresses provided by the customer</li>
              <li>Delays caused by customs or international carriers outside our control</li>
            </ul>
          </section>

          {/* How to File a Claim */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              How to File a Claim
              <span className="text-gray-400 text-sm font-normal ml-2">(Damaged / Wrong / Lost)</span>
            </h2>
            <ol className="list-decimal pl-6 text-gray-300 space-y-2">
              <li>
                <strong className="text-white">Document it</strong> — Take clear
                photos of the outer packaging, inner packaging, vials, and labels
                upon receipt.
              </li>
              <li>
                Contact us within <strong className="text-white">48 hours</strong>{" "}
                of the carrier’s confirmed delivery timestamp at{" "}
                <a
                  href="mailto:support@haelo.fit"
                  className="text-gray-400 underline hover:text-white transition-colors"
                >
                  support@haelo.fit
                </a>
                .
              </li>
              <li>
                Include your order number, photos, and a brief description of the
                issue.
              </li>
              <li>
                Our team will review and respond within{" "}
                <strong className="text-white">1–2 business days</strong>.
              </li>
              <li>
                Approved claims will be resolved via full refund to the original
                payment method or a priority reship — your choice.
              </li>
            </ol>
          </section>

          {/* Unopened / Unused Returns */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              Unopened / Unused Returns
              <span className="text-gray-400 text-sm font-normal ml-2">(Within 7 Days)</span>
            </h2>
            <p className="text-gray-300 leading-relaxed">
              If you ordered the wrong product and it is completely unopened and in
              original sealed condition, we may accept a return within 7 days of
              delivery.
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-3">
              <li>Customer is responsible for return shipping costs.</li>
              <li>
                A <strong className="text-white">15% restocking fee</strong> applies
                to cover re‑inspection and documentation.
              </li>
              <li>
                Refund is issued within 5–7 business days of confirmed receipt.
              </li>
            </ul>
          </section>

          {/* Temperature-Sensitive Products */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-500" />
              Temperature‑Sensitive Products
            </h2>
            <p className="text-gray-300 leading-relaxed">
              All peptides are shipped with appropriate cold‑chain packaging. We
              are not responsible for degradation caused by carrier delays beyond{" "}
              <strong className="text-white">5 business days</strong> for domestic
              orders or <strong className="text-white">15 days</strong> for
              international orders. We strongly recommend selecting expedited
              shipping and shipping insurance at checkout.
            </p>
          </section>

          {/* Chargebacks */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Chargebacks</h2>
            <p className="text-gray-300 leading-relaxed">
              We take chargeback disputes seriously. If you have an issue with your
              order, please contact us first — we almost always make it right.
              Unjustified chargebacks will be contested with full documentation
              including order records, shipping confirmation, and photographic
              evidence submitted to your financial institution.
            </p>
          </section>

          {/* Shipping Insurance */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Shipping Insurance</h2>
            <p className="text-gray-300 leading-relaxed">
              We offer optional shipping insurance at checkout (recommended for all
              orders over $100). Insured orders that are lost, stolen, or damaged
              in transit are eligible for immediate reship or full refund without
              additional review delays.
            </p>
          </section>

          {/* Footer / Contact */}
          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>
              For any questions or concerns, contact us at{" "}
              <a
                href="mailto:support@haelo.fit"
                className="underline hover:text-gray-300 transition-colors"
              >
                support@haelo.fit
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}