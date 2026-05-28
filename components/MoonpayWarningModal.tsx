"use client";

import { useEffect, useState, useCallback } from "react";
import { X, AlertTriangle } from "lucide-react";

const MoonpayWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback((dismissed = false) => {
    setIsOpen(false);
    if (dismissed) {
      sessionStorage.setItem("moonpay_warning_seen", "dismissed");
    }
  }, []);

  useEffect(() => {
    // Skip if already dismissed in this session
    if (sessionStorage.getItem("moonpay_warning_seen") === "dismissed") return;

    // Show the modal after a short delay (e.g., 1 second)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    // Close on Escape key
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
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => close(true)}
    >
      {/* Modal container – slides up on mobile, centered on desktop */}
      <div
        className="
          relative w-full sm:max-w-lg
          bg-slate-900 border border-slate-800
          rounded-t-3xl sm:rounded-3xl
          overflow-hidden
          shadow-[0_-8px_60px_-8px_rgba(0,0,0,0.6)] sm:shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)]
          animate-in slide-in-from-bottom duration-500 sm:zoom-in-95
          max-h-[92dvh] sm:max-h-none
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss handle (mobile) */}
        <div className="flex sm:hidden items-center justify-between px-5 pt-4 pb-2 bg-slate-900 sticky top-0 z-20 border-b border-slate-800/60">
          <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest pt-1">
            Important
          </span>
          <button
            onClick={() => close(true)}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Desktop close button */}
          <button
            onClick={() => close(true)}
            aria-label="Close"
            className="hidden sm:flex absolute right-4 top-4 items-center justify-center p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
              <AlertTriangle className="text-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Hi,
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Please note that before selecting Moonpay at checkout, you will need to complete identity verification, which requires uploading a photo of your ID, selfie, and address proof
              </p>
              <p className="text-slate-400 text-sm mt-3">
                You can avoid this step by choosing any other card payment option.
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => close(true)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all active:scale-[0.98]"
            >
              I Understand
            </button>
            <button
              onClick={() => close(true)}
              className="w-full text-[11px] text-slate-600 hover:text-slate-400 transition-colors font-semibold uppercase tracking-widest py-1"
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