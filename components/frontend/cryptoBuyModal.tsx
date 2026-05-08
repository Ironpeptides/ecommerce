"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Smartphone } from "lucide-react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = {
  instruction: string;
  tip?: string;
  image?: string;
};

type Platform = {
  id: string;
  name: string;
  color: string;
  accent: string;
  logo: string;
  steps: Step[];
  tip: string;
};

// ── Platform data ──────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  {
    id: "venmo",
    name: "Venmo",
    color: "from-[#008CFF] to-[#00A3FF]",
    accent: "text-[#008CFF]",
    logo: "💙",
    tip: "Your crypto stays in your Venmo account. You can send it to another wallet later if needed.",
    steps: [
      { instruction: "Open the Venmo app on your phone, At the bottom of the screen, tap Crypto.",               image: "/screenshots/venmo1.jpg" },
      { instruction: "Choose the cryptocurrency you want to buy (Bitcoin is the most popular and easiest).",     image: "/screenshots/venmo2.png" },
      { instruction: "Tap Buy.",                                                                                  image: "/screenshots/venmo-3.jpg" },
      { instruction: "Enter the dollar amount you want to spend — you can start with as little as $1.",          image: "/screenshots/venmo-4.jpg" },
      { instruction: "Review the details — you'll see how much crypto you'll get and any fees.",                  image: "/screenshots/venmo-5.jpg" },
    ],
  },
  {
    id: "cashapp",
    name: "Cash App",
    color: "from-[#00D632] to-[#00B82C]",
    accent: "text-[#00D632]",
    logo: "💚",
    tip: "Cash App has very low fees and is one of the simplest apps for buying Bitcoin.",
    steps: [
      { instruction: "Tap the Bitcoin tile (Cash App mainly supports Bitcoin).",                                  image: "/screenshots/cashapp-1.jpg" },
      { instruction: "Tap Buy.",                                                                                   image: "/screenshots/cashapp-2.jpg" },
      { instruction: "Choose a preset amount or tap More to enter your own dollar amount.",                       image: "/screenshots/cashapp-3.jpg" },
      { instruction: "Select your payment method — Cash Balance, debit card, or linked bank.",                    image: "/screenshots/cashapp-4.jpg" },
      { instruction: "Confirm with your PIN, Touch ID, or Face ID.",                                              image: "/screenshots/cashapp-5.jpg" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    color: "from-[#003087] to-[#009cde]",
    accent: "text-[#009cde]",
    logo: "🔵",
    tip: "PayPal makes it very easy if you already have money in your PayPal balance.",
    steps: [
      { instruction: "Open the PayPal app and tap Accounts at the bottom, then Tap Crypto.",  image: "/screenshots/paypal-1.jpg" },
      { instruction: "Choose the cryptocurrency you want — Bitcoin, Ethereum, etc.",          image: "/screenshots/paypal-2.jpg" },
      { instruction: "Tap Buy.",                                                               image: "/screenshots/paypal-3.jpg" },
      { instruction: "Enter the dollar amount you want to spend.",                            image: "/screenshots/paypal-4.jpg" },
      { instruction: "Select your payment method and tap Buy Now to confirm.",                image: "/screenshots/paypal-5.jpg" },
    ],
  },
];

// ── Preload helper ─────────────────────────────────────────────────────────────

function preloadImage(src?: string) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function CryptoBuyModal({ onClose }: { onClose: () => void }) {
  const [activePlatform, setActivePlatform] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  // imgKey drives the fade: bump it every time the image changes
  const [imgKey, setImgKey] = useState(0);

  const platform = PLATFORMS[activePlatform];
  const step     = platform.steps[activeStep];
  const isFirst  = activeStep === 0;
  const isLast   = activeStep === platform.steps.length - 1;

  // Preload next + prev images whenever step/platform changes
  useEffect(() => {
    preloadImage(platform.steps[activeStep + 1]?.image);
    preloadImage(platform.steps[activeStep - 1]?.image);
  }, [activePlatform, activeStep, platform.steps]);

  // Preload all images of the active platform on mount / platform switch
  useEffect(() => {
    platform.steps.forEach((s) => preloadImage(s.image));
  }, [activePlatform, platform.steps]);

  const goTo = (idx: number) => {
    setActiveStep(idx);
    setImgKey((k) => k + 1);
  };

  const handlePlatformChange = (idx: number) => {
    setActivePlatform(idx);
    setActiveStep(0);
    setImgKey((k) => k + 1);
  };

  const goNext = () => { if (!isLast)  goTo(activeStep + 1); };
  const goPrev = () => { if (!isFirst) goTo(activeStep - 1); };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-start justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full lg:max-w-lg lg:rounded-2xl lg:mx-auto bg-[#0d0d0d] border-x-0 border border-white/10 shadow-2xl flex flex-col overflow-y-scroll"
        style={{ height: "100dvh" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base">How to Buy Crypto</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Step-by-step guide for beginners</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Platform tabs ── */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handlePlatformChange(i)}
              className={`flex-1 py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                activePlatform === i
                  ? `${p.accent} border-b-2 border-current`
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.logo} {p.name}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Progress bar */}
          <div className="px-4 sm:px-6 pt-3 pb-2">
            <div className="flex items-center gap-1 mb-2">
              {platform.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full flex-1 transition-all ${
                    i === activeStep
                      ? "bg-white"
                      : i < activeStep
                      ? "bg-white/40"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-500">
              Step {activeStep + 1} of {platform.steps.length}
            </p>
          </div>

          {/* ── Screenshot with overlay arrows ── */}
          <div className="px-4 sm:px-6 pb-3">
            {step.image ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 h-80 group"
                   style={{ height: "clamp(400px, 50vh, 420px)" }}>

                {/* Image with fade transition */}
                <Image
                  key={imgKey}
                  src={step.image}
                  alt={`Step ${activeStep + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                  className="object-cover animate-fadeIn"
                  
                />

                {/* Left arrow overlay */}
                {!isFirst && (
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                               w-8 h-8 sm:w-10 sm:h-10 rounded-full
                               bg-blue/60 hover:bg-black/80 border border-white/10
                               flex items-center justify-center text-white
                               opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition-opacity duration-200"
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {/* Right arrow overlay */}
                {!isLast && (
                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                               w-8 h-8 sm:w-10 sm:h-10 rounded-full
                               bg-black/60 hover:bg-black/80 border border-white/10
                               flex items-center justify-center text-white
                               opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition-opacity duration-200"
                    aria-label="Next step"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}

                {/* Step counter badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-gray-300 border border-white/10">
                  {activeStep + 1} / {platform.steps.length}
                </div>
              </div>
            ) : (
              <div className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center"
                   style={{ height: "clamp(180px, 30vh, 320px)" }}>
                <div className="text-center space-y-2">
                  <Smartphone className="h-8 w-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-600">Screenshot coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Instruction ── */}
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ${platform.accent}`}>
                {activeStep + 1}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{step.instruction}</p>
            </div>
          </div>

          {/* ── Pro Tip (last step) ── */}
          {isLast && (
            <div className="px-4 sm:px-6 pb-3">
              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 mb-1">Pro Tip</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{platform.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── All steps overview (last step) ── */}
          {isLast && (
            <div className="px-4 sm:px-6 pb-6">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">All Steps</p>
              <div className="space-y-1.5">
                {platform.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="w-full flex items-center gap-3 text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i <= activeStep ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-400"
                    }`}>
                      {i < activeStep ? "✓" : i + 1}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{s.instruction}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation footer ── */}
        <div className="flex pb-16 items-center gap-3 px-4 sm:px-6 py-3 border-t border-white/10 flex-shrink-0 bg-[#0d0d0d]">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600">{platform.name}</p>
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Done ✓
            </button>
          ) : (
            <button
              onClick={goNext}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Keyframe for fade-in — inject once via a style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.18s ease-in-out;
        }
      `}</style>
    </div>
  );
}