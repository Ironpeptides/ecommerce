"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Copy } from "lucide-react";

interface GrandOpeningBannerProps {
  message?: string; // We'll override this in the layout, but keep prop for flexibility
  ctaLabel?: string;
  ctaHref?: string;
  dismissible?: boolean;
  storageKey?: string;
}

export default function GrandOpeningBanner({
  message, // We won't use the default message now; we'll hardcode the structured layout
  ctaLabel = "Shop now",
  ctaHref = "/products",
  dismissible = true,
  storageKey = "grand-opening-banner-dismissed",
}: GrandOpeningBannerProps) {
  const [dismissed, setDismissed] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!dismissible) {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [dismissible, storageKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {}
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("LAUNCH20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full border-b border-white/5 bg-gradient-to-b from-[#0f0f12] to-[#0a0a0b]">
      {/* subtle top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        {/* LEFT SIDE: Badge + Highlighted Discount Code */}
        <div className="flex flex-1 items-center gap-3 min-w-0 flex-wrap">
          {/* Badge */}
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            Grand Opening Sale
          </span>

          {/* 
            ✨ THE MAGIC: Instead of a flat sentence, we structure the text
            so "LAUNCH20" is visually isolated like an image banner would do.
          */}
          <p className="flex items-center gap-2 text-sm font-medium text-slate-200 sm:text-base">
            <span>Use code</span>
            
            {/* HIGHLIGHTED COUPON PILL - This is your "banner image" replacement */}
            <span className="relative inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 font-mono text-sm font-bold tracking-wider text-amber-300 shadow-sm shadow-amber-900/20">
              LAUNCH20
              <button
                onClick={handleCopyCode}
                className="rounded p-0.5 text-amber-400/60 transition-colors hover:bg-amber-400/20 hover:text-amber-200"
                aria-label="Copy discount code"
              >
                <Copy className="h-3 w-3" />
              </button>
              {/* "Copied!" tooltip popup */}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[10px] font-sans font-medium text-white shadow-lg">
                  Copied!
                </span>
              )}
            </span>

            <span>for 20% off site-wide!</span>
          </p>
        </div>

        {/* RIGHT SIDE: CTA + Dismiss */}
        <div className="flex shrink-0 items-center gap-2">
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              {ctaLabel}
            </Link>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss grand opening banner"
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}