// app/legal/shipping-policy/page.tsx
import { Scale, Truck, Package, AlertTriangle, Globe } from "lucide-react";

export const metadata = {
  title: "Shipping & Import Compliance | [Site Name]",
  description: "International shipping, customs documentation, and import compliance for research compounds.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Shipping & Import Compliance</h1>
          </div>
          <p className="text-gray-400 text-sm">Effective: January 1, 2024</p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-sm">
                International buyers are solely responsible for customs clearance, duties, taxes, and compliance with
                their country's import regulations.
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">1. Processing Time</h2>
            <p className="text-gray-300 leading-relaxed">
              Orders are processed within 1-3 business days after payment confirmation. You will receive tracking
              information via email once your order ships. Bulk or custom orders may require additional processing time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" /> 2. Shipping Destinations
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We ship worldwide to qualified research institutions, laboratories, and registered researchers.
              Some countries have restrictions on research compounds—you are responsible for verifying import legality
              prior to ordering.
            </p>
            <div className="bg-white/5 rounded-lg p-4 mt-4">
              <p className="text-gray-400 text-sm font-mono">
                Restricted destinations: Countries under trade embargoes, or where target compounds are scheduled substances.
                Contact support for country-specific guidance.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">3. Shipping Methods</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 py-2">
                <span className="text-gray-300">Standard International</span>
                <span className="text-gray-500 text-sm">7-14 business days</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 py-2">
                <span className="text-gray-300">Express (DHL/FedEx)</span>
                <span className="text-gray-500 text-sm">3-5 business days</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 py-2">
                <span className="text-gray-300">Domestic (US only)</span>
                <span className="text-gray-500 text-sm">2-4 business days</span>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" /> 4. Customs & Documentation
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              All shipments include:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Commercial invoice with HS tariff codes</li>
              <li>Certificate of Analysis (batch-specific)</li>
              <li>Safety Data Sheet (SDS) for the compound</li>
              <li>Research Use Only declaration</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              <span className="text-white font-medium">Customs delays:</span> We cannot guarantee delivery timelines once
              packages enter customs. Some shipments may require importer permits or additional documentation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">5. Duties, Taxes & Fees</h2>
            <p className="text-gray-300 leading-relaxed">
              The buyer is responsible for all import duties, VAT, customs fees, and brokerage charges levied by the
              destination country. These are not included in our shipping rates. Failure to pay customs fees may result
              in seizure or destruction of goods—you will not receive a refund in such cases.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">6. Lost or Damaged Shipments</h2>
            <p className="text-gray-300 leading-relaxed">
              For lost or damaged shipments, you must file a claim with the carrier directly. We assist with claim
              documentation but are not liable for carrier mishandling. Signature upon delivery is required for all
              shipments over $500.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>Shipping compliance inquiries: shipping@[sitename].com</p>
          </div>
        </div>
      </div>
    </div>
  );
}