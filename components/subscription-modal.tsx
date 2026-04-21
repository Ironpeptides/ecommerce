"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Zap, Shield, Truck, Star, Crown, Gift, Mail, ArrowRight } from "lucide-react";

interface SubscriptionModalProps {
  isSubscribed?: boolean;
}

const SubscriptionModal = ({ isSubscribed = false }: SubscriptionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const router = useRouter();

  const close = useCallback((dismissed: boolean = false) => {
    setIsOpen(false);
    if (dismissed) {
      sessionStorage.setItem("subscription_modal_seen", "dismissed");
    }
  }, []);

  useEffect(() => {
    if (isSubscribed) return;

    const hasSeenModal = sessionStorage.getItem("subscription_modal_seen");
    const modalShownAt = sessionStorage.getItem("subscription_modal_shown_at");

    if (modalShownAt) {
      const daysSinceShown = (Date.now() - parseInt(modalShownAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 7) return;
    }

    if (hasSeenModal === "dismissed") return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("subscription_modal_shown_at", Date.now().toString());
    }, 10000); // 10 seconds for better engagement

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isSubscribed, close]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => close(true), 2000);
    }, 1500);
  };

  const handleSubscribe = () => {
    close();
    router.push("/subscription");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => close(true)}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

        {/* Close button */}
        <button
          onClick={() => close(true)}
          className="absolute right-4 top-4 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="pt-10 pb-6 px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Crown size={24} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Premium Membership
              </h2>
              <p className="text-slate-400 text-sm">
                Unlock exclusive perks and faster delivery.
              </p>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
                  Special Offer
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$39</span>
                  <span className="text-slate-500 text-sm font-medium">/month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
                  <Gift size={14} className="text-emerald-400" />
                  <span>+1 Free Vial</span>
                </div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: "20% Discount" },
                { icon: Truck, label: "Express Ship" },
                { icon: Star, label: "Early Access" },
                { icon: Shield, label: "VIP Support" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <item.icon size={14} className="text-emerald-500" />
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ethics Statement */}
          <p className="text-xs text-slate-500 leading-relaxed text-center italic mb-6 px-4">
            "We believe in fair, ethical pricing. Premium quality without the markup."
          </p>

          {/* Subscription Action */}
          <button
            onClick={handleSubscribe}
            className="w-full group relative flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
          >
            Get Started Now
            <Sparkles size={16} className="group-hover:animate-pulse" />
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or join newsletter</span>
            </div>
          </div>

          {/* Newsletter Input */}
          <form onSubmit={handleNewsletterSubmit} className="relative">
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-11 pr-32 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "..." : status === "success" ? "Subscribed!" : "Join Free"}
              </button>
            </div>
          </form>

          <button
            onClick={() => close(true)}
            className="w-full mt-6 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors font-medium"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;