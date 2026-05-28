import type { Metadata, Viewport } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import VercelAnalytics from "@/components/VercelAnalytics"; // Import the client wrapper

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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={rethink.variable}>
      <head>
        <link rel="preload" as="image" href="/images/hero-poster.webp" fetchPriority="high" />
      </head>
      <body className="antialiased font-sans"> 
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'light':'dark')}catch(e){}})()`,
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors position="top-center" />
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>

        {/* This safely handles the scripts entirely on the client side 
          without blocking the server compilation path.
        */}
        <VercelAnalytics />

        {/* Support widget remains deferred cleanly */}
        <Script
          id="support-widget"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var load = function() {
                  var s = document.createElement('script');
                  s.src = 'https://vilyo-customer-care-support.vercel.app/widget.js';
                  s.setAttribute('data-id', '229453f0-f0c2-4ef8-95ed-b4d67be6a955');
                  document.body.appendChild(s);
                };
                'requestIdleCallback' in window
                  ? requestIdleCallback(load, { timeout: 4000 })
                  : setTimeout(load, 4000);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}