"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Truck,
  Star,
  Crown,
  Gift,
  Mail,
  Percent,
} from "lucide-react";

interface SubscriptionModalProps {
  isSubscribed?: boolean;
}

const SubscriptionModal = ({ isSubscribed = false }: SubscriptionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const close = useCallback((dismissed = false) => {
    setIsOpen(false);
    if (dismissed) {
      sessionStorage.setItem("subscription_modal_seen", "dismissed");
    }
  }, []);

  useEffect(() => {
    if (isSubscribed) return;

    const hasSeenModal = sessionStorage.getItem("subscription_modal_seen");
    const modalShownAt = sessionStorage.getItem("subscription_modal_shown_at");

    if (hasSeenModal === "dismissed") return;

    if (modalShownAt) {
      const daysSinceShown =
        (Date.now() - parseInt(modalShownAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 7) return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(
        "subscription_modal_shown_at",
        Date.now().toString()
      );
    }, 10000);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isSubscribed, close]);

  const handleSubscribe = () => {
    close();
    if (authStatus === "authenticated" && session) {
      router.push("/dashboard/billing");
    } else {
      router.push("/login?redirect=/dashboard/billing");
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => close(true), 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => close(true)}
    >
      {/* Sheet-style on mobile (slides up), centered dialog on desktop */}
      <div
        className="
          relative w-full sm:max-w-4xl
          bg-slate-900 border border-slate-800
          rounded-t-3xl sm:rounded-3xl
          overflow-hidden
          shadow-[0_-8px_60px_-8px_rgba(0,0,0,0.6)] sm:shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)]
          animate-in slide-in-from-bottom duration-500 sm:zoom-in-95
          flex flex-col md:flex-row
          max-h-[92dvh] sm:max-h-none
          overflow-y-auto sm:overflow-visible
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── ALWAYS-VISIBLE TOP DISMISS BAR (mobile only) ── */}
        <div className="flex md:hidden items-center justify-between px-5 pt-4 pb-2 bg-slate-900 sticky top-0 z-20 border-b border-slate-800/60">
          {/* Drag handle hint */}
          <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest pt-1">
            Membership
          </span>
          <button
            onClick={() => close(true)}
            aria-label="Close modal"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── LEFT COLUMN: Brand/Promo (desktop sidebar, horizontal strip on mobile) ── */}
        <div className="md:w-[42%] bg-gradient-to-br from-emerald-600/20 via-slate-900/90 to-slate-900 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-6">
              <Star size={12} fill="currentColor" />
              Member Benefits
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 md:mb-4">
              Pioneering the Future of{" "}
              <span className="text-emerald-500">Peptide Science</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 md:mb-6 hidden sm:block">
              "We believe in fair, ethical pricing. Premium quality without the
              markup."
            </p>

            {/* Value cards: side-by-side on mobile, stacked on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <Gift className="text-emerald-500 shrink-0" size={20} />
                <div>
                  <p className="text-white text-sm font-bold">+1 Free Vial/mo</p>
                  <p className="text-slate-400 text-xs hidden sm:block">
                    Included every month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <Percent className="text-emerald-500 shrink-0" size={20} />
                <div>
                  <p className="text-white text-sm font-bold">20% Flat Discount</p>
                  <p className="text-slate-400 text-xs hidden sm:block">
                    On every purchase
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex pt-6 mt-6 border-t border-slate-800/50 items-center gap-2 text-slate-500">
            <Shield size={14} className="text-emerald-500" />
            <span className="text-[10px] uppercase font-bold tracking-widest">
              99% Purity Guaranteed
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive CTA ── */}
        <div className="md:w-[58%] p-6 md:p-12 relative bg-slate-900 flex flex-col justify-center">
          {/* Desktop-only close button (stays top-right on large screens) */}
          <button
            onClick={() => close(true)}
            aria-label="Close modal"
            className="hidden md:flex absolute right-6 top-6 items-center justify-center p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all z-10 active:scale-95"
          >
            <X size={20} />
          </button>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Crown size={22} className="text-emerald-500" />
                Premium Membership
              </h3>
              <p className="text-slate-500 text-sm mt-1.5">
                Unlock exclusive perks and faster delivery.
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5 md:mb-6">
              <span className="text-4xl font-black text-white">$39</span>
              <span className="text-slate-500 font-medium">/month</span>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-6 md:mb-8">
              {[
                { icon: Truck, label: "+1 Free vial/month" },
                { icon: Star, label: "20% off every order" },
                { icon: Shield, label: "Express Shipping" },
                { icon: Zap, label: "Early Access" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <item.icon size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleSubscribe}
              className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
            >
              {authStatus === "authenticated" ? "Go to Billing" : "Subscribe Now"}
              <Sparkles size={18} className="group-hover:animate-pulse" />
            </button>

            {/* Divider */}
            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                <span className="bg-slate-900 px-4 text-slate-500 font-bold">
                  Or Join Newsletter
                </span>
              </div>
            </div>

            {/* Newsletter form */}
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <div className="group relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                  size={17}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-28 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {status === "loading"
                    ? "..."
                    : status === "success"
                    ? "✓ Done!"
                    : "Join Free"}
                </button>
              </div>
            </form>

            {/* Soft dismiss */}
            <button
              onClick={() => close(true)}
              className="w-full mt-5 text-[11px] text-slate-600 hover:text-slate-400 transition-colors font-semibold uppercase tracking-widest py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;