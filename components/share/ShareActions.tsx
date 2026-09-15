"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Report } from "@/lib/readiness/types";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Surface";
import { SPRING, TAP_SCALE, usePrefersReducedMotion } from "@/components/ui/motion";
import { toast } from "@/components/ui/Toast";
import { burst } from "@/components/ui/confetti";
import { shareTextFor, telegramShareUrl } from "./text";

/**
 * The share block at the end of the result: a preview of the portrait
 * share card, one primary "Share my result" (native sheet with the image
 * when the device supports it) and three quick tiles — copy link,
 * Telegram, save image.
 *
 * The preview, the shared file and the saved file are the same fetched
 * bytes, so what the student sees is exactly what gets sent.
 */

type Busy = "share" | "save" | null;

/** A refinement is saved after the score changes on screen; give the store this long to catch up. */
const STALE_RETRIES = 4;
const STALE_WAIT_MS = 700;

export function ShareActions({ id, report }: { id: string; report: Report }) {
  const reduce = usePrefersReducedMotion();
  const [busy, setBusy] = useState<Busy>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(true);
  const [origin, setOrigin] = useState("");
  const fileRef = useRef<File | null>(null);
  const shownScore = useRef<number | null>(null);

  /* the version key busts the card when a refinement changes the report */
  const version = `${report.readiness}-${report.refined?.accuracy ?? 70}`;
  const cardPath = `/r/${id}/card?v=${version}`;
  const reportUrl = `${origin}/r/${id}`;
  const text = shareTextFor(report);
  const fileName = `gtask-report-${report.readiness}.png`;
  const score = report.readiness;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- origin is only known in the browser
    setOrigin(window.location.origin);
  }, []);

  /* Fetch the card ahead of the tap: Safari drops the user gesture if
     navigator.share waits on a network request. When the score moved but
     the server still draws the old card (the refinement save is in
     flight), wait and fetch again. */
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the shimmer while the new card loads
    setUpdating(true);
    (async () => {
      const previous = fileRef.current;
      const scoreMoved = shownScore.current !== null && shownScore.current !== score;
      let file: File | null = null;
      for (let attempt = 0; attempt <= STALE_RETRIES && !cancelled; attempt++) {
        file = await fetchCard(`${cardPath}&n=${attempt}`, fileName);
        if (!file || !scoreMoved || !previous || !(await sameBytes(file, previous))) break;
        await wait(STALE_WAIT_MS);
      }
      if (cancelled) return;
      setUpdating(false);
      if (!file) return;
      fileRef.current = file;
      shownScore.current = score;
      setPreview((old) => {
        if (old) window.setTimeout(() => URL.revokeObjectURL(old), 1000);
        return URL.createObjectURL(file);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [cardPath, fileName, score]);

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
      const withFile = file && navigator.canShare?.({ files: [file] });
      await navigator.share(
        withFile
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

  const onSave = async () => {
    setBusy("save");
    try {
      const file = fileRef.current ?? (await fetchCard(cardPath, fileName));
      if (!file) throw new Error("no image");
      const href = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = href;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 4000);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
      toast({ id: "share", title: "Image saved", description: "A 1080 × 1350 card, sized for stories and chats.", tone: "ready", icon: "download" });
    } catch {
      window.open(`/r/${id}/card?download=1`, "_blank", "noopener");
    } finally {
      setBusy(null);
    }
  };

  /* Same first render on server and client (reduced motion is only known
     after hydration); reduced motion just makes the entrance instant. */
  const entrance = reduce ? { duration: 0 } : SPRING.pop;

  return (
    <section aria-labelledby="share-title" className="share-block overflow-hidden rounded-card border border-line bg-surface elev-1">
      <div className="grid gap-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {/* preview */}
        <div className="mesh relative flex items-center justify-center px-6 pb-4 pt-8 sm:py-8">
          <motion.div
            className="share-preview relative w-[62%] max-w-56 sm:w-full"
            initial={{ opacity: 0, y: 24, rotate: -9, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, rotate: -3, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={entrance}
          >
            <div className="relative aspect-[1080/1350] w-full overflow-hidden rounded-control elev-3 mesh-strong">
              {preview && (
                <Image
                  src={preview}
                  alt={`Share card: ${report.archetype}, ${report.readiness} out of 100, ${report.band.name} band`}
                  width={1080}
                  height={1350}
                  unoptimized
                  className={`h-full w-full object-cover transition-opacity duration-300 ${updating ? "opacity-60" : "opacity-100"}`}
                />
              )}
              {updating && <span aria-hidden className="share-shimmer absolute inset-0" />}
            </div>
            <motion.span
              aria-hidden
              className="absolute -right-3 -top-3 inline-flex min-h-8 items-center gap-1 rounded-full bg-sunny px-3 text-micro font-bold text-ink elev-2"
              initial={{ scale: 0.4, rotate: 0, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 8, opacity: 1 }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { ...SPRING.pop, delay: 0.25 }}
            >
              <Icon name="sparkle" size={14} weight="fill" />
              Story size
            </motion.span>
          </motion.div>
          <span className="sr-only" aria-live="polite">{updating && preview ? "Updating your share card" : ""}</span>
        </div>

        {/* actions */}
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <Eyebrow icon="share">Share</Eyebrow>
            <h3 id="share-title" className="mt-2 font-display text-title font-bold tracking-[-0.015em] text-balance text-ink">
              Your card is ready
            </h3>
            <p className="mt-1 text-body text-ink-2 text-pretty">
              Score, archetype and band on one poster. Send it to a friend, a parent or your tutor.
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
                glyph={<Icon name="telegram" size={22} />}
              />
            </li>
            <li>
              <Tile
                icon={saved ? "check" : "download"}
                label={saved ? "Saved" : "Save image"}
                done={saved}
                busy={busy === "save"}
                onClick={onSave}
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
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
  busy?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function Tile({ label, icon, glyph, href, done = false, busy = false, onClick }: TileProps) {
  const reduce = usePrefersReducedMotion();
  /* always set whileTap: motion adds tabindex for it, so dropping it after hydration would mismatch */
  const tap = { scale: reduce ? 1 : TAP_SCALE };
  const cn =
    "group flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-control border border-line bg-paper px-1.5 py-2.5 text-caption font-semibold text-ink-2 transition-colors duration-200 hover:border-brand hover:text-brand aria-disabled:pointer-events-none aria-disabled:opacity-60";

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
        {busy ? (
          <span aria-hidden className="anim-spin inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent" />
        ) : (
          glyph ?? (icon && <Icon name={icon} size={20} />)
        )}
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
    <motion.button
      type="button"
      onClick={onClick}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      className={cn}
      whileTap={tap}
      transition={SPRING.tap}
    >
      {face}
    </motion.button>
  );
}

/* ---- helpers -------------------------------------------------------------- */

async function fetchCard(path: string, name: string): Promise<File | null> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return new File([await res.blob()], name, { type: "image/png" });
  } catch {
    return null;
  }
}

async function sameBytes(a: Blob, b: Blob): Promise<boolean> {
  if (a.size !== b.size) return false;
  const [x, y] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()]);
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  for (let i = 0; i < u.length; i++) if (u[i] !== v[i]) return false;
  return true;
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

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
