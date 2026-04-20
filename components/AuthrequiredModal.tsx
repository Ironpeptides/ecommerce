"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, LogIn, UserPlus, ShoppingBag, Heart } from "lucide-react";
import { useStore } from "@/store/index"


// It reads `authRequired` from the store and shows itself automatically
// whenever an unauthenticated user tries to add to cart or wishlist.

const AuthRequiredModal = () => {
  const authRequired = useStore((state: any) => state.authRequired);
  const setAuthRequired = useStore((state: any) => state.setAuthRequired);
  const router = useRouter();

  if (!authRequired) return null;

  const close = () => setAuthRequired(false);

  const goTo = (path: string) => {
    close();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag size={22} className="text-emerald-400" />
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Heart size={22} className="text-red-400" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white text-center mb-2">
            Sign in to continue
          </h2>
          <p className="text-sm text-gray-400 text-center leading-relaxed">
            You need an account to add products to your cart or wishlist. It only takes a moment.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => goTo("/login")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
          >
            <LogIn size={16} />
            Sign In
          </button>

          <button
            onClick={() => goTo("/register")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Create an Account
          </button>

          <button
            onClick={close}
            className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;