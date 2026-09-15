import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSubmission } from "@/lib/store";
import { reportMetadata } from "@/components/share/meta";
import { ReportView } from "@/components/result/ReportView";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoLink } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One read per request, shared by metadata and the page. Invalid ids never reach the store. */
const load = cache(async (id: string) => (UUID.test(id) ? getSubmission(id) : null));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Readiness report", robots: { index: false } };
  return reportMetadata(id).catch(() => ({ title: "Readiness report", robots: { index: false } }));
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;

  let submission;
  try {
    submission = await load(id);
  } catch {
    return <LoadError id={id} />;
  }
  if (!submission) notFound();

  return (
    <ReportView
      id={submission.id}
      answers={submission.answers}
      createdAt={submission.createdAt}
      initialRefinements={submission.refinements}
      session={submission.session}
    />
  );
}

/** The store is unreachable: the report probably exists, so offer a retry, not a redo. */
function LoadError({ id }: { id: string }) {
  return (
    <main className="mesh grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <LogoLink />
        <span className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-gap-soft text-gap-ink">
          <Icon name="warning" size={28} />
        </span>
        <h1 className="mt-5 text-h2 font-bold text-balance">Couldn&apos;t load your report</h1>
        <p className="mt-3 text-body text-ink-2">
          Your answers are saved — the connection to the database just failed. Give it another try in a moment.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href={`/r/${id}`} icon="refresh" size="lg">Retry</Button>
          <Button href="/" variant="ghost" size="lg">Home</Button>
        </div>
      </div>
    </main>
  );
}
