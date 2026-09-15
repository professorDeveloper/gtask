/**
 * The one icon set: Phosphor, duotone by default. Every icon in the product
 * comes through here, by name, so the set stays small and consistent.
 *
 * The /dist/ssr/* entry points carry no React context, so this works in
 * server and client components alike, and each glyph is imported on its own.
 */
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { BookOpen } from "@phosphor-icons/react/dist/ssr/BookOpen";
import { Brain } from "@phosphor-icons/react/dist/ssr/Brain";
import { CalendarCheck } from "@phosphor-icons/react/dist/ssr/CalendarCheck";
import { CalendarDots } from "@phosphor-icons/react/dist/ssr/CalendarDots";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { CaretUp } from "@phosphor-icons/react/dist/ssr/CaretUp";
import { ChartBar } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { ChartLine } from "@phosphor-icons/react/dist/ssr/ChartLine";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Coffee } from "@phosphor-icons/react/dist/ssr/Coffee";
import { Confetti } from "@phosphor-icons/react/dist/ssr/Confetti";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { Crosshair } from "@phosphor-icons/react/dist/ssr/Crosshair";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Flag } from "@phosphor-icons/react/dist/ssr/Flag";
import { Flame } from "@phosphor-icons/react/dist/ssr/Flame";
import { Function as FunctionIcon } from "@phosphor-icons/react/dist/ssr/Function";
import { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
import { Hourglass } from "@phosphor-icons/react/dist/ssr/Hourglass";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { Lightning } from "@phosphor-icons/react/dist/ssr/Lightning";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/ssr/Link";
import { ListChecks } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { LockSimple } from "@phosphor-icons/react/dist/ssr/LockSimple";
import { MathOperations } from "@phosphor-icons/react/dist/ssr/MathOperations";
import { Medal } from "@phosphor-icons/react/dist/ssr/Medal";
import { Minus } from "@phosphor-icons/react/dist/ssr/Minus";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Play } from "@phosphor-icons/react/dist/ssr/Play";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Question } from "@phosphor-icons/react/dist/ssr/Question";
import { SealCheck } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { ShareNetwork } from "@phosphor-icons/react/dist/ssr/ShareNetwork";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { Stack } from "@phosphor-icons/react/dist/ssr/Stack";
import { Star } from "@phosphor-icons/react/dist/ssr/Star";
import { TelegramLogo } from "@phosphor-icons/react/dist/ssr/TelegramLogo";
import { Target } from "@phosphor-icons/react/dist/ssr/Target";
import { TextAa } from "@phosphor-icons/react/dist/ssr/TextAa";
import { Timer } from "@phosphor-icons/react/dist/ssr/Timer";
import { TrendUp } from "@phosphor-icons/react/dist/ssr/TrendUp";
import { Trophy } from "@phosphor-icons/react/dist/ssr/Trophy";
import { Warning } from "@phosphor-icons/react/dist/ssr/Warning";
import { X } from "@phosphor-icons/react/dist/ssr/X";

const ICONS = {
  /* original names (kept) */
  target: Target,
  clock: Clock,
  gauge: Gauge,
  spark: Sparkle,
  check: Check,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  calendar: CalendarDots,
  chart: ChartBar,
  layers: Stack,
  shield: ShieldCheck,
  share: ShareNetwork,
  refresh: ArrowClockwise,
  chevron: CaretDown,
  book: BookOpen,
  flag: Flag,
  plus: Plus,
  minus: Minus,
  lock: LockSimple,

  /* added for the result, check and share features */
  timer: Timer,
  hourglass: Hourglass,
  eye: Eye,
  eyeSlash: EyeSlash,
  tabLeave: EyeSlash,
  pencil: PencilSimple,
  brain: Brain,
  fire: Flame,
  confetti: Confetti,
  calendarCheck: CalendarCheck,
  calendarDots: CalendarDots,
  trophy: Trophy,
  medal: Medal,
  download: DownloadSimple,
  lightning: Lightning,
  bookOpen: BookOpen,
  math: MathOperations,
  function: FunctionIcon,
  text: TextAa,
  rw: TextAa,
  sparkle: Sparkle,
  star: Star,
  chartBar: ChartBar,
  chartLine: ChartLine,
  trendUp: TrendUp,
  checkCircle: CheckCircle,
  sealCheck: SealCheck,
  listChecks: ListChecks,
  warning: Warning,
  info: Info,
  question: Question,
  undo: ArrowCounterClockwise,
  x: X,
  copy: Copy,
  link: LinkIcon,
  arrowUpRight: ArrowUpRight,
  caretRight: CaretRight,
  caretUp: CaretUp,
  crosshair: Crosshair,
  coffee: Coffee,
  play: Play,
  home: House,
  telegram: TelegramLogo,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;
export type { IconWeight };

export function Icon({
  name,
  size = 20,
  weight = "duotone",
  className = "",
  label,
  strokeWidth,
}: {
  name: IconName;
  size?: number;
  /** Phosphor weight. Duotone is the house style; use "bold" inside small filled chips. */
  weight?: IconWeight;
  className?: string;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  /** @deprecated Kept for old call sites: ≥ 2.2 renders the "bold" weight. */
  strokeWidth?: number;
}) {
  const Glyph = ICONS[name];
  const w: IconWeight = strokeWidth !== undefined && strokeWidth >= 2.2 ? "bold" : weight;
  return (
    <Glyph
      size={size}
      weight={w}
      color="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
