import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
// import FooterBanner from "@/components/Footer";
const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ronix Fit Savers",
  description: "Join Ronix Savings Group",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0b] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
