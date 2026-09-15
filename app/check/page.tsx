import Link from "next/link";
import type { Metadata } from "next";
import { CheckFlow } from "@/components/check/CheckFlow";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StickyBar } from "@/components/ui/StickyBar";

export const metadata: Metadata = {
  title: "The readiness check",
  description: "Five questions about your SAT plan. Sixty seconds, no sign-up.",
};

export default function CheckPage() {
  return (
    <>
      <StickyBar>
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5">
          <Link href="/" aria-label="GTask home"><Logo size={28} /></Link>
          <ThemeToggle />
        </div>
      </StickyBar>
      <main><CheckFlow /></main>
    </>
  );
}
