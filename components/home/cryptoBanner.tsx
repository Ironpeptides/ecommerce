"use client";
import { useState } from "react";
import Link from "next/link";
import { Bitcoin, X } from "lucide-react";

export default function CryptoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="relative bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
        <Bitcoin size={16} className="text-amber-400 shrink-0" />
        <p className="text-sm text-amber-200/90">
          <span className="font-semibold text-amber-300">Need help paying with crypto?</span>{" "}
          <Link href="/crypto-guide" className="underline underline-offset-2 text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Get 15% off when you do →
          </Link>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}