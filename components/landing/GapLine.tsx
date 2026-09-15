"use client";

import { GapBar, GapLegend, gapLegendItems, gapSummary } from "@/components/viz/GapScale";

export { scalePct } from "@/components/viz/GapScale";

/**
 * The landing's gap bar (hero sample card and the method lab). Same drawing
 * as the result page; a parent flips `drawn` once (on view) or changes the
 * numbers live and the bar springs to them.
 */
export function GapLine({
  baseline, projected, target, drawn = true, assumed = false, legend = true, pins = legend, className = "",
}: {
  baseline: number;
  projected: number;
  target: number;
  drawn?: boolean;
  assumed?: boolean;
  legend?: boolean;
  /** value pills above the track; defaults to showing them with the legend */
  pins?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="sr-only-text">{gapSummary(baseline, projected, target, assumed)}</p>
      <GapBar baseline={baseline} projected={projected} target={target} drawn={drawn} assumed={assumed} pins={pins} />
      {legend && <GapLegend className="mt-4" items={gapLegendItems(baseline, projected, target, assumed)} />}
    </div>
  );
}
