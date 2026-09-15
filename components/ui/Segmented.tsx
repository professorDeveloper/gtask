"use client";

export function Segmented<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10.5px] tracking-[0.14em] text-ink-3 uppercase">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
                active
                  ? "border-brand bg-brand text-brand-ink shadow-[var(--elev-key)]"
                  : "elev-1 border-line bg-surface text-ink-2 hover:-translate-y-px hover:border-line-strong hover:text-ink hover:shadow-[var(--elev-2)]"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
