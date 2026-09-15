import type { Metadata, Viewport } from "next";
import { Gabarito, Manrope, JetBrains_Mono } from "next/font/google";
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
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#060A12" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Runs before paint so a dark-theme visitor never sees a white flash. */
const themeScript = `(()=>{try{const s=localStorage.getItem("gtask-theme");const d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=s||(d?"dark":"light");}catch(e){document.documentElement.dataset.theme="light";}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${gabarito.variable} ${manrope.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
