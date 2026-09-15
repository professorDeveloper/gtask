/**
 * Client-side fetching of the rendered share card PNG.
 *
 * The image route can be slow (cold function, font loading) or unreachable
 * (deployment protection answers with an HTML login page, offline). Every
 * attempt has a timeout, transient failures back off and retry, permanent
 * ones stop at once, and everything aborts with the caller's signal.
 */

export type CardFetchResult =
  | { ok: true; file: File }
  | { ok: false; permanent: boolean };

const TIMEOUT_MS = 15_000;
/** Waits before the 2nd, 3rd and 4th attempt. */
const BACKOFF_MS = [1_200, 3_000, 6_000];

/** One attempt. */
export async function fetchCardOnce(path: string, name: string, signal?: AbortSignal): Promise<CardFetchResult> {
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  const timer = window.setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, { cache: "no-store", signal: ctl.signal, credentials: "same-origin" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      /* 404, auth walls, HTML error pages: retrying will not help. 408/429/5xx might. */
      const transient = res.status === 408 || res.status === 429 || res.status >= 500;
      return { ok: false, permanent: !transient };
    }
    const blob = await res.blob();
    if (blob.size === 0) return { ok: false, permanent: false };
    return { ok: true, file: new File([blob], name, { type: "image/png" }) };
  } catch {
    return { ok: false, permanent: false };
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Attempts with backoff until one succeeds, a failure is permanent, or the signal aborts. */
export async function fetchCard(path: string, name: string, signal?: AbortSignal): Promise<File | null> {
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    if (signal?.aborted) return null;
    const sep = path.includes("?") ? "&" : "?";
    const result = await fetchCardOnce(attempt ? `${path}${sep}try=${attempt}` : path, name, signal);
    if (result.ok) return result.file;
    if (result.permanent || attempt === BACKOFF_MS.length) return null;
    if (!(await wait(BACKOFF_MS[attempt], signal))) return null;
  }
  return null;
}

/** Resolves true after `ms`, or false as soon as the signal aborts. */
export function wait(ms: number, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(false);
    const t = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve(true);
    }, ms);
    const onAbort = () => {
      window.clearTimeout(t);
      resolve(false);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function sameBytes(a: Blob, b: Blob): Promise<boolean> {
  if (a.size !== b.size) return false;
  const [x, y] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()]);
  const p = new Uint8Array(x);
  const q = new Uint8Array(y);
  for (let i = 0; i < p.length; i++) if (p[i] !== q[i]) return false;
  return true;
}
