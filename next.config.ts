import type { NextConfig } from "next";

// We use require for the PWA plugin to avoid type mismatch issues with some versions
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // This adds your rules on top of the default ones
  extendDefaultRuntimeCaching: true, 
  runtimeCaching: [
    {
      // Match all admin API routes
      urlPattern: /\/api\/admin\/.*$/,
      handler: 'NetworkOnly', // Dashboards must always have real-time data
    },
    {
      // Default fallback for everything else
      urlPattern: /.*/,
      handler: 'NetworkFirst', // Try network, then fallback to cache
    }
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPWA(nextConfig);