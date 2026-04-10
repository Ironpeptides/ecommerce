import Footer from "@/components/frontend/footer";
import SiteHeader from "@/components/frontend/site-header";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import React, { ReactNode } from "react";
import { PremiumProvider } from "@/components/providers/premium-provider";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-[#0a0a0b] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      <PremiumProvider>

      
      
      {/* PROFESSIONAL ANNOUNCEMENT BANNER */}
<div className="sticky top-0 z-[60] w-full h-12 flex items-center border-b border-[#2860c0] bg-[#3370D1] overflow-hidden">
        <div className="relative flex w-full overflow-hidden">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-12 px-6">

                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                    <span className="font-semibold text-white">Strictly RUO:</span>
                    <span className="text-white">Research Use Only</span>
                  </span>
                  <span className="text-blue-200/40">|</span>
                  <span className="text-white">Not for Human Consumption</span>
                  <span className="text-blue-200/40">|</span>
                  <span className="text-white">No Therapeutic Use</span>
                </div>

                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]">
                  <span className="font-medium text-white">Logistics:</span>
                  <span className="text-white">USPS 2–3 Day Dispatch</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                  <span className="font-semibold text-white">Complimentary Shipping Over $200</span>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 2. Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035] mix-blend-overlay"
        style={{ width: "100vw", height: "100vh" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* 3. Radial vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[10]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* 4. Top-edge glow line */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-0 z-[9998] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 30%, rgba(99,102,241,0.5) 70%, transparent 100%)",
        }}
      />

      {/* 5. Corner ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]"
      />

      {/* 6. Center accent orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/10 blur-[140px]"
      />

      <div className="relative flex min-h-screen flex-col">
        <SiteHeader session={session}  />
        <main className="flex-1 transition-all duration-700 ease-in-out">
          {children}
        </main>
        <Footer />
      </div>
    </PremiumProvider>
    </div>
    
  );
}