/**
 * A compact SAT scale for the landing: today, where the current pace lands,
 * and the target. Widths transition in CSS, so a parent can flip `drawn`
 * once (on view) or change the numbers live (the method lab).
 */
const MIN = 400;
const MAX = 1600;
export const scalePct = (score: number, min = MIN, max = MAX) =>
  ((Math.min(max, Math.max(min, score)) - min) / (max - min)) * 100;

export function GapLine({
  baseline, projected, target, drawn = true, assumed = false, legend = true, className = "",
}: {
  baseline: number;
  projected: number;
  target: number;
  drawn?: boolean;
  assumed?: boolean;
  legend?: boolean;
  className?: string;
}) {
  const b = scalePct(baseline);
  const p = scalePct(projected);
  const t = scalePct(target);
  const ease = "transition-[width,left,opacity] duration-700 ease-out-soft";
  const short = Math.max(0, target - projected);

  return (
    <div className={className}>
      <p className="sr-only-text">
        {`Today ${baseline}${assumed ? " (estimated)" : ""}, this pace lands at ${projected}, target ${target}${
          short ? `, ${short} points short` : ", on target"
        }.`}
      </p>
      <div className="relative h-6" aria-hidden>
        <div className="well absolute inset-x-0 top-1.5 h-3 rounded-full" />
        <div
          className={`absolute top-1.5 left-0 h-3 rounded-l-full bg-brand/25 ${ease}`}
          style={{ width: `${drawn ? b : 0}%` }}
        />
        <div
          className={`absolute top-1.5 h-3 bg-progress ${ease} delay-150`}
          style={{ left: `${b}%`, width: `${drawn ? Math.max(0, p - b) : 0}%` }}
        />
        <div
          className={`gap-stripes absolute top-1.5 h-3 rounded-r-full ${ease} delay-300`}
          style={{ left: `${p}%`, width: `${drawn ? Math.max(0, t - p) : 0}%` }}
        />
        <div
          className={`absolute top-0 h-6 w-0.5 -translate-x-1/2 rounded-full bg-ink ${ease}`}
          style={{ left: `${t}%`, opacity: drawn ? 1 : 0 }}
        />
        <div
          className={`absolute top-0.5 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-brand bg-surface ${ease}`}
          style={{ left: `${b}%`, opacity: drawn ? 1 : 0 }}
        />
      </div>
      {legend && (
        <dl className="mt-3 grid grid-cols-3 gap-2" aria-hidden>
          <Legend swatch="bg-brand/45" label={assumed ? "Today (est.)" : "Today"} value={baseline} />
          <Legend swatch="bg-progress" label="On this pace" value={projected} />
          <Legend swatch="bg-ink" label="Target" value={target} />
        </dl>
      )}
    </div>
  );
}

function Legend({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-micro text-ink-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${swatch}`} />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="tnum mt-0.5 font-display text-title font-bold tracking-[-0.03em]">{value}</dd>
    </div>
  );
}
