"use client";


import React, { useState } from "react";
import { X, Check } from "lucide-react";
import type { ProductOption } from "./product-card";

interface OptionsModalProps {
  product: any;
  options: ProductOption[];
  onClose: () => void;
  onConfirm: (selected: ProductOption) => void;
}

const OptionsModal = ({ product, options, onClose, onConfirm }: OptionsModalProps) => {
  const [selected, setSelected] = useState<ProductOption | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Select product variant"
    >
      <div className="relative w-full max-w-sm mx-4 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-semibold text-gray-100 line-clamp-1">{product?.name}</h2>
            <p className="text-xs text-emerald-500 mt-0.5">{product?.category?.title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-bold">
            Choose a variant
          </p>
          {options.map((opt) => {
            const isSelected = selected?.value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt)}
                aria-pressed={isSelected}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span>{opt.label}</span>
                {opt.price !== undefined && (
                  <span className={`text-xs font-bold ${isSelected ? "text-emerald-400" : "text-gray-500"}`}>
                    ${opt.price.toFixed(2)}
                  </span>
                )}
                {isSelected && <Check size={14} className="text-emerald-500 ml-2 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsModal;