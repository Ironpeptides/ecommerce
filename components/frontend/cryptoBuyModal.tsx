"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Smartphone } from "lucide-react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = {
  instruction: string;
  tip?: string;
  image?: string; // path to your screenshot, e.g. "/screenshots/venmo-step-1.jpg"
};

type Platform = {
  id: string;
  name: string;
  color: string;
  accent: string;
  logo: string; // emoji or image path
  steps: Step[];
  tip: string;
};

// ── Platform data — add your screenshot paths to each step.image ──────────────

const PLATFORMS: Platform[] = [
  {
    id: "venmo",
    name: "Venmo",
    color: "from-[#008CFF] to-[#00A3FF]",
    accent: "text-[#008CFF]",
    logo: "💙",
    tip: "Your crypto stays in your Venmo account. You can send it to another wallet later if needed.",
    steps: [
      
      { instruction: "Open the Venmo app on your phone, At the bottom of the screen, tap Crypto.",               image: "/screenshots/venmo-1.jpg" },
      { instruction: "Choose the cryptocurrency you want to buy (Bitcoin is the most popular and easiest).",     image: "/screenshots/venmo-2.jpg" },
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
      { instruction: "Tap the Bitcoin tile (Cash App mainly supports Bitcoin).",                                                  image: "/screenshots/cashapp-1.jpg" },
      { instruction: "Tap Buy.",                                                                                                   image: "/screenshots/cashapp-2.jpg" },
      { instruction: "Choose a preset amount or tap More to enter your own dollar amount.",                                       image: "/screenshots/cashapp-3.jpg" },
      { instruction: "Select your payment method — Cash Balance, debit card, or linked bank.",                                    image: "/screenshots/cashapp-4.jpg" },
      { instruction: "Confirm with your PIN, Touch ID, or Face ID.",                                                              image: "/screenshots/cashapp-5.jpg" },
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
      { instruction: "Open the PayPal app and tap Accounts at the bottom, then Tap Crypto.",         image: "/screenshots/paypal-1.jpg" },
      { instruction: "Choose the cryptocurrency you want — Bitcoin, Ethereum, etc.",                 image: "/screenshots/paypal-2.jpg" },
      { instruction: "Tap Buy.",                                                                     image: "/screenshots/paypal-3.jpg" },
      { instruction: "Enter the dollar amount you want to spend.",                                   image: "/screenshots/paypal-4.jpg" },
      { instruction: "Select your payment method and tap Buy Now to confirm.",                       image: "/screenshots/paypal-5.jpg" },
    ],
  },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

export function CryptoBuyModal({ onClose }: { onClose: () => void }) {
  const [activePlatform, setActivePlatform] = useState(0);
  const [activeStep,     setActiveStep]     = useState(0);

  const platform = PLATFORMS[activePlatform];
  const step     = platform.steps[activeStep];
  const isFirst  = activeStep === 0;
  const isLast   = activeStep === platform.steps.length - 1;

  const handlePlatformChange = (idx: number) => {
    setActivePlatform(idx);
    setActiveStep(0);
  };

  return (
    <div
  className="fixed inset-0 z-[900] flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm pt-0" 
  onClick={onClose}
>
      <div
        className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="font-bold text-white text-base">How to Buy Crypto</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step-by-step guide for beginners</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handlePlatformChange(i)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                activePlatform === i
                  ? `${p.accent} border-b-2 border-current`
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.logo} {p.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Progress bar */}
          <div className="px-5 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-1 mb-3">
              {platform.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
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
            <p className="text-xs text-gray-500">
              Step {activeStep + 1} of {platform.steps.length}
            </p>
          </div>

          {/* Screenshot */}
          <div className="px-5 pb-4">
            {step.image ? (
              <div className="relative w-full aspect-[9/16] max-h-64 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src={step.image}
                  alt={`Step ${activeStep + 1}`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              // Placeholder when no screenshot is provided yet
              <div className="w-full h-48 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Smartphone className="h-8 w-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-600">Screenshot</p>
                </div>
              </div>
            )}
          </div>

          {/* Instruction */}
          <div className="px-5 pb-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ${platform.accent}`}>
                {activeStep + 1}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{step.instruction}</p>
            </div>
          </div>

          {/* Tip — shown on last step */}
          {isLast && (
            <div className="px-5 pb-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 mb-1">Pro Tip</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{platform.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* All steps overview — shown on last step */}
          {isLast && (
            <div className="px-5 pb-5">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">All Steps</p>
              <div className="space-y-2">
                {platform.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="w-full flex items-center gap-3 text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i < activeStep ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-400"
                    }`}>
                      {i < platform.steps.length - 1 || i < activeStep ? "✓" : i + 1}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{s.instruction}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex-1 text-center">
            <p className="text-xs text-gray-600">{platform.name}</p>
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Done ✓
            </button>
          ) : (
            <button
              onClick={() => setActiveStep((p) => Math.min(platform.steps.length - 1, p + 1))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${platform.color} text-white text-sm font-semibold transition-all active:scale-95`}
            >
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}