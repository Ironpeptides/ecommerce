"use client";

import { useEffect, useState, useCallback } from "react";
import { X, AlertTriangle, CreditCard, Smartphone, ShieldAlert, PlayCircle } from "lucide-react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
// Replace this with your Google Drive share link or a direct video URL.
// Google Drive links will open in a new tab; direct video URLs will play inline.
const MOONPAY_VIDEO_URL = "https://drive.google.com/file/d/YOUR_FILE_ID/view";
const IS_GOOGLE_DRIVE_LINK = MOONPAY_VIDEO_URL.includes("drive.google.com");
// ───────────────────────────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  title: string;
  children: React.ReactNode;
}

const Section = ({ icon, accentColor, borderColor, title, children }: SectionProps) => (
  <div className={`flex gap-3.5 p-4 rounded-2xl bg-slate-800/50 border ${borderColor}`}>
    <div className={`p-2.5 rounded-xl ${accentColor} shrink-0 self-start`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <div className="text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  </div>
);

const MoonpayWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);

  const close = useCallback((dismissed = false) => {
    setIsOpen(false);
    if (dismissed) {
      sessionStorage.setItem("moonpay_warning_seen", "dismissed");
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("moonpay_warning_seen") === "dismissed") return;

    const timer = setTimeout(() => setIsOpen(true), 1000);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => close(true)}
    >
      <div
        className="
          relative w-full sm:max-w-xl
          bg-slate-900 border border-slate-800
          rounded-t-3xl sm:rounded-3xl
          shadow-[0_-8px_60px_-8px_rgba(0,0,0,0.7)] sm:shadow-[0_0_80px_-16px_rgba(0,0,0,0.6)]
          animate-in slide-in-from-bottom duration-500 sm:zoom-in-95
          max-h-[92dvh] overflow-y-auto
          scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Mobile top bar ── */}
        <div className="flex sm:hidden items-center justify-between px-5 pt-4 pb-3 bg-slate-900 sticky top-0 z-20 border-b border-slate-800/60">
          <div className="w-10 h-1 rounded-full bg-slate-700 absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest pt-1">
            Important Information
          </span>
          <button
            onClick={() => close(true)}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 sm:p-7">
          {/* Desktop close */}
          <button
            onClick={() => close(true)}
            aria-label="Close"
            className="hidden sm:flex absolute right-4 top-4 items-center justify-center p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X size={19} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <AlertTriangle className="text-amber-400" size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">
                Please read before payment
              </p>
              <h2 className="text-lg font-bold text-white leading-tight">
                Important Information
              </h2>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-3">

            {/* 1. Payment options + CashApp/Zelle/Venmo note */}
            <Section
              icon={<Smartphone className="text-sky-400" size={18} />}
              accentColor="bg-sky-500/10 border-sky-500/20"
              borderColor="border-sky-500/15"
              title="Payment Options"
            >
              We accept <span className="text-white font-medium">CashApp, Zelle, Venmo, crypto</span>, and{" "}
              <span className="text-white font-medium">card payments</span>. When paying via
              CashApp, Zelle, or Venmo, please{" "}
              <span className="text-amber-400 font-medium">
                do not reference peptides or specific product names
              </span>{" "}
              — use a neutral description such as{" "}
              <span className="text-white font-medium">"research materials"</span> to keep your
              transaction compliant with those platforms&apos; terms. Click "I have Paid" button after payment so we get notified and process your order.
            </Section>

            {/* 2. MoonPay / card KYC note */}
            <Section
              icon={<CreditCard className="text-violet-400" size={18} />}
              accentColor="bg-violet-500/10 border-violet-500/20"
              borderColor="border-violet-500/15"
              title="Card Payments & MoonPay"
            >
              <p>
                If you choose to pay by card, <span className="text-white font-medium">MoonPay</span> is
                the default processor. MoonPay requires identity verification before checkout —
                this includes a <span className="text-white font-medium">photo ID, selfie, and proof of address</span>.
              </p>
              <p className="mt-2">
                To skip verification entirely, select{" "}
                <span className="text-white font-medium">a different card option</span> at checkout —
                these do not require document uploads.
              </p>

              {/* Video block */}
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                <button
                  onClick={() => {
                    if (IS_GOOGLE_DRIVE_LINK) {
                      window.open(MOONPAY_VIDEO_URL, "_blank", "noopener,noreferrer");
                    } else {
                      setVideoExpanded((v) => !v);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left group"
                >
                  <PlayCircle
                    size={20}
                    className="text-violet-400 group-hover:text-violet-300 shrink-0 transition-colors"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">
                      Watch: How to use Card option to avoid MoonPay KYC
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {IS_GOOGLE_DRIVE_LINK
                        ? "Opens in a new tab →"
                        : videoExpanded
                        ? "Click to collapse"
                        : "Click to expand"}
                    </p>
                  </div>
                </button>

                {/* Inline video (non-Drive links only) */}
                {!IS_GOOGLE_DRIVE_LINK && videoExpanded && (
                  <div className="aspect-video w-full">
                    <video
                      src={MOONPAY_VIDEO_URL}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </Section>

            {/* 3. Chargebacks */}
            <Section
              icon={<ShieldAlert className="text-rose-400" size={18} />}
              accentColor="bg-rose-500/10 border-rose-500/20"
              borderColor="border-rose-500/15"
              title="Chargebacks & Disputes"
            >
              We take chargebacks seriously. If you experience any issue with your order, please{" "}
              <span className="text-white font-medium">contact us first</span> — we&apos;re happy to
              resolve any problem quickly and directly. Initiating a chargeback without reaching
              out to us first may result in account restrictions.
            </Section>
          </div>

          {/* CTA */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={() => close(true)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              I Understand — Continue to Checkout
            </button>
            <button
              onClick={() => close(true)}
              className="w-full text-[10px] text-slate-600 hover:text-slate-400 transition-colors font-semibold uppercase tracking-widest py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonpayWarningModal;