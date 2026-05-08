// components/AgeGateModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgeGateModal() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const confirmed = localStorage.getItem("age_verified");
    if (!confirmed) {
      setShow(true);
      // Prevent body scroll while modal is open
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem("age_verified", "true");
    setShow(false);
    document.body.style.overflow = "";
  };

  const handleNo = () => {
    // Redirect to a safe place (e.g. Google) or show a message
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] backdrop-blur-lg bg-black/80 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Age Verification</h2>
        <p className="text-gray-300 mb-6">
          You must be 18 years or older to enter this site.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleYes}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
          >
            I am 18+
          </button>
          <button
            onClick={handleNo}
            className="px-8 py-3 bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 font-semibold rounded-xl transition-colors"
          >
            I am under 18
          </button>
        </div>
      </div>
    </div>
  );
}