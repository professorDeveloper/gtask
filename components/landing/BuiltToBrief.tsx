/**
 * "Under the hood": what the product promises, each with where to verify it.
 */
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHead } from "@/components/ui/Surface";
import { JumpLink } from "@/components/ui/JumpLink";
import { HOURS_PER_POINT } from "@/lib/readiness/engine";

export const REPO_URL = "https://github.com/professorDeveloper/gtask";

const LINK =
  "-mb-3 -ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-full px-2 text-caption font-semibold text-brand hover:underline sm:mt-auto sm:pt-2";

type Item = {
  icon: IconName;
  title: string;
  body: string;
  proof: string;
  link?: { href: string; label: string; external?: boolean };
};

export function BuiltToBrief({ checks, ruleWeights }: { checks: number; ruleWeights: number[] }) {
  const items: Item[] = [
    {
      icon: "listChecks",
      title: "Five questions, one result",
      body: "Five answers produce the report. Three more on it are optional.",
      proof: "5 required · 3 optional",
      link: { href: "#how", label: "See them" },
    },
    {
      icon: "function",
      title: "Scored by rules, not AI",
      body: "Three weighted rules, one constant. Same answers, same report.",
      proof: `${ruleWeights.join(" + ")} pts · ${Math.round(HOURS_PER_POINT * 100)} h per 100`,
      link: { href: "#method", label: "Read them" },
    },
    {
      icon: "database",
      title: "Answers saved",
      body: "Supabase Postgres: answers, report and timing. No name, no email.",
      proof: checks > 0 ? `Row-level security · ${checks.toLocaleString("en-US")} saved` : "Row-level security on",
    },
    {
      icon: "deviceMobile",
      title: "Built for the phone first",
      body: "One-thumb answer tiles; progress survives a refresh.",
      proof: "Checked at 390 × 844",
    },
    {
      icon: "cloudCheck",
      title: "Deployed",
      body: "Server-rendered on Vercel; the saved count refreshes every 2 min.",
      proof: "Next.js 16 · Vercel",
    },
    {
      icon: "github",
      title: "Open source",
      body: "The app, the SQL schema and the rule tests, in a public repo.",
      proof: "TypeScript · rules covered by tests",
      link: { href: REPO_URL, label: "View code", external: true },
    },
  ];

  return (
    <section id="built" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 md:py-24">
      <SectionHead
        eyebrow="Under the hood"
        title="Small, and fully working."
        lede="What this page promises, and where to check each part yourself."
      />

      <ol className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line elev-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.title} className="flex gap-4 bg-surface px-4 py-4 sm:flex-col sm:gap-0 sm:p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand sm:h-11 sm:w-11">
              <Icon name={it.icon} size={22} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col sm:mt-4">
              <h3 className="flex items-baseline gap-2 text-body font-bold sm:text-title">
                <span className="tnum hidden font-mono text-micro font-semibold text-ink-3 sm:inline">0{i + 1}</span>
                {it.title}
              </h3>
              <p className="tnum mt-0.5 font-mono text-micro text-brand sm:mt-1">{it.proof}</p>
              <p className="mt-1.5 text-caption text-ink-2 sm:mt-2">{it.body}</p>
              {it.link?.external && (
                <a href={it.link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {it.link.label}
                  <Icon name="arrowUpRight" size={15} weight="bold" />
                </a>
              )}
              {it.link && !it.link.external && (
                <JumpLink href={it.link.href as `#${string}`} className={LINK}>
                  {it.link.label}
                  <Icon name="caretRight" size={15} weight="bold" />
                </JumpLink>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
