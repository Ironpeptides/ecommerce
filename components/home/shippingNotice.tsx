// No "use client" needed — pure display
import { Package, Clock } from "lucide-react";

export default function ShippingNotice() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-2.5 px-4 bg-white/[0.03] border-b border-white/5 text-[11px] text-gray-400">
      <span className="flex items-center gap-1.5">
        <Package size={12} className="text-blue-400" />
        <span>
          <span className="text-white font-medium">🇺🇸 USA domestic shipping</span>
          {" "}— orders fulfilled within 1–2 business days
        </span>
      </span>
      <span className="hidden sm:block text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <Clock size={12} className="text-purple-400" />
        <span>
          <span className="text-purple-300 font-medium">🇪🇺 EU shipping coming soon</span>
          {" "}— estimated 3–5 day delivery
        </span>
      </span>
    </div>
  );
}