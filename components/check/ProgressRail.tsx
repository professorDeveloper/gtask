import { QUESTIONS } from "@/lib/readiness/questions";

export function ProgressRail({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {QUESTIONS.map((q, i) => (
        <span
          key={q.id}
          className="well h-1 flex-1 overflow-hidden rounded-full"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-brand transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ width: i < index ? "100%" : i === index ? "40%" : "0%" }}
          />
        </span>
      ))}
    </div>
  );
}
