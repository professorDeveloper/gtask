"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoLink } from "@/components/ui/Logo";

/** A render error on the report page. The saved report is untouched, so offer a retry first. */
export default function ReportError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mesh grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <LogoLink />
        <span className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-gap-soft text-gap-ink">
          <Icon name="warning" size={28} />
        </span>
        <h1 className="mt-5 text-h2 font-bold text-balance">Something broke on this page</h1>
        <p className="mt-3 text-body text-ink-2">
          Your report is still saved. Try again, or start a new check if it keeps happening.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} icon="refresh" size="lg">Try again</Button>
          <Button href="/check" variant="ghost" size="lg">New check</Button>
        </div>
      </div>
    </main>
  );
}
