import type { Metadata, Viewport } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from "next/script";

// 1. Optimize Font: Use variable to prevent layout shift and reduce JS string heavy-lifting
const rethink = Rethink_Sans({ 
  subsets: ["latin"], 
  display: "swap",
  variable: '--font-rethink', 
});

export const metadata: Metadata = {
  metadataBase: new URL('https://haelo.com'),
  title: "Haelolabs",
  description: "Premium-grade research peptides engineered for precision.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Haelolabs",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Note: Set to 5 if accessibility is a priority over "App-like" feel
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={rethink.variable}>
      <head>
        {/* Only preload the Hero Image. DO NOT preload the video (it kills TBT) */}
        <link rel="preload" as="image" href="/images/hero-poster.webp" fetchPriority="high" />
      </head>
      <body className="antialiased font-sans"> 
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Sonner is more performant than hot-toast for TBT */}
          <Toaster richColors position="top-center" />
          
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>

        {/* Third-party scripts moved to bottom, loading after hydration */}
        <Analytics />
        <SpeedInsights />
        
        <Script
          src="https://vilyo-customer-care-support.vercel.app/widget.js"
          data-id="229453f0-f0c2-4ef8-95ed-b4d67be6a955"
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}