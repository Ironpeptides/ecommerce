"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Bitcoin,
  ArrowLeft,
  Shield,
  Zap,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  border: string;
  bg: string;
  logo: string;
  steps: Step[];
  tip: string;
};

// ── Platform data ─────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  {
    id: "venmo",
    name: "Venmo",
    color: "from-[#008CFF] to-[#00A3FF]",
    accent: "text-[#008CFF]",
    border: "border-[#008CFF]/30",
    bg: "bg-[#008CFF]/10",
    logo: "💙",
    tip: "Your crypto stays in your Venmo account. You can send it to another wallet later if needed.",
    steps: [
      { instruction: "Open the Venmo app on your phone. At the bottom of the screen, tap Crypto.", image: "/screenshots/venmo-1.jpg" },
      { instruction: "Choose the cryptocurrency you want to buy (Bitcoin is the most popular and easiest).", image: "/screenshots/venmo-2.jpg" },
      { instruction: "Tap Buy.", image: "/screenshots/venmo-3.jpg" },
      { instruction: "Enter the dollar amount you want to spend — you can start with as little as $1.", image: "/screenshots/venmo-4.jpg" },
      { instruction: "Review the details — you'll see how much crypto you'll get and any fees.", image: "/screenshots/venmo-5.jpg" },
    ],
  },
  {
    id: "cashapp",
    name: "Cash App",
    color: "from-[#00D632] to-[#00B82C]",
    accent: "text-[#00D632]",
    border: "border-[#00D632]/30",
    bg: "bg-[#00D632]/10",
    logo: "💚",
    tip: "Cash App has very low fees and is one of the simplest apps for buying Bitcoin.",
    steps: [
      { instruction: "Tap the Bitcoin tile (Cash App mainly supports Bitcoin).", image: "/screenshots/cashapp-1.jpg" },
      { instruction: "Tap Buy.", image: "/screenshots/cashapp-2.jpg" },
      { instruction: "Choose a preset amount or tap More to enter your own dollar amount.", image: "/screenshots/cashapp-3.jpg" },
      { instruction: "Select your payment method — Cash Balance, debit card, or linked bank.", image: "/screenshots/cashapp-4.jpg" },
      { instruction: "Confirm with your PIN, Touch ID, or Face ID.", image: "/screenshots/cashapp-5.jpg" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    color: "from-[#003087] to-[#009cde]",
    accent: "text-[#009cde]",
    border: "border-[#009cde]/30",
    bg: "bg-[#009cde]/10",
    logo: "🔵",
    tip: "PayPal makes it very easy if you already have money in your PayPal balance.",
    steps: [
      { instruction: "Open the PayPal app and tap Accounts at the bottom, then tap Crypto.", image: "/screenshots/paypal-1.jpg" },
      { instruction: "Choose the cryptocurrency you want — Bitcoin, Ethereum, etc.", image: "/screenshots/paypal-2.jpg" },
      { instruction: "Tap Buy.", image: "/screenshots/paypal-3.jpg" },
      { instruction: "Enter the dollar amount you want to spend.", image: "/screenshots/paypal-4.jpg" },
      { instruction: "Select your payment method and tap Buy Now to confirm.", image: "/screenshots/paypal-5.jpg" },
    ],
  },
];

// ── Preload helper ─────────────────────────────────────────────────────────────

function preloadImage(src?: string) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

// ── Step Guide Component ──────────────────────────────────────────────────────

const PlatformGuide = ({ platform }: { platform: Platform }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [imgKey, setImgKey] = useState(0);

  const step = platform.steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === platform.steps.length - 1;

  // Preload all platform images on mount
  useEffect(() => {
    platform.steps.forEach((s) => preloadImage(s.image));
  }, [platform]);

  // Preload adjacent images on step change
  useEffect(() => {
    preloadImage(platform.steps[activeStep + 1]?.image);
    preloadImage(platform.steps[activeStep - 1]?.image);
  }, [activeStep, platform.steps]);

  // Reset step when platform changes
  useEffect(() => {
    setActiveStep(0);
    setImgKey((k) => k + 1);
  }, [platform]);

  const goTo = (idx: number) => {
    setActiveStep(idx);
    setImgKey((k) => k + 1);
  };

  const goNext = () => { if (!isLast)  goTo(activeStep + 1); };
  const goPrev = () => { if (!isFirst) goTo(activeStep - 1); };

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* ── Left: step list ── */}
      <div className="lg:w-72 shrink-0 space-y-2">
        {platform.steps.map((s, i) => {
          const done   = i < activeStep;
          const active = i === activeStep;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                active
                  ? `${platform.border} ${platform.bg}`
                  : done
                  ? "border-white/5 bg-white/[0.02] opacity-60"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/5"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 transition-all ${
                  done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : active
                    ? `${platform.bg} ${platform.accent}`
                    : "bg-white/10 text-gray-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <p className={`text-xs leading-relaxed ${active ? "text-gray-100" : "text-gray-500"}`}>
                {s.instruction}
              </p>
            </button>
          );
        })}

        {/* Progress bar */}
        <div className="flex gap-1 pt-2 px-1">
          {platform.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all ${
                i === activeStep ? "bg-white" : i < activeStep ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-gray-600 px-1">
          Step {activeStep + 1} of {platform.steps.length}
        </p>
      </div>

      {/* ── Right: screenshot + instruction ── */}
      <div className="flex-1 space-y-5">

        {/* Screenshot with overlay arrows */}
        {step.image ? (
          <div
            className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5 group"
            style={{ height: "clamp(400px, 50vh, 460px)" }}
          >
            <Image
              key={imgKey}
              src={step.image}
              alt={`Step ${activeStep + 1}`}
              fill
            
              priority
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-contain animate-fadeIn"
            />

            {/* Left arrow */}
            {!isFirst && (
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                           w-9 h-9 rounded-full
                           bg-black/60 hover:bg-black/80 border border-white/10
                           flex items-center justify-center text-white
                           opacity-0 group-hover:opacity-100 focus:opacity-100
                           transition-opacity duration-200"
                aria-label="Previous step"
              >
                <ChevronLeft size={17} />
              </button>
            )}

            {/* Right arrow */}
            {!isLast && (
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                           w-9 h-9 rounded-full
                           bg-black/60 hover:bg-black/80 border border-white/10
                           flex items-center justify-center text-white
                           opacity-0 group-hover:opacity-100 focus:opacity-100
                           transition-opacity duration-200"
                aria-label="Next step"
              >
                <ChevronRight size={17} />
              </button>
            )}

            {/* Step counter badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-gray-300 border border-white/10">
              {activeStep + 1} / {platform.steps.length}
            </div>
          </div>
        ) : (
          <div
            className="w-full max-w-xs mx-auto rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center"
            style={{ height: "clamp(200px, 34vh, 360px)" }}
          >
            <div className="text-center space-y-2">
              <Smartphone className="h-10 w-10 text-gray-700 mx-auto" />
              <p className="text-xs text-gray-700">Screenshot coming soon</p>
            </div>
          </div>
        )}

        {/* Active instruction card */}
        <div className={`flex items-start gap-4 p-5 rounded-2xl border ${platform.border} ${platform.bg}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${platform.bg} ${platform.accent} border ${platform.border}`}>
            {activeStep + 1}
          </div>
          <p className="text-sm text-gray-100 leading-relaxed pt-1">{step.instruction}</p>
        </div>

        {/* Pro tip on last step */}
        {isLast && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-400 mb-1">Pro Tip</p>
              <p className="text-sm text-gray-300 leading-relaxed">{platform.tip}</p>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Back
          </button>

          {!isLast && (
            <button
              onClick={goNext}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Next <ChevronRight size={15} />
            </button>
          )}

          {isLast && (
            <Link
              href="/#suggested-products"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Shop now →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CryptoCheckoutPage() {
  const [activePlatform, setActivePlatform] = useState(0);
  const platform = PLATFORMS[activePlatform];

  return (
    <main className="min-h-screen bg-[#080809] text-white">

      {/* Fade keyframe — injected once */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.18s ease-in-out;
        }
      `}</style>

      {/* ── Hero strip ── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-amber-500/10 blur-3xl rounded-full" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8"
          >
            <ArrowLeft size={13} /> Back to store
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Bitcoin className="text-amber-400" size={22} />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              15% off with crypto
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            How to Buy Crypto &amp;{" "}
            <span className="text-amber-400">Save 15%</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl leading-relaxed">
            New to crypto? No problem. Pick your app below and follow the steps — it takes about 5 minutes to get set up, and you'll save 15% on every order you pay with crypto.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { icon: Tag,    label: "15% off every order" },
              { icon: Zap,    label: "Instant checkout" },
              { icon: Shield, label: "Secured by Payram" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                <Icon size={13} className="text-amber-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Payram notice ── */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15">
          <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">One-time ID check on your first purchase</p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              Crypto purchases are final — unlike credit cards, they can't be charged back, which makes them a target for fraud. Our payment processor{" "}
              <span className="text-gray-200 font-medium">Payram</span> does a single ID verification on your first purchase (~30 seconds) to confirm it's really you. After that, no verification is ever needed again. Payram handles it directly —{" "}
              <span className="text-gray-200">we never see or store your ID.</span> This is the same process used by Coinbase, Cash App, and every regulated crypto platform.
            </p>
          </div>
        </div>
      </div>

      {/* ── Platform tabs + guide ── */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-24">
        <div className="flex border-b border-white/10 mb-8">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(i)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                activePlatform === i
                  ? `${p.accent} border-current`
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              <span>{p.logo}</span>
              {p.name}
            </button>
          ))}
        </div>

        <PlatformGuide platform={platform} />
      </div>

      {/* ── Bottom CTA ── */}
      <div className="border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-white text-lg">Ready to checkout?</p>
            <p className="text-sm text-gray-500 mt-1">Your 15% discount is applied automatically at checkout when you select crypto.</p>
          </div>
          <Link
            href="/#suggested-products"
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm hover:from-amber-400 hover:to-yellow-400 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
          >
            <Bitcoin size={16} />
            Shop &amp; pay with crypto
          </Link>
        </div>
      </div>
    </main>
  );
}