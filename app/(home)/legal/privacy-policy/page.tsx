// app/legal/privacy-policy/page.tsx
import { LockKeyhole, Eye, Database, Mail, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy & Data Security | [Site Name]",
  description: "How we collect, process, and protect your data in compliance with GDPR and CCPA.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <LockKeyhole className="h-8 w-8 text-gray-500" />
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Privacy & Data Security</h1>
          </div>
          <p className="text-gray-400 text-sm">Last updated: January 1, 2024</p>
        </div>

        <div className="prose prose-invert prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-500" /> 1. Information We Collect
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To process orders and maintain compliance, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Account information: name, email, phone, shipping address</li>
              <li>Institutional affiliation and research credentials (for verification)</li>
              <li>Order history and product preferences</li>
              <li>Payment information (processed by secure third-party gateways)</li>
              <li>IP address and browser metadata for security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Order processing, fulfillment, and shipping</li>
              <li>Regulatory compliance (age verification, research use validation)</li>
              <li>Fraud prevention and security monitoring</li>
              <li>Communication regarding orders and policy updates</li>
              <li>Improving our products and website functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" /> 3. Data Protection
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>256-bit SSL encryption for all data transmission</li>
              <li>PCI DSS compliant payment processing</li>
              <li>Access controls and audit logging</li>
              <li>Regular security assessments</li>
              <li>Data retention policies (3 years for inactive accounts)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell your personal information. Limited data sharing occurs only with:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
              <li>Shipping carriers for delivery</li>
              <li>Payment processors for transaction completion</li>
              <li>Legal authorities when required by law</li>
              <li>Compliance auditors with NDA protections</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-500" /> 5. Your Rights (GDPR/CCPA)
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Access your stored data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Data portability (export your order history)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, email privacy@[sitename].com with verification of identity.
            </p>
          </section>

          <div className="border-t border-white/10 pt-6 mt-8 text-xs text-gray-500">
            <p>For data protection inquiries: dpo@[sitename].com</p>
          </div>
        </div>
      </div>
    </div>
  );
}