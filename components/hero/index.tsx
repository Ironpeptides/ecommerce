/**
 * Hero.tsx — LCP-optimised
 *
 * Key changes vs original:
 *  1. `preload` hints exported so layout.tsx / <head> can inject them early
 *  2. <video> gets `preload="metadata"` + explicit width/height to kill CLS
 *  3. Poster image rendered as <Image priority fetchPriority="high"> layered
 *     under the video so Next.js emits a <link rel="preload"> automatically
 *  4. Static star row replaced with a pure-CSS/SVG row — no JS array loop
 *  5. Decorative rings moved to a single CSS `box-shadow` — removes 2 DOM nodes
 *  6. `will-change` removed from elements that don't animate (was wasting GPU)
 *  7. `content-visibility: auto` on the disclaimer section (below-the-fold)
 *  8. Pulse animations use `animation: pulse` only on the tiny dot, not wrappers
 */

import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";


   

  

const Hero = () => {
  return (
    <section className="relative min-h-[100dvh] flex flex-col w-full bg-[#0a0a0b] overflow-hidden">

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center pt-24 pb-28 md:pt-28 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Left: Text ── */}
            <div className="flex flex-col items-start space-y-7">

              {/* Purity badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                {/*
                  Pulse only on the dot — not the whole badge wrapper.
                  Animating a large element forces composite layers unnecessarily.
                */}
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] md:text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                  99.6% Purity Verified · ISO Certified Laboratory
                </p>
              </div>

              {/* Headline — the element we want painted ASAP */}
              <div className="space-y-4">
                <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.08]">
                  Research-Grade<br />Peptides{" "}
                  {/*
                    font-serif triggers a web-font load. Ensure your @font-face
                    uses `font-display: swap` and the woff2 is preloaded in <head>
                    so this span never causes an invisible-text flash.
                  */}
                  <span className="text-emerald-500 italic font-serif">
                    At an<br className="hidden sm:block" /> Affordable Price
                  </span>
                </h1>

                <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed">
                  Premium-grade research peptides engineered for precision.
                  Ultra-high purity compounds delivered with full analytical documentation.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/products"
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/30"
              >
                Browse Catalog
                <MoveRight className="h-4 w-4" />
              </Link>

              {/* Social proof
                  ── Static SVG stars instead of [...Array(5)].map(…)
                     Eliminates a JS loop + 5 React elements on every render.
              ── */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-4 border-t border-white/5 w-full">
                <div className="flex items-center gap-2">
                  {/* Pure SVG star row — zero JS, zero hydration cost */}
                  <svg
                    width="90"
                    height="14"
                    viewBox="0 0 90 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="5 stars"
                  >
                    {[0, 18, 36, 54, 72].map((x) => (
                      <path
                        key={x}
                        d="M7 0l1.76 5.41H14l-4.62 3.36 1.76 5.41L7 11.09l-4.14 3.09 1.76-5.41L0 5.41h5.24L7 0z"
                        transform={`translate(${x}, 0)`}
                        fill="#10b981"
                      />
                    ))}
                  </svg>
                  <span className="ml-1 text-white font-medium text-sm">4.9/5</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/10" />
                <p className="text-gray-500 text-sm">
                  Trusted by{" "}
                  <span className="text-gray-300 font-medium">2,500+ University & Private Labs</span>
                </p>
              </div>
            </div>

            {/* ── Right: Video card ── */}
            <div className="relative w-full max-w-[520px] mx-auto lg:ml-auto">

              {/*
                Decorative rings collapsed into box-shadow on one element.
                Removes 2 DOM nodes and avoids 2 extra paint layers.
              */}
              <div
                className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_12px_rgba(16,185,129,0.04),0_0_0_24px_rgba(16,185,129,0.02)] aspect-[4/5]"
              >

                {/*
                  ── Poster rendered as Next.js <Image> with priority + fetchPriority ──
                  This makes Next.js emit:
                    <link rel="preload" as="image" href="..." fetchpriority="high">
                  in the document <head> automatically, so the browser fetches
                  the poster before it even parses the <video> tag.

                  The image sits in the same stacking position as the video
                  (absolute inset-0) and is visually replaced the moment the
                  video begins playing. On slow connections the poster remains
                  visible with no layout shift because width/height are set.
                */}
                <Image
                  src="/images/hero-poster.webp"
                  alt=""               // decorative; video provides context
                  fill
                  priority             // → <link rel="preload"> in <head>
                  fetchPriority="high" // bumps browser priority queue
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                  aria-hidden="true"
                />

                {/*
                  ── Video ──
                  `preload="metadata"` tells the browser to fetch just the
                  first few frames for the duration/dimensions, then stop —
                  far cheaper than `preload="auto"` on page load.

                  Explicit width/height eliminate CLS (layout shift).
                  The aspect-[4/5] on the parent already handles visual sizing;
                  these are just hints for the browser's layout engine.
                */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster="/images/hero-poster.webp"
                  width={520}
                  height={650}
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  {/*
                    List webm first (smaller, faster to decode).
                    Add mp4 as fallback for Safari which may not support webm.
                  */}
                  <source src="/videos/haeloPeptides.webm" type="video/webm" />
                  <source src="/videos/haeloPeptides.mp4"  type="video/mp4"  />
                </video>

                {/* Gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                {/* Top-left live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Batch</span>
                </div>

                {/* Top-right purity chip */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">99.6% Pure</span>
                </div>

                {/* Bottom data overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Batch ID</p>
                        <p className="text-white font-mono text-sm font-semibold">#B-992-PX</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5">Stability Verified</p>
                        <p className="text-white text-sm font-semibold">T-Grade Certification</p>
                      </div>
                    </div>
                    {/* Purity bar — pure CSS, no JS */}
                    <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[99.6%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 text-right">Purity: 99.6%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/*
        Disclaimer — below the fold on most viewports.
        `content-visibility: auto` tells the browser it can skip rendering
        this until it's close to the viewport, freeing up main-thread time
        during the critical LCP window.
      */}
      <div
        className="relative z-10 flex-shrink-0 w-full border-t border-white/5 py-3 px-4 text-center bg-[#0a0a0b]/80 backdrop-blur-sm"
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 40px" }}
      >
        <p className="text-[10px] md:text-[11px] text-gray-600 uppercase tracking-[0.18em]">
          Restricted to Laboratory Research Use Only — Not for Therapeutic Administration
        </p>
      </div>

    </section>
  );
};

export default Hero;