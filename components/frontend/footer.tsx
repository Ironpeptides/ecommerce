"use client";
import Image from "next/image";
import Link from "next/link";
import ThemeButton from "./theme-button";
import { useRouter } from "next/navigation";
import Logo from "../global/Logo";

export default function Footer() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "#suggested-products" },
    /* { label: "Research Blog", href: "/blog" },
    { label: "Lab Partners", href: "/partners" }, */
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const catalogItems = [
    { label: "Recovery Peptides", href: "#suggested-products" },
    /* { label: "Growth Peptides", href: "/catalog?category=growth" },
    { label: "Cognitive Peptides", href: "/catalog?category=cognitive" },
    { label: "Longevity & Anti-Aging", href: "/catalog?category=longevity" },
    { label: "Hormonal Support", href: "/catalog?category=hormonal" },
    { label: "Research Bundles", href: "/catalog?category=bundle" }, */
  ];

  const complianceItems = [
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "Terms & Conditions", href: "/legal/terms-of-service" },
    { label: "Shipping Policy", href: "/legal/shipping-policy" },
    { label: "Refund Policy", href: "/legal/refund-policy" },
  ];

  const router = useRouter();

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 md:px-8 lg:px-16 rounded-t-[2.5rem] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative">
        {/* ── CTA Banner ── */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              Premium peptides for serious researchers
            </h2>
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
              Sourced from ISO-certified laboratories. Every batch third-party
              tested for purity, identity, and sterility — so your research
              starts on solid ground.
            </p>
          </div>
          <div className="flex gap-3 md:flex-row flex-col shrink-0">
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-2.5 border border-gray-700 hover:border-emerald-500 rounded-full text-gray-300 hover:text-emerald-400 transition-all duration-300 text-sm"
            >
              Talk to an Expert
            </button>
            <ThemeButton
              href="/"
              title="Browse Catalog"
            />
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">

            {/* Brand column */}
            <div className="lg:col-span-4">
              <Logo variant="dark" />
              <p className="text-gray-500 text-sm mt-4 mb-6 leading-relaxed max-w-xs">
                Your trusted source for research-grade peptides.
                Rigorous QA. Transparent sourcing. Fast dispatch.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["ISO Certified", "3rd-Party Tested", "Secure Checkout"].map((badge) => (
                  <span
                    key={badge}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Social links */}
              <h3 className="text-sm font-semibold mb-3 text-gray-300">Follow Our Research</h3>
              <div className="flex gap-3">
                {[
                  { icon: "https://cdn-icons-png.flaticon.com/128/5968/5968764.png", label: "Facebook" },
                  { icon: "https://cdn-icons-png.flaticon.com/128/3670/3670151.png", label: "Twitter" },
                  { icon: "https://cdn-icons-png.flaticon.com/128/145/145807.png", label: "LinkedIn" },
                  { icon: "https://cdn-icons-png.flaticon.com/128/3670/3670176.png", label: "Instagram" },
                ].map(({ icon, label }) => (
                  <Link
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-transparent transition-all duration-300"
                  >
                    <Image
                      src={icon}
                      alt={label}
                      width={16}
                      height={16}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                Navigate
              </h3>
              <ul className="space-y-2.5">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Catalog */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                Catalog
              </h3>
              <ul className="space-y-2.5">
                {catalogItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Compliance */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                  Contact
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "support@peptidestore.com", href: "mailto:support@peptidestore.com" },
                    { label: "Live Chat (Mon–Fri, 9–5 EST)", href: "/contact" },
                    /* { label: "Order Tracking", href: "/tracking" }, */
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="space-y-2.5">
                  {complianceItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Research Disclaimer ── */}
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-amber-400/80 text-xs leading-relaxed">
              <span className="font-semibold text-amber-400">⚠ Research Use Only.</span>{" "}
              All products sold on this platform are intended strictly for
              in-vitro research and laboratory use by qualified professionals.
              They are{" "}
              <span className="font-semibold">
                not approved for human consumption, veterinary use, or clinical
                application
              </span>{" "}
              and have not been evaluated by the FDA or any equivalent regulatory
              authority. By purchasing, you confirm you are a licensed researcher
              or scientist and accept full responsibility for compliance with all
              applicable local laws and regulations.
            </p>
          </div>

          {/* ── Footer Bottom ── */}
          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} PeptideStore. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {complianceItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-500 hover:text-emerald-400 transition-colors text-xs"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}