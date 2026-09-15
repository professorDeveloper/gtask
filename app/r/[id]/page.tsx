import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSubmission } from "@/lib/store";
import { ReportView } from "@/components/result/ReportView";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StickyBar } from "@/components/ui/StickyBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your readiness report",
  robots: { index: false },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmission(id).catch(() => null);
  if (!submission) notFound();

  return (
    <>
      <StickyBar>
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" aria-label="GTask home"><Logo size={28} /></Link>
          <ThemeToggle />
        </div>
      </StickyBar>
      <main>
        <ReportView
          report={submission.report}
          answers={submission.answers}
          createdAt={submission.createdAt}
        />
      </main>
    </>
  );
}
