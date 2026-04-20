"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Zap, Shield, Truck, Star, Crown, Gift } from "lucide-react";
import { useStore } from "@/store/index";

interface SubscriptionModalProps {
  isSubscribed?: boolean;
}

const SubscriptionModal = ({ isSubscribed = false }: SubscriptionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const router = useRouter();

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
      if (!hasInteracted) {
        setIsOpen(true);
        sessionStorage.setItem("subscription_modal_shown_at", Date.now().toString());
      }
    }, 15000);

    const handleUserInteraction = () => {
      setHasInteracted(true);
    };

    window.addEventListener("scroll", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isSubscribed, hasInteracted]);

  const close = (dismissed: boolean = false) => {
    setIsOpen(false);
    if (dismissed) {
      sessionStorage.setItem("subscription_modal_seen", "dismissed");
    }
  };

  const handleSubscribe = () => {
    close();
    router.push("/subscription");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={() => close(true)}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-[#121214] to-[#0a0a0b] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Badge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

        {/* Close button */}
        <button
          onClick={() => close(true)}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white z-10"
        >
          <X size={18} />
        </button>

        {/* Header with Crown */}
        <div className="relative pt-8 pb-6 px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 mb-4">
            <Crown size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Unlock Premium Benefits
          </h2>
          <p className="text-gray-400 text-sm">
            Get exclusive perks with our premium subscription
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">$39</span>
            <span className="text-gray-400">/month</span>
          </div>
          <p className="text-xs text-emerald-500 mt-1">Cancel anytime • No commitment</p>
        </div>

        {/* Fair Pricing & Ethics Statement */}
        <div className="px-6 mb-6">
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-sm text-emerald-300 leading-relaxed">
              We pride ourselves on pricing our products <span className="font-medium text-white">fairly and ethically</span>. 
              You’re getting the <span className="font-medium text-white">highest quality</span> for the <span className="font-medium text-white">lowest possible prices</span> — 
              we never gouge our customers.
            </p>
          </div>
        </div>

        {/* Free Vial Offer */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Gift size={22} className="text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">🎁 Subscribe Today & Get</p>
              <p className="text-emerald-400 text-sm font-medium">ONE FREE VIAL</p>
              <p className="text-xs text-gray-400 mt-0.5">as a welcome gift</p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <Zap size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-300">20% off all products</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <Truck size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-300">Free express shipping</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <Star size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-300">Early access to drops</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <Shield size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-300">Priority support</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 group"
            >
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              Subscribe Now - $39/month + Get 1 Free Vial
            </button>

            <button
              onClick={() => close(true)}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              No thanks, continue browsing
            </button>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-[10px] text-gray-600">
              Join 10,000+ satisfied premium members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;