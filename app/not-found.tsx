import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <Link href="/" className="inline-flex"><Logo /></Link>
        <h1 className="mt-8 text-[clamp(28px,7vw,40px)] leading-tight font-bold text-balance">
          That report is not here.
        </h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
          Report links are the only way back to a saved check. If the link is wrong or the report was
          never finished, the fastest fix is to run the five questions again.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/check" icon="arrowRight" size="lg">Start the check</Button>
        </div>
      </div>
    </main>
  );
}
