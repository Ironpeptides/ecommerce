// app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  FlaskConical,
  Dna,
  Microscope,
  Award,
  Truck,
  Clock,
  BadgeDollarSign,
  HeartHandshake,
  Scale,
  FileCheck,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "About Us  - Every Batch. Uncompromising Quality.",
  description: "Quality isn’t a claim — it’s our standard. Every product is manufactured with precision and held to the highest benchmarks for purity, consistency, and performance.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Hero Section with Image */}
      <div className="relative h-[400px] w-full mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <Image
          src="/images/lab-hero.jpg"
          alt="Research laboratory with analytical equipment"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center"
          priority
        />
        <div className="relative z-20 container max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 uppercase tracking-tight">
              About {/* <span className="text-gray-400">[Site Name]</span> */}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Analytical-grade research compounds delivered with integrity, transparency, and scientific rigor.
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4">
        {/* Mission Statement - Ethical Pricing */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-6">
              <BadgeDollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-xs uppercase tracking-wider text-gray-400">Fair Pricing Commitment</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Ethical Pricing. Premium Quality. No Exceptions.</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We price our products fairly and ethically—not trying to gouge our customers. In an industry where
              markup often exceeds 500-1000%, we maintain transparent, research-friendly pricing that respects your
              laboratory's budget constraints.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              <span className="text-white font-bold">We have the highest quality products for the lowest prices.</span>{" "}
              This isn't a marketing slogan—it's our operating principle. Every compound undergoes rigorous HPLC/MS
              testing, and we pass the savings of our efficient supply chain directly to you.
            </p>
            <div className="flex gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">40%+</div>
                <div className="text-xs text-gray-500 uppercase">Below Market Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.2%</div>
                <div className="text-xs text-gray-500 uppercase">Average Purity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2,500+</div>
                <div className="text-xs text-gray-500 uppercase">Research Institutions</div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-[400px] rounded-xl overflow-hidden border border-white/10">
            <Image
              src="/images/slide-2.jpg"
              alt="Transparent pricing commitment"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Quality Assurance Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="relative h-[380px] rounded-xl overflow-hidden border border-white/10">
            <Image
              src="/images/slide-3.jpg"
              alt="HPLC analysis in progress"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-6 w-fit">
              <FlaskConical className="h-4 w-4 text-gray-400" />
              <span className="text-xs uppercase tracking-wider text-gray-400">Every Batch. Uncompromising Quality.</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Every Batch. Uncompromising Quality.</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Quality isn’t a claim — it’s our standard. Every product is manufactured with precision and held to the highest benchmarks for purity, consistency, and performance.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-gray-500" /> Consistent excellence across every batch</li>
              <li className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-gray-500" /> Produced under strict quality controls</li>
              <li className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-gray-500" /> Designed for reliable, premium results</li>
            </ul>
          </div>
        </div>

        {/* Our Story */}
        <div className="border-t border-white/10 pt-16 mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-gray-400">
              Founded by researchers, for researchers. We saw an industry plagued by predatory pricing and inconsistent quality.
              So we built a better way.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-4 text-gray-500">2018</div>
              <h3 className="text-lg font-bold text-white mb-2">Founded</h3>
              <p className="text-gray-400 text-sm">Established by PhD researchers to serve the academic research community with integrity.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-4 text-gray-500">2,500+</div>
              <h3 className="text-lg font-bold text-white mb-2">Global Clients</h3>
              <p className="text-gray-400 text-sm">From university labs to pharmaceutical R&D centers across 47 countries.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-4 text-gray-500">0</div>
              <h3 className="text-lg font-bold text-white mb-2">Price Gouging</h3>
              <p className="text-gray-400 text-sm">We've never raised prices beyond COGS increases—and we never will.</p>
            </div>
          </div>
        </div>

        {/* Core Values with Icons */}
        <div className="border-t border-white/10 pt-16 mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Principles</h2>
            <p className="text-gray-400">The values that guide every decision, from sourcing to shipping.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <HeartHandshake className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Fair & Ethical Pricing</h3>
              <p className="text-gray-400 text-sm">No opportunistic markups. No artificial scarcity pricing. Just honest, sustainable margins.</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <Award className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Uncompromising Quality</h3>
              <p className="text-gray-400 text-sm">Below 95% purity? We don't sell it. Above 99%? That's our standard for every batch.</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <ShieldCheck className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Regulatory Compliance</h3>
              <p className="text-gray-400 text-sm">Full adherence to research chemical regulations and international shipping laws.</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <Globe className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Global Accessibility</h3>
              <p className="text-gray-400 text-sm">Serving research institutions worldwide with reliable, documented shipping.</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <Scale className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Scientific Integrity</h3>
              <p className="text-gray-400 text-sm">We don't overpromise. Every product is labeled accurately for legitimate research only.</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <Truck className="h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Reliable Fulfillment</h3>
              <p className="text-gray-400 text-sm">Temperature-controlled shipping, discreet documentation, and tracking for every order.</p>
            </div>
          </div>
        </div>

        {/* Team / Facility Image Banner */}
        <div className="relative h-[300px] rounded-xl overflow-hidden mb-16">
          <Image
            src="/images/slide-3.jpg"
            alt="Research team in laboratory setting"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-2">Dedicated to advancing research.</p>
              <p className="text-gray-300 text-sm">Our partners include ISO 17025 certified testing facilities worldwide.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border border-white/10 rounded-xl p-8 md:p-12 text-center bg-white/5">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start your research?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of researchers who choose us for uncompromising quality and fair pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-white/20 text-white text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>

        {/* Footer Legal Disclaimer */}
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-xs text-gray-500">
          <p>
            [Site Name] supplies research compounds exclusively for in-vitro laboratory applications.
            Not for human consumption or clinical use.
          </p>
        </div>
      </div>
    </div>
  );
}