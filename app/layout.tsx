import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from "next/script";
// import FooterBanner from "@/components/Footer";
const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "HÆLO Peptides",
  description: "Premium-grade research peptides engineered for precision. We provide ultra-high purity peptides for advanced biological study. Engineered for accuracy, delivered with full analytical documentation.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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


