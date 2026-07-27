"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Copy, Scissors } from "lucide-react";

interface GrandOpeningBannerProps {
  ctaLabel?: string;
  ctaHref?: string;
  dismissible?: boolean;
  storageKey?: string;
}

export default function GrandOpeningBanner({
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
    // NOTE: top-12 assumes the announcement marquee above it stays h-12 (48px).
    // If that bar's height ever changes, update this offset to match.
    <div className=" top-12 z-50 w-full">
      <div className="relative bg-gradient-to-r from-[#7f1414] via-[#a51c1c] to-[#7f1414] shadow-lg shadow-black/40">
        {/* ceremonial ribbon edge — top */}
        <div
          aria-hidden="true"
          className="h-[5px] w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #f5c453 0 8px, #7f1414 8px 16px)",
          }}
        />

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-4 sm:justify-between sm:px-6 sm:py-5">
          {/* LEFT: Badge + message */}
          <div className="flex flex-1 flex-wrap items-center justify-center gap-3 min-w-0 sm:justify-start">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/50 bg-black/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-200 sm:text-sm">
              <Scissors className="h-3.5 w-3.5" />
              Grand Opening Sale
            </span>

            <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-white sm:text-base">
              <span>Use code</span>

              <span className="relative inline-flex items-center gap-1.5 rounded-md border-2 border-amber-300 bg-[#5c0f0f] px-3 py-1 font-mono text-sm font-bold tracking-wider text-amber-200 sm:text-base">
                LAUNCH20
                <button
                  onClick={handleCopyCode}
                  className="rounded p-0.5 text-amber-300/70 transition-colors hover:bg-amber-300/20 hover:text-amber-100"
                  aria-label="Copy discount code"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-sans font-medium text-white shadow-lg">
                    Copied!
                  </span>
                )}
              </span>

              <span>for 20% off site-wide!</span>
            </p>
          </div>

          {/* RIGHT: CTA + dismiss */}
          <div className="flex shrink-0 items-center gap-3">
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-[#5c0f0f] shadow-md shadow-black/30 transition hover:bg-amber-200 sm:text-base"
              >
                {ctaLabel}
              </Link>
            )}

            {dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss grand opening banner"
                className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ceremonial ribbon edge — bottom */}
        <div
          aria-hidden="true"
          className="h-[5px] w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #f5c453 0 8px, #7f1414 8px 16px)",
          }}
        />
      </div>
    </div>
  );
}