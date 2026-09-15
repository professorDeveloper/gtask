import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Answers, Report } from "@/lib/readiness/types";

/**
 * Where a completed check goes.
 *
 * One narrow interface — save and read a submission by id — with two
 * implementations behind it. Supabase when the project is configured,
 * an in-process map when it is not, so the app still runs on a fresh
 * clone with no environment file.
 */

export type Submission = {
  id: string;
  createdAt: string;
  answers: Answers;
  report: Report;
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

/** Dev-only fallback. Lives for as long as the server process does. */
const memory = new Map<string, Submission>();

export async function saveSubmission(answers: Answers, report: Report): Promise<Submission> {
  const submission: Submission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    answers,
    report,
  };

  if (storeKind === "memory") {
    memory.set(submission.id, submission);
    return submission;
  }

  const { error } = await supabase()
    .from(TABLE)
    .insert({
      id: submission.id,
      created_at: submission.createdAt,
      answers: submission.answers,
      report: submission.report,
      /* Flattened columns so the Supabase table reads like a spreadsheet. */
      readiness: report.readiness,
      band: report.band.key,
      archetype: report.archetype,
      baseline: report.baseline,
      target: report.target,
      gap: report.gap,
      weeks: report.weeks,
      hours_per_week: report.hoursPerWeek,
    });

  if (error) throw new Error(`Could not save the submission: ${error.message}`);
  return submission;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (storeKind === "memory") return memory.get(id) ?? null;

  const { data, error } = await supabase()
    .from(TABLE)
    .select("id, created_at, answers, report")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not read the submission: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id as string,
    createdAt: data.created_at as string,
    answers: data.answers as Answers,
    report: data.report as Report,
  };
}

/** Totals for the "n students checked" line on the landing page. */
export async function countSubmissions(): Promise<number> {
  if (storeKind === "memory") return memory.size;
  const { count, error } = await supabase().from(TABLE).select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
