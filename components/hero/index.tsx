"use client";

import { MoveRight, ShieldCheck, Zap, Star, ChevronRight, FlaskConical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center w-full bg-[#0a0a0b] overflow-hidden pt-20 pb-12 md:py-0">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Acetic-Water-01-mockup-300x300.webp"
          alt="Research Background"
          fill
          className="object-cover opacity-[0.07] grayscale"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0a0a0b_90%)]" />
      </div>

      {/* Structured Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-start space-y-6 md:space-y-8">
            
            <div className="flex items-center md:mt-5 gap-3 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs md:text-sm font-medium tracking-tight text-emerald-400 uppercase">
                99.8% Purity Verified • ISO Certified Laboratory
              </p>
            </div>

            <div className="space-y-4">
              <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
                Unlock Your <br />
                <span className="text-emerald-500 italic font-serif"> Biological Potential</span>
              </h1>
              
              <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
                Premium-grade research peptides engineered for precision. 
                We provide ultra-high purity peptides for advanced biological study. 
                Engineered for accuracy, delivered with full analytical documentation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/products")}
                className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-500 active:scale-95"
              >
                Browse Catalog
                <MoveRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => router.push("/lab-reports")}
                className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
              >
                <FlaskConical className="h-4 w-4 text-emerald-500" />
                Lab Analysis
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-white/5 w-full">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
                <span className="ml-3 text-white font-medium text-sm">4.9/5 Rating</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <p className="text-gray-500 text-sm italic">
                Trusted by 2,500+ University & Private Labs
              </p>
            </div>
          </div>

          {/* Right Section: Video Card */}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto lg:ml-auto">
            <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl -m-4 hidden md:block" />
            
            <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-gray-900 shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              >
                <source src="/videos/peptide.mp4" type="video/mp4" />
                <source src="/videos/your-video.webm" type="video/webm" />
              </video>

              {/* Data Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#0a0a0b]/80 backdrop-blur-md border border-white/10 rounded-lg">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Batch ID</p>
                    <p className="text-white font-mono text-sm">#B-992-PX</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-500 font-bold uppercase">Stability Verified</p>
                    <p className="text-white text-sm font-semibold">T-Grade Certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Disclaimer */}
      <div className="absolute bottom-6 w-full text-center px-4">
        <p className="text-[10px] md:text-xs text-gray-600 uppercase tracking-[0.2em]">
          Restricted to Laboratory Research Use Only — Not for Therapeutic Administration
        </p>
      </div>
    </section>
  );
};

export default Hero;