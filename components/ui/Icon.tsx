/**
 * One icon set, drawn on a single 24px grid with a 1.7 stroke so nothing
 * looks borrowed. Every icon in the product comes from here.
 */
export type IconName =
  | "target" | "clock" | "gauge" | "spark" | "check" | "arrowRight" | "arrowLeft"
  | "calendar" | "chart" | "layers" | "shield" | "share" | "refresh" | "chevron"
  | "sun" | "moon" | "book" | "flag" | "plus" | "minus" | "lock";

const paths: Record<IconName, React.ReactNode> = {
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></>,
  gauge: <><path d="M4 16a8 8 0 1 1 16 0" /><path d="M12 16l4.2-4.6" /><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" /></>,
  spark: <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1L5 10.5l5.1-1.9z" />,
  check: <path d="M4.5 12.6 9.4 17.5 19.5 6.9" />,
  arrowRight: <><path d="M4.5 12h14" /><path d="M13 6.2 18.8 12 13 17.8" /></>,
  arrowLeft: <><path d="M19.5 12h-14" /><path d="M11 6.2 5.2 12 11 17.8" /></>,
  calendar: <><rect x="3.8" y="5.2" width="16.4" height="15" rx="3" /><path d="M8.2 3v4M15.8 3v4M3.8 10h16.4" /></>,
  chart: <><path d="M4 19.2h16" /><path d="M7.2 19V12M12 19V6.5M16.8 19v-4.6" /></>,
  layers: <><path d="m12 3.6 8 4.3-8 4.3-8-4.3z" /><path d="m4.4 12.4 7.6 4.1 7.6-4.1" /><path d="m4.4 16.6 7.6 4.1 7.6-4.1" /></>,
  shield: <path d="M12 3.4 19 6v6.1c0 4-2.8 7.2-7 8.5-4.2-1.3-7-4.5-7-8.5V6z" />,
  share: <><path d="M12 15.5V4.2" /><path d="M8.2 7.8 12 4l3.8 3.8" /><path d="M5.5 13.2v5.4a1.8 1.8 0 0 0 1.8 1.8h9.4a1.8 1.8 0 0 0 1.8-1.8v-5.4" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20.2 4.2v4.6h-4.6" /></>,
  chevron: <path d="m7.5 10 4.5 4.5L16.5 10" />,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.6v2.2M12 19.2v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6" /></>,
  moon: <path d="M20 14.3A8.4 8.4 0 0 1 9.7 4 8.5 8.5 0 1 0 20 14.3z" />,
  book: <><path d="M5 5.4A2 2 0 0 1 7 3.4h12v14.2H7a2 2 0 0 0-2 2z" /><path d="M5 5.4v14.2a2 2 0 0 0 2 2h12" /></>,
  flag: <><path d="M6 21V4" /><path d="M6 4.6h11.5l-2.2 4 2.2 4H6" /></>,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  lock: <><rect x="4.8" y="10.4" width="14.4" height="10" rx="3" /><path d="M8.4 10.2V7.8a3.6 3.6 0 0 1 7.2 0v2.4" /></>,
};

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.7,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
