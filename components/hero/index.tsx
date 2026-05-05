
import Link from "next/link";

import {  MoveRight, Star } from "lucide-react";
import Image from "next/image";


const Hero = () => {
  

  return (
    <section className="relative min-h-[100dvh] flex flex-col w-full bg-[#0a0a0b] overflow-hidden">

      {/* Background image */}
      {/* <div className="absolute inset-0 z-0">
        <Image
          src="/images/Acetic-Water-01-mockup-300x300.webp"
          alt="Research Background"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-[0.07] grayscale"
          priority
          fetchPriority="high"
        />
   
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_transparent_0%,_#0a0a0b_85%)]" />
       
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      </div> */}

      {/* ── Main content — grows to fill, keeps disclaimer clear ── */}
      <div className="relative z-10 flex-1 flex items-center pt-24 pb-28 md:pt-28 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Left: Text ── */}
            <div className="flex flex-col items-start space-y-7">

              {/* Purity badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] md:text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                  99.8% Purity Verified · ISO Certified Laboratory
                </p>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.08]">
                  Research-Grade<br />Peptides{" "}
                  <span className="text-emerald-500 italic font-serif">
                    At an<br className="hidden sm:block" /> Affordable Price
                  </span>
                </h1>

                <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed">
                  Premium-grade research peptides engineered for precision.
                  Ultra-high purity compounds delivered with full analytical documentation.
                </p>
              </div>

              {/* CTA — single button */}
              <Link
               href="/products"
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/30"
              >
           Browse Catalog
            <MoveRight className="h-4 w-4" />
</Link>

              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-4 border-t border-white/5 w-full">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  ))}
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

              {/* Outer decorative ring */}
              <div className="absolute -inset-3 rounded-[28px] border border-emerald-500/10 hidden md:block pointer-events-none" />
              {/* Second softer ring */}
              <div className="absolute -inset-6 rounded-[36px] border border-emerald-500/5 hidden md:block pointer-events-none" />

              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-[0_32px_80px_rgba(0,0,0,0.6)] aspect-[4/5]">

                {/* Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/images/hero-poster.png"
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/videos/IronPeptidevideo.mp4" type="video/mp4" />
                  <source src="/videos/IronPeptidevideo.webm" type="video/webm" />
                </video>

                {/* Gradient scrim so overlays read well */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                {/* Top-left live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Batch</span>
                </div>

                {/* Top-right purity chip */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">99.8% Pure</span>
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
                    {/* Progress bar — decorative purity indicator */}
                    <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[99.8%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 text-right">Purity: 99.8%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Disclaimer — pinned to bottom, never overlaps content ── */}
      <div className="relative z-10 flex-shrink-0 w-full border-t border-white/5 py-3 px-4 text-center bg-[#0a0a0b]/80 backdrop-blur-sm">
        <p className="text-[10px] md:text-[11px] text-gray-600 uppercase tracking-[0.18em]">
          Restricted to Laboratory Research Use Only — Not for Therapeutic Administration
        </p>
      </div>

    </section>
  );
};

export default Hero;