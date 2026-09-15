import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Answers, Refinements, Report } from "@/lib/readiness/types";
import { summarizeSession, type SessionStats } from "@/lib/readiness/session";
import { accuracyFor } from "@/lib/readiness/refine";

/**
 * Where a completed check goes.
 *
 * One narrow interface — save a submission, attach refinements, read it back
 * by id — with two implementations behind it. Supabase when the project is
 * configured, an in-process map when it is not, so the app still runs on a
 * fresh clone with no environment file.
 *
 * `report` is always the BASE five-answer report. The refined report is
 * derived on read with `refine(answers, refinements)`.
 *
 * If migration 002 has not been applied yet, Supabase writes fall back to the
 * original columns and keep session + refinements inside `report._extras`,
 * so nothing is lost and reads look the same either way.
 */

export type Submission = {
  id: string;
  createdAt: string;
  answers: Answers;
  /** Base report from the five answers. */
  report: Report;
  /** How the check was taken; null for older submissions. */
  session: SessionStats | null;
  /** Optional result-page answers; {} when none. */
  refinements: Refinements;
  /** 70–100, from the refinements. */
  accuracy: number;
};

export type StoreKind = "supabase" | "memory";

const TABLE = "submissions";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const storeKind: StoreKind = url && key ? "supabase" : "memory";

if (storeKind === "memory" && process.env.NODE_ENV === "production") {
  console.warn(
    "[gtask] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Submissions are being kept " +
      "in memory and will be lost when this instance recycles. Run ./deploy.sh to configure them.",
  );
}

let client: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!client) client = createClient(url!, key!, { auth: { persistSession: false } });
  return client;
}

/** Dev-only fallback. Survives hot reloads by living on globalThis. */
const g = globalThis as unknown as { __gtaskMemory?: Map<string, Submission> };
const memory = (g.__gtaskMemory ??= new Map<string, Submission>());

type Extras = { session?: SessionStats | null; refinements?: Refinements; accuracy?: number };
type StoredReport = Report & { _extras?: Extras };

/** Postgres "undefined column" / PostgREST "column not in schema cache". */
const missingColumn = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42703" || e.code === "PGRST204" || /column/i.test(e.message ?? ""));

let warnedLegacy = false;
function warnLegacy() {
  if (warnedLegacy) return;
  warnedLegacy = true;
  console.warn("[gtask] supabase/migrations/002_session_and_refine.sql is not applied; storing extras inside report._extras.");
}

export async function saveSubmission(
  answers: Answers,
  report: Report,
  session: SessionStats | null = null,
  /** Client-chosen id: saving the same id twice returns the first save. */
  id: string = crypto.randomUUID(),
): Promise<Submission> {
  const submission: Submission = {
    id,
    createdAt: new Date().toISOString(),
    answers,
    report,
    session,
    refinements: {},
    accuracy: accuracyFor({}),
  };

  if (storeKind === "memory") {
    const existing = memory.get(id);
    if (existing) return existing;
    memory.set(submission.id, submission);
    return submission;
  }

  const legacyRow = {
    id: submission.id,
    created_at: submission.createdAt,
    answers,
    report,
    /* Flattened columns so the Supabase table reads like a spreadsheet. */
    readiness: report.readiness,
    band: report.band.key,
    archetype: report.archetype,
    baseline: report.baseline,
    target: report.target,
    gap: report.gap,
    weeks: report.weeks,
    hours_per_week: report.hoursPerWeek,
  };
  const summary = session ? summarizeSession(session) : null;

  let { error } = await supabase()
    .from(TABLE)
    .insert({
      ...legacyRow,
      session,
      refinements: {},
      focus: summary?.focus ?? null,
      total_ms: session ? Math.min(session.totalMs, 2_147_483_647) : null,
      tab_leaves: session ? Math.min(session.tabLeaves, 32_767) : null,
      accuracy: submission.accuracy,
    });

  if (missingColumn(error)) {
    warnLegacy();
    const extras: Extras = { session, refinements: {}, accuracy: submission.accuracy };
    ({ error } = await supabase().from(TABLE).insert({ ...legacyRow, report: { ...report, _extras: extras } }));
  }

  /* unique violation: this attempt was already saved by an earlier (slow) request */
  if (error?.code === "23505") return (await getSubmission(id)) ?? submission;
  if (error) throw new Error(`Could not save the submission: ${error.message}`);
  return submission;
}

/**
 * Replaces the refinements stored for a submission (send the whole object,
 * not a delta). Returns false when the id does not exist.
 */
export async function saveRefinement(id: string, refinements: Refinements): Promise<boolean> {
  const accuracy = accuracyFor(refinements);

  if (storeKind === "memory") {
    const found = memory.get(id);
    if (!found) return false;
    memory.set(id, { ...found, refinements, accuracy });
    return true;
  }

  const { data, error } = await supabase()
    .from(TABLE)
    .update({ refinements, accuracy })
    .eq("id", id)
    .select("id");

  if (!missingColumn(error)) {
    if (error) throw new Error(`Could not save the refinement: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  warnLegacy();
  const { data: row, error: readError } = await supabase().from(TABLE).select("report").eq("id", id).maybeSingle();
  if (readError) throw new Error(`Could not save the refinement: ${readError.message}`);
  if (!row) return false;
  const stored = row.report as StoredReport;
  const report: StoredReport = { ...stored, _extras: { ...stored._extras, refinements, accuracy } };
  const { error: writeError } = await supabase().from(TABLE).update({ report }).eq("id", id);
  if (writeError) throw new Error(`Could not save the refinement: ${writeError.message}`);
  return true;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (storeKind === "memory") return memory.get(id) ?? null;

  const { data, error } = await supabase().from(TABLE).select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Could not read the submission: ${error.message}`);
  if (!data) return null;

  const { _extras: extras, ...report } = data.report as StoredReport;
  const refinements = ((data.refinements as Refinements | undefined) ?? extras?.refinements ?? {}) as Refinements;
  return {
    id: data.id as string,
    createdAt: data.created_at as string,
    answers: data.answers as Answers,
    report: report as Report,
    session: ((data.session as SessionStats | undefined) ?? extras?.session ?? null) as SessionStats | null,
    refinements,
    accuracy: accuracyFor(refinements),
  };
}

/** Totals for the "n students checked" line on the landing page. */
export async function countSubmissions(): Promise<number> {
  if (storeKind === "memory") return memory.size;
  const { count, error } = await supabase().from(TABLE).select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
