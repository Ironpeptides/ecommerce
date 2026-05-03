"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Coins, Loader2, ExternalLink, Zap, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// 1 credit = $1.00  →  the number users see always matches dollars exactly.
// If an order costs $130, they need 130 credits. Simple.
// ─────────────────────────────────────────────────────────────────────────────
export const CREDITS_PER_DOLLAR = 1;

// Minimum top-up in dollars
const MIN_TOPUP = 5;
// Maximum top-up in dollars (LemonSqueezy limit)
const MAX_TOPUP = 999;

interface TopUpModalProps {
  onClose: () => void;
  currentBalance: number;   // in credits (= dollars)
  neededCredits: number;    // credits needed to complete the order
  userEmail: string;
  onBalanceUpdated: (newBalance: number) => void;
}

const TopUpModal = ({
  onClose,
  currentBalance,
  neededCredits,
  userEmail,
  onBalanceUpdated,
}: TopUpModalProps) => {
  // shortfall in dollars (since 1 credit = $1)
  const shortfall = Math.max(neededCredits - currentBalance, 0);

  // Default the input to the shortfall, rounded up to the nearest $5, min $5
  const defaultAmount = Math.max(MIN_TOPUP, Math.ceil(shortfall / 5) * 5);

  const [inputMode, setInputMode] = useState<"dollars" | "credits">("dollars");
  const [rawValue, setRawValue] = useState<string>(String(defaultAmount));
  const [loading, setLoading] = useState(false);

  // Derived values — always kept in sync
  const dollarAmount = inputMode === "dollars"
    ? parseFloat(rawValue) || 0
    : (parseFloat(rawValue) || 0) / CREDITS_PER_DOLLAR;

  const creditAmount = inputMode === "credits"
    ? parseFloat(rawValue) || 0
    : (parseFloat(rawValue) || 0) * CREDITS_PER_DOLLAR;

  const isValid =
    dollarAmount >= MIN_TOPUP &&
    dollarAmount <= MAX_TOPUP &&
    !isNaN(dollarAmount);

  const validationMessage = (() => {
    if (!rawValue || parseFloat(rawValue) === 0) return null;
    if (dollarAmount < MIN_TOPUP) return `Minimum top-up is $${MIN_TOPUP}`;
    if (dollarAmount > MAX_TOPUP) return `Maximum top-up is $${MAX_TOPUP}`;
    return null;
  })();

  // Switch input mode and convert the current value
  const handleModeSwitch = (mode: "dollars" | "credits") => {
    if (mode === inputMode) return;
    const current = parseFloat(rawValue) || 0;
    if (inputMode === "dollars") {
      // switching to credits
      setRawValue(String(Math.round(current * CREDITS_PER_DOLLAR)));
    } else {
      // switching to dollars
      setRawValue(String((current / CREDITS_PER_DOLLAR).toFixed(2)));
    }
    setInputMode(mode);
  };

  const handleProceed = async () => {
    if (!isValid) {
      toast.error(validationMessage || "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: dollarAmount,       // dollars
          credits: creditAmount,      // credits to award after payment
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");

      // Open LemonSqueezy in a new tab — this page stays alive
      const popup = window.open(
        data.checkoutUrl,
        "_blank",
        "width=520,height=700,scrollbars=yes"
      );

      // Poll for balance update every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const balRes = await fetch("/api/wallet/balance");
          const balData = await balRes.json();
          if (balData.balance > currentBalance) {
            clearInterval(pollInterval);
            clearInterval(popupWatcher);
            onBalanceUpdated(balData.balance);
            toast.success(`${Math.round(balData.balance - currentBalance)} credits added! 🎉`);
            onClose();
          }
        } catch {
          // Silently retry
        }
      }, 2000);

      // Stop if popup closes without payment
      const popupWatcher = setInterval(() => {
        if (popup?.closed) {
          clearInterval(popupWatcher);
          clearInterval(pollInterval);
          setLoading(false);
        }
      }, 1000);

      // Hard stop after 15 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        clearInterval(popupWatcher);
        setLoading(false);
      }, 15 * 60 * 1000);

    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  // Quick-select buttons
  const quickAmounts = [10, 25, 50, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#141414] rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <Coins className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Top Up Credits</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Balance:{" "}
                <span className="text-slate-300 font-mono font-semibold">
                  {currentBalance.toLocaleString()} credits
                </span>
                <span className="text-slate-600 mx-1">·</span>
                <span className="text-slate-400 font-mono">${currentBalance.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Shortfall notice */}
          {shortfall > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">
                You need{" "}
                <span className="font-bold font-mono">
                  {shortfall} more credits (${shortfall.toFixed(2)})
                </span>{" "}
                to complete this order.
              </p>
            </div>
          )}

          {/* Input mode toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Enter amount
              </label>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => handleModeSwitch("dollars")}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${
                    inputMode === "dollars"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  $ Dollars
                </button>
                <button
                  onClick={() => handleModeSwitch("credits")}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-md transition-all ${
                    inputMode === "credits"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Credits
                </button>
              </div>
            </div>

            {/* Main input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {inputMode === "dollars" ? (
                  <DollarSign className="w-4 h-4 text-slate-500" />
                ) : (
                  <Coins className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <input
                type="number"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value)}
                min={inputMode === "dollars" ? MIN_TOPUP : MIN_TOPUP * CREDITS_PER_DOLLAR}
                max={inputMode === "dollars" ? MAX_TOPUP : MAX_TOPUP * CREDITS_PER_DOLLAR}
                placeholder={inputMode === "dollars" ? "0.00" : "0"}
                className="w-full bg-slate-900 border border-slate-700 focus:border-violet-500 rounded-xl pl-10 pr-4 py-3.5 text-white text-lg font-mono font-semibold outline-none transition-colors placeholder:text-slate-700"
              />
            </div>

            {/* Validation message */}
            {validationMessage && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">{validationMessage}</p>
            )}
          </div>

          {/* Live conversion display */}
          {parseFloat(rawValue) > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-center flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">You pay</p>
                <p className="text-base font-bold font-mono text-white">
                  ${dollarAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-slate-700 font-bold text-lg px-3">→</div>
              <div className="text-center flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">You receive</p>
                <p className="text-base font-bold font-mono text-violet-300">
                  {Math.round(creditAmount).toLocaleString()} credits
                </p>
              </div>
            </div>
          )}

          {/* Quick-select amounts */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Quick select</p>
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setInputMode("dollars");
                    setRawValue(String(amount));
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    inputMode === "dollars" && parseFloat(rawValue) === amount
                      ? "border-blue-500/60 bg-blue-500/15 text-blue-300"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  ${amount}
                </button>
              ))}
              {shortfall > 0 && !quickAmounts.includes(Math.ceil(shortfall / 5) * 5) && (
                <button
                  onClick={() => {
                    setInputMode("dollars");
                    setRawValue(String(Math.ceil(shortfall / 5) * 5));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-semibold hover:bg-amber-500/15 transition-all"
                >
                  ${Math.ceil(shortfall / 5) * 5} ⚡
                </button>
              )}
            </div>
          </div>

          {/* Proceed button */}
          <button
            onClick={handleProceed}
            disabled={!isValid || loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-150"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for payment confirmation…</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>
                  Pay ${isValid ? dollarAmount.toFixed(2) : "–"} →{" "}
                  {isValid ? Math.round(creditAmount).toLocaleString() : "–"} credits
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-600">
            Secure payment · Credits are non-refundable · 1 credit = $1.00
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;