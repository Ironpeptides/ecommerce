// @/components/VercelAnalytics.tsx
"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function VercelAnalytics() {
  // Returns the native components safely on the client side
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}