"use client"
import React, { useState } from "react";
import { Check } from "lucide-react";
import CountUp from "react-countup";

// Mock plans data - replace with your actual plans
const plans = [
  {
    id: 0,
    title: "Starter",
    priceMonthly: 19,
    priceYearly: 15,
    caption: "Perfect for small businesses",
    features: [
      "1 inventory store",
      "Up to 2 users",
      "Basic reporting",
      "Email support",
      "5GB storage"
    ],
    icon: "🚀"
  },
  {
    id: 1,
    title: "Professional",
    priceMonthly: 49,
    priceYearly: 39,
    caption: "For growing teams",
    features: [
      "5 inventory stores",
      "Up to 10 users",
      "Advanced analytics",
      "Priority support",
      "50GB storage",
      "API access"
    ],
    icon: "⭐"
  },
  {
    id: 2,
    title: "Enterprise",
    priceMonthly: 99,
    priceYearly: 79,
    caption: "For large organizations",
    features: [
      "Unlimited stores",
      "Unlimited users",
      "Custom integrations",
      "24/7 dedicated support",
      "Unlimited storage",
      "Advanced security"
    ],
    icon: "💎"
  }
];

const PricingCard = ({ theme = "light" }) => {
  const [monthly, setMonthly] = useState(false);
  const isDark = theme === "dark";

  return (
    <section id="pricing" className={`w-full ${isDark ? "bg-slate-900" : "bg-white"} py-16`}>
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className={`max-w-4xl relative mx-auto pb-20 pt-12 ${isDark ? "bg-slate-900/50" : "bg-white/50"}`}>
          <h3 className={`text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-8 ${isDark ? "text-white" : "text-slate-900"}`}>
            Flexible pricing for teams of all sizes
          </h3>
          
          {/* Toggle Switch */}
          <div className={`relative mx-auto flex w-[375px] max-w-full rounded-full border-2 p-1 ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-100"} backdrop-blur-sm`}>
            <button
              className={`relative z-10 flex-1 rounded-full py-3 px-6 text-sm font-semibold transition-colors duration-300 ${
                monthly 
                  ? isDark ? "text-slate-900" : "text-white"
                  : isDark ? "text-slate-400" : "text-slate-600"
              }`}
              onClick={() => setMonthly(true)}
            >
              Monthly
            </button>
            <button
              className={`relative z-10 flex-1 rounded-full py-3 px-6 text-sm font-semibold transition-colors duration-300 ${
                !monthly 
                  ? isDark ? "text-slate-900" : "text-white"
                  : isDark ? "text-slate-400" : "text-slate-600"
              }`}
              onClick={() => setMonthly(false)}
            >
              Annual
            </button>
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-transform duration-500 shadow-lg ${
                isDark
                  ? "bg-gradient-to-r from-amber-300 to-amber-400"
                  : "bg-gradient-to-r from-amber-500 to-amber-600"
              } ${!monthly && "translate-x-full"}`}
              style={{ left: '4px' }}
            />
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="relative z-2 -mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                index === 1
                  ? isDark 
                    ? "bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-amber-400/50 shadow-xl scale-105"
                    : "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-amber-500/50 shadow-xl scale-105"
                  : isDark
                    ? "bg-slate-800/50 border-2 border-slate-700"
                    : "bg-slate-50 border-2 border-slate-200"
              } backdrop-blur-sm hover:shadow-2xl`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    isDark
                      ? "bg-gradient-to-r from-amber-300 to-amber-400 text-slate-900"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                  }`}>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div className="flex justify-center mb-4">
                <span className="text-6xl">{plan.icon}</span>
              </div>

              {/* Plan Title */}
              <div className="text-center mb-6">
                <h4 className={`text-2xl font-bold mb-2 ${
                  index === 1
                    ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500"
                    : isDark ? "text-white" : "text-slate-900"
                }`}>
                  {plan.title}
                </h4>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-black tracking-tight ${
                    index === 1
                      ? isDark ? "text-amber-300" : "text-amber-600"
                      : isDark ? "text-white" : "text-slate-900"
                  }`}>
                     $<CountUp
                         start={plan.priceMonthly}
                         end={monthly ? plan.priceMonthly : plan.priceYearly}
                         duration={0.4}
                         useEasing={false}
                         preserveValue
                                          /> 
                        
                    
                  </span>
                  <span className={`text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    /month
                  </span>
                </div>
              </div>

              {/* Caption */}
              <p className={`text-center mb-8 pb-8 border-b ${
                isDark ? "text-slate-300 border-slate-700" : "text-slate-600 border-slate-200"
              }`}>
                {plan.caption}
              </p>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 1
                        ? isDark 
                          ? "bg-amber-300/20 text-amber-300"
                          : "bg-amber-500/20 text-amber-600"
                        : isDark
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-200 text-slate-600"
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <p className={`flex-1 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all duration-200 ${
                  index === 1
                    ? isDark
                      ? "bg-gradient-to-r from-amber-300 to-amber-400 text-slate-900 hover:from-amber-400 hover:to-amber-500 shadow-lg hover:shadow-xl"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
                    : isDark
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Get Started →
              </button>

              {/* Limited Offer */}
              {index === 1 && (
                <p className={`text-center mt-6 text-sm ${
                  isDark ? "text-amber-300" : "text-amber-600"
                }`}>
                  — Limited time offer —
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCard;