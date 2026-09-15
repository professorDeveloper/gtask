import type { Metadata, Viewport } from "next";
import { Gabarito, Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/ui/Providers";
import "./globals.css";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gtask.vercel.app"),
  title: {
    default: "GTask — SAT Readiness Check",
    template: "%s · GTask",
  },
  description:
    "Five questions, sixty seconds. GTask measures the gap between the score you have and the score your university expects — and tells you what that gap costs in study hours.",
  openGraph: {
    title: "GTask — SAT Readiness Check",
    description: "Five questions. One honest read of your SAT gap, scored by rules you can inspect.",
    type: "website",
    siteName: "GTask",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${manrope.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
