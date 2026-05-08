"use client";

import { Truck, ShieldCheck, Lock, Headset } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "FREE SHIPPING",
    subtitle: "On Orders $200+",
  },
  {
    icon: ShieldCheck,
    title: "99.8% PURITY, MADE IN USA",
    subtitle: "Third-Party Lab Tested",
  },
  {
    icon: Lock,
    title: "SECURE PAYMENT",
    subtitle: "SSL Encrypted Checkout",
  },
  {
    icon: Headset,
    title: "24/7 SUPPORT",
    subtitle: "Expert Research Assistance",
  },
];

export default function TrustBar() {
  return (
    <section className="w-full mt-5 bg-[#0f0f12] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 lg:justify-center group transition-all"
            >
              {/* Icon Container */}
              <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/40 transition-colors">
                <item.icon className="h-6 w-6 text-emerald-500" strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-white tracking-wider">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {item.subtitle}
                </p>
              </div>
              
              {/* Vertical Divider for Desktop (Optional) */}
              {index !== trustItems.length - 1 && (
                <div className="hidden lg:block h-8 w-px bg-white/5 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}