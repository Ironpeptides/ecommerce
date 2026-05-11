import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // ── Admin API → never cache ──────────────────────────────────────
    {
      urlPattern: /\/api\/admin\/.*$/,
      handler: "NetworkOnly",
    },

    // ── UploadThing file CDN → cache aggressively (immutable assets) ─
    {
      urlPattern: /^https:\/\/utfs\.io\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "uploadthing-assets",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ── UploadThing API calls → always fresh ─────────────────────────
    {
      urlPattern: /^https:\/\/uploadthing\.com\/api\/.*/i,
      handler: "NetworkOnly",
    },

    // ── Next.js static chunks → stale-while-revalidate ───────────────
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },

    // ── Next.js image optimisation endpoint ──────────────────────────
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },

    // ── Public folder static assets (fonts, icons, images, etc.) ─────
    {
      urlPattern: /\/.*\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "public-assets",
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ── Other API routes → network first, short cache fallback ───────
    {
      urlPattern: /\/api\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-responses",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ── HTML pages → network first ────────────────────────────────────
    {
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === "document",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ── Everything else → network first ──────────────────────────────
    {
      urlPattern: /.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "fallback",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

// Define nextConfig as a standard object without wrapping it here
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "haelolabs.com",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "lodash",
      "@radix-ui/react-icons",
      "react-icons",
      "@react-email/components",
    ],
  },
};

// Apply both wrappers here in a single chain
export default withBundleAnalyzer(withPWA(nextConfig));

//export default nextConfig;