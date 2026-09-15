import type { Metadata, Viewport } from "next";
import { Gabarito, Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/ui/Providers";
import "./globals.css";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

const SHARE_TITLE = "GTask — Find out if your SAT plan actually adds up";
const SHARE_DESCRIPTION =
  "Five questions, sixty seconds. Your points gap turned into study hours, scored by simple rules you can inspect — not AI.";

export const metadata: Metadata = {
  /* absolute URLs for og:image and share links; the /opengraph-image file supplies the picture */
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gtask.vercel.app"),
  title: {
    default: "GTask — SAT Readiness Check",
    template: "%s · GTask",
  },
  description:
    "Five questions, sixty seconds. GTask measures the gap between the score you have and the score your university expects — and tells you what that gap costs in study hours.",
  applicationName: "GTask",
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "GTask",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
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
