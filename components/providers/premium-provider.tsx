"use client";

import React from "react";

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          background-color: #0a0a0b;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0b; }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
          border: 2px solid #0a0a0b;
        }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        /* ── Body defaults ── */
        body {
          overflow-x: hidden;
          width: 100vw;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
        }

        /* ── Heading letter-spacing (Stripe does this) ── */
        h1, h2, h3, h4, h5, h6 {
          letter-spacing: -0.025em;
          text-wrap: balance;
        }

        /* ── Premium focus ring — replaces browser default ── */
        *:focus-visible {
          outline: 2px solid rgba(52, 211, 153, 0.6);
          outline-offset: 3px;
          border-radius: 4px;
        }
        *:focus:not(:focus-visible) {
          outline: none;
        }

        /* ── Link micro-interaction ── */
        a {
          transition: color 0.15s ease, opacity 0.15s ease;
        }
        a:hover {
          opacity: 0.85;
        }

        /* ── Prevent layout shift on interactive elements ── */
        button, [role="button"] {
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.1s ease;
        }
        button:active, [role="button"]:active {
          transform: scale(0.98);
        }

        /* ── Subtle image rendering ── */
        img {
          -webkit-user-drag: none;
          user-select: none;
        }
      `}</style>
      {children}
    </>
  );
}