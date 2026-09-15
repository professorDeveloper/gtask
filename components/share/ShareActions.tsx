"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Report } from "@/lib/readiness/types";
import { daysToTest } from "@/lib/readiness/countdown";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Surface";
import { SPRING, TAP_SCALE, usePrefersReducedMotion } from "@/components/ui/motion";
import { toast } from "@/components/ui/Toast";
import { burst } from "@/components/ui/confetti";
import { CardPreview, type CardPreviewData } from "./CardPreview";
import { fetchCard, sameBytes, wait } from "./cardFile";
import { shareTextFor, telegramShareUrl } from "./text";

/**
 * The share block at the end of the result: a preview of the portrait
 * share card, one primary "Share my result" (native sheet with the image
 * when the device supports it) and three quick tiles — copy link,
 * Telegram, save image.
 *
 * The preview has two layers. An HTML twin of the card (CardPreview) paints
 * with the page from the report on screen, so the block is never empty. The
 * rendered PNG is fetched ahead of the tap (Safari drops the user gesture if
 * navigator.share waits on the network) and cross-fades over it; that same
 * file is what Share and Save send. If the PNG never arrives, the preview
 * stays, Share and Copy send the link, and Save downloads straight from the
 * image route.
 */

type Busy = "share" | "save" | null;
/** loading: first PNG on its way · updating: redrawing after a refinement · failed: gave up */
type ImageState = "loading" | "ready" | "updating" | "failed";

/** A refinement is saved after the score changes on screen; give the store this long to catch up. */
const STALE_RETRIES = 4;
const STALE_WAIT_MS = 700;

const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gtask.vercel.app").host;
  } catch {
    return "gtask.vercel.app";
  }
})();

export function ShareActions({ id, report, createdAt }: { id: string; report: Report; createdAt?: string }) {
  const reduce = usePrefersReducedMotion();
  const [busy, setBusy] = useState<Busy>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [png, setPng] = useState<string | null>(null);
  const [pngShown, setPngShown] = useState(false);
  const [image, setImage] = useState<ImageState>("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [origin, setOrigin] = useState("");
  const fileRef = useRef<File | null>(null);
  const fileVersion = useRef<string | null>(null);
  const shownScore = useRef<number | null>(null);

  /* the version key busts the card when a refinement changes the report */
  const version = `${report.readiness}-${report.refined?.accuracy ?? 70}`;
  const cardPath = `/r/${id}/card?v=${version}`;
  const reportUrl = `${origin}/r/${id}`;
  const text = shareTextFor(report);
  const fileName = `gtask-report-${report.readiness}.png`;
  const score = report.readiness;

  const card: CardPreviewData = {
    readiness: report.readiness,
    bandName: report.band.name,
    tone: report.band.tone,
    archetype: report.archetype,
    baseline: report.baseline,
    target: report.target,
    gap: report.target - report.baseline,
    measured: report.measured,
    countdown: daysToTest({ weeks: report.weeks, booked: !report.flags.unbooked }, createdAt).label,
    site: SITE_HOST,
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- origin is only known in the browser
    setOrigin(window.location.origin);
  }, []);

  /* A failed image gets another go when the connection comes back. */
  useEffect(() => {
    if (image !== "failed") return;
    const again = () => setRetryKey((k) => k + 1);
    window.addEventListener("online", again);
    return () => window.removeEventListener("online", again);
  }, [image]);

  /* Fetch the card. When the score moved but the server still draws the old
     card (the refinement save is in flight), wait and fetch again. */
  useEffect(() => {
    const ctl = new AbortController();
    const previous = fileRef.current;
    const refining = previous !== null && fileVersion.current !== version;
    /* the HTML twin already shows the new numbers; hide the stale PNG over it */
    setImage(refining ? "updating" : "loading");
    if (refining) setPngShown(false);

    (async () => {
      const scoreMoved = shownScore.current !== null && shownScore.current !== score;
      let file: File | null = null;
      for (let attempt = 0; attempt <= STALE_RETRIES; attempt++) {
        file = await fetchCard(attempt ? `${cardPath}&n=${attempt}` : cardPath, fileName, ctl.signal);
        if (ctl.signal.aborted) return;
        if (!file || !scoreMoved || !previous || !(await sameBytes(file, previous))) break;
        if (!(await wait(STALE_WAIT_MS, ctl.signal))) return;
      }
      if (ctl.signal.aborted) return;
      if (!file) {
        /* keep an older file for Share/Save only if it still matches the report */
        if (fileVersion.current !== version) fileRef.current = null;
        setImage("failed");
        return;
      }
      fileRef.current = file;
      fileVersion.current = version;
      shownScore.current = score;
      setPng((old) => {
        if (old) window.setTimeout(() => URL.revokeObjectURL(old), 1500);
        return URL.createObjectURL(file);
      });
      setImage("ready");
    })();

    return () => ctl.abort();
  }, [cardPath, fileName, score, version, retryKey]);

  /* revoke the last object URL on unmount */
  const pngRef = useRef(png);
  useEffect(() => {
    pngRef.current = png;
  }, [png]);
  useEffect(() => () => {
    if (pngRef.current) URL.revokeObjectURL(pngRef.current);
  }, []);

  const onCopy = async (el: HTMLElement) => {
    if (await copyText(reportUrl)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
      burst(el);
      toast({ id: "share", title: "Link copied", description: "Paste it to a friend, a parent or your tutor.", tone: "ready", icon: "checkCircle" });
    } else {
      toast({ id: "share", title: "Couldn't copy the link", description: "Long-press the address bar to copy it instead.", tone: "gap", icon: "warning" });
    }
  };

  const onShare = async (el: HTMLElement) => {
    if (typeof navigator.share !== "function") return onCopy(el);
    setBusy("share");
    try {
      const file = fileRef.current;
      let withFile = false;
      try {
        withFile = Boolean(file && navigator.canShare?.({ files: [file] }));
      } catch {
        withFile = false;
      }
      await navigator.share(
        withFile && file
          ? { files: [file], title: "My SAT readiness", text: `${text} ${reportUrl}` }
          : { title: "My SAT readiness", text, url: reportUrl },
      );
      toast({ id: "share", title: "Shared", description: "Nice. Now go close that gap.", tone: "sunny", icon: "confetti" });
    } catch (err) {
      /* the user closing the sheet is not an error */
      if ((err as DOMException)?.name !== "AbortError") await onCopy(el);
    } finally {
      setBusy(null);
    }
  };

  /* Synchronous on purpose: no await before the download, so the tap still counts as a user gesture. */
  const onSave = () => {
    const file = fileRef.current;
    const a = document.createElement("a");
    let href: string | null = null;
    if (file) {
      href = URL.createObjectURL(file);
      a.href = href;
      a.download = file.name;
    } else {
      /* no bytes in hand: let the route render and send it as an attachment */
      a.href = `/r/${id}/card?v=${version}&download=1`;
      a.download = fileName;
      a.target = "_blank";
      a.rel = "noopener";
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (href) window.setTimeout(() => URL.revokeObjectURL(href), 4000);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
    toast({
      id: "share",
      title: file ? "Image saved" : "Downloading your card",
      description: "A 1080 × 1350 card, sized for stories and chats.",
      tone: "ready",
      icon: "download",
    });
    if (!file) setRetryKey((k) => k + 1);
  };

  /* Same first render on server and client (reduced motion is only known
     after hydration); reduced motion just makes the entrance instant. */
  const entrance = reduce ? { duration: 0 } : SPRING.gentle;

  return (
    <section aria-labelledby="share-title" className="share-block overflow-hidden rounded-card border border-line bg-surface elev-2">
      <div className="grid sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        {/* preview stage */}
        <div className="share-stage relative flex flex-col items-center justify-center gap-5 border-b border-line px-6 pb-5 pt-9 sm:border-b-0 sm:border-r sm:px-7 sm:py-8">
          <motion.div
            className="relative w-[58%] max-w-[13.5rem] sm:w-full sm:max-w-[13rem]"
            initial={{ opacity: 0, y: 28, rotate: -8, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={entrance}
          >
            <div className="share-card-tilt -rotate-2">
              <figure
                className="share-frame relative m-0 aspect-[1080/1350] w-full overflow-hidden rounded-[14px] elev-4"
                aria-label={`Share card: ${report.archetype}, ${report.readiness} out of 100, ${report.band.name} band`}
                role="img"
              >
                <CardPreview data={card} />
                {png && (
                  <Image
                    src={png}
                    alt=""
                    width={1080}
                    height={1350}
                    unoptimized
                    draggable={false}
                    data-shown={pngShown && image !== "updating"}
                    onLoad={() => setPngShown(true)}
                    onError={() => setPngShown(false)}
                    className="share-png absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {image === "updating" && <span aria-hidden className="share-shimmer absolute inset-0" />}
              </figure>
            </div>
            <motion.span
              aria-hidden
              className="absolute -right-4 -top-4 inline-flex min-h-8 items-center gap-1 rounded-full bg-sunny px-3 text-micro font-bold text-ink elev-2"
              initial={{ scale: 0.4, rotate: 0, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 8, opacity: 1 }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { ...SPRING.pop, delay: 0.35 }}
            >
              <Icon name="sparkle" size={14} weight="fill" />
              Story size
            </motion.span>
          </motion.div>

          <ImageStatus state={image} onRetry={() => setRetryKey((k) => k + 1)} />
        </div>

        {/* actions */}
        <div className="flex flex-col justify-center gap-5 p-5 sm:p-7">
          <div>
            <Eyebrow icon="share">Share</Eyebrow>
            <h3 id="share-title" className="mt-2 font-display text-title font-bold tracking-[-0.015em] text-balance text-ink">
              Your card is ready
            </h3>
            <p className="mt-1.5 text-body text-ink-2 text-pretty">
              <span className="font-semibold text-ink">{report.archetype}</span>, {report.readiness}/100, {report.band.name} band. One
              poster for your group chat, a parent or your tutor.
            </p>
          </div>

          <Button
            size="lg"
            icon="share"
            iconPosition="start"
            className="w-full"
            loading={busy === "share"}
            onClick={(e) => onShare(e.currentTarget)}
          >
            Share my result
          </Button>

          <ul className="grid grid-cols-3 gap-2.5" aria-label="More ways to share">
            <li>
              <Tile
                icon={copied ? "check" : "link"}
                label={copied ? "Copied" : "Copy link"}
                done={copied}
                onClick={(e) => onCopy(e.currentTarget)}
              />
            </li>
            <li>
              <Tile
                label="Telegram"
                href={origin ? telegramShareUrl(reportUrl, text) : undefined}
                glyph={<Icon name="telegram" size={20} />}
              />
            </li>
            <li>
              <Tile
                icon={saved ? "check" : "download"}
                label={saved ? "Saved" : "Save image"}
                done={saved}
                onClick={onSave}
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---- image status ------------------------------------------------------------ */

function ImageStatus({ state, onRetry }: { state: ImageState; onRetry: () => void }) {
  const chip = "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface/85 px-3 text-micro font-semibold elev-1 backdrop-blur";
  const spinner = <span aria-hidden className="anim-spin inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent" />;
  return (
    <p className="relative flex min-h-11 items-center justify-center" aria-live="polite">
      {state === "ready" && (
        <span className={`${chip} text-ready-ink`}>
          <Icon name="checkCircle" size={15} weight="fill" /> HD image ready · 1080 × 1350
        </span>
      )}
      {state === "loading" && (
        <span className={`${chip} text-ink-2`}>
          {spinner} Rendering HD image
        </span>
      )}
      {state === "updating" && (
        <span className={`${chip} text-ink-2`}>
          {spinner} Updating with your new score
        </span>
      )}
      {state === "failed" && (
        <button
          type="button"
          onClick={onRetry}
          className={`${chip} min-h-11 text-ink-2 transition-colors hover:text-brand`}
        >
          <Icon name="refresh" size={15} /> Image not ready · Retry
        </button>
      )}
    </p>
  );
}

/* ---- tile ----------------------------------------------------------------- */

type TileProps = {
  label: string;
  icon?: IconName;
  /** A non-registry glyph (brand logos). */
  glyph?: React.ReactNode;
  href?: string;
  done?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function Tile({ label, icon, glyph, href, done = false, onClick }: TileProps) {
  const reduce = usePrefersReducedMotion();
  /* always set whileTap: motion adds tabindex for it, so dropping it after hydration would mismatch */
  const tap = { scale: reduce ? 1 : TAP_SCALE };
  const cn =
    "share-tile group flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-control bg-paper px-1.5 py-2.5 text-caption font-semibold text-ink-2 aria-disabled:pointer-events-none aria-disabled:opacity-60";

  const face = (
    <>
      <motion.span
        key={done ? "done" : "idle"}
        initial={reduce || !done ? false : { scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={SPRING.pop}
        className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 ${
          done ? "bg-ready-soft text-ready-ink" : "bg-brand-soft text-brand"
        }`}
      >
        {glyph ?? (icon && <Icon name={icon} size={20} />)}
      </motion.span>
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (href !== undefined || glyph) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!href || undefined}
        className={cn}
        whileTap={tap}
        transition={SPRING.tap}
      >
        {face}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} className={cn} whileTap={tap} transition={SPRING.tap}>
      {face}
    </motion.button>
  );
}

/* ---- helpers -------------------------------------------------------------- */

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    /* older WebViews: the textarea trick */
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
