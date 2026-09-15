import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionReveal as Reveal } from "./SectionReveal";

/** One result section: an icon eyebrow, a title, an optional aside, then content. */
export function ResultSection({
  id, eyebrow, icon, title, aside, children, className = "",
}: {
  id: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-20 ${className}`}>
      <Reveal>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-micro font-semibold tracking-[0.08em] text-ink-2 uppercase">
              <Icon name={icon} size={15} className="text-brand" />
              {eyebrow}
            </p>
            <h2 id={`${id}-title`} className="mt-1.5 font-display text-[26px] leading-[1.1] font-bold text-balance sm:text-[30px]">
              {title}
            </h2>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children}
      </Reveal>
    </section>
  );
}
