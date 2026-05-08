// app/legal/terms-of-service/page.tsx
import { Gavel, FileText, Scale, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Haelolabs",
  description: "Legal terms and conditions governing use of our research peptide ecommerce platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-gray-400 text-sm">Effective: January 1, 2024</p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" /> 1. Agreement to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using Haelolabs's website, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any part of these terms, you may not access
              the website or purchase any products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">2. Age and Legal Capacity</h2>
            <p className="text-gray-300 leading-relaxed">
              You must be at least 21 years of age and have the legal capacity to enter into binding contracts
              to purchase products from this website. By placing an order, you certify that you meet these requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">3. Account Responsibility</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain and promptly update your information</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Accept all risks of unauthorized access to your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">4. Order Acceptance</h2>
            <p className="text-gray-300 leading-relaxed">
              All orders are subject to acceptance by Haelolabs. We reserve the right to refuse or cancel any order
              for any reason, including product availability, errors in pricing, or suspected violation of our Research
              Use Policy. You will be notified if your order is cancelled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">5. Pricing and Payment</h2>
            <p className="text-gray-300 leading-relaxed">
              All prices are listed in USD and exclude applicable taxes, shipping, and handling fees. Prices are subject
              to change without notice. We accept payment via major credit cards, wire transfers, and cryptocurrency as
              indicated at checkout.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-gray-500" /> 6. Limitation of Liability
            </h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Haelolabs shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your use of or inability to use our products
              or website. Our total liability shall not exceed the amount you paid for products giving rise to the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">7. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Haelolabs from any claims, damages, losses, liabilities,
              costs, and expenses arising from your violation of these Terms, your misuse of products, or your violation
              of any applicable laws.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>For legal inquiries:  support@haelo.fit</p>
          </div>
        </div>
      </div>
    </div>
  );
}