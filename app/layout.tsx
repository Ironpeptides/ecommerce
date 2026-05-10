import type { Metadata, Viewport } from "next"; // Added Viewport
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from "next/script";

const inter = Rethink_Sans({ 
  subsets: ["latin"], 
  display: "swap",
  preload: true,        
  variable: '--font-rethink',
});

// 1. Updated Metadata for PWA
export const metadata: Metadata = {
  metadataBase: new URL('https://haelo.fit'),
  title: "Haelolabs",
  description: "Premium-grade research peptides engineered for precision. We provide ultra-high purity peptides for advanced biological study. Engineered for accuracy, delivered with full analytical documentation.",
  manifest: "/manifest.json", // Path to your manifest file
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Haelolabs",
    // startUpImage: [], // Optional: add splash screens here
  },
  formatDetection: {
    telephone: false,
  },
};

// 2. Added Viewport Export (Crucial for PWA mobile experience)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Manual tag for legacy Android support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preload" as="image"  href="/images/hero-poster.webp" fetchPriority="high" />
        <link rel="preload" as="video"  href="/videos/haeloPeptides.webm" />
        <link rel="preload" as="font"   href="/fonts/your-serif.woff2" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors />
          <Providers>{children}</Providers>  
        </ThemeProvider>
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