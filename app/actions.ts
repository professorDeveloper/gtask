"use server";

import { evaluate } from "@/lib/readiness/engine";
import { isCompleteAnswerSet } from "@/lib/readiness/questions";
import { refine } from "@/lib/readiness/refine";
import { sanitizeSession } from "@/lib/readiness/session";
import type { Refinements, Report } from "@/lib/readiness/types";
import { getSubmission, saveRefinement, saveSubmission } from "@/lib/store";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Scores a finished check and stores it with its session stats. Returns the
 * id of the saved submission, which is also the address of the report.
 * Session stats are optional and never affect the score; malformed stats are
 * dropped rather than rejecting the check. `clientId` (a UUID the browser
 * picks once per attempt) makes retries idempotent.
 */
export async function submitCheck(answers: unknown, session?: unknown, clientId?: unknown): Promise<{ id: string }> {
  if (!isCompleteAnswerSet(answers)) {
    throw new Error("That answer set is incomplete — every question needs an answer.");
  }
  /* A retry of the same attempt reuses its id, so a slow first save never makes a second row. */
  const id = typeof clientId === "string" && UUID.test(clientId) ? clientId : undefined;
  const report = evaluate(answers);
  const submission = await saveSubmission(answers, report, sanitizeSession(session), id);
  return { id: submission.id };
}

export type RefineReportResult = {
  report: Report;
  accuracy: number;
  refinements: Refinements;
};

/**
 * Applies the optional result-page answers to a saved report and stores them.
 * Send the FULL refinements object each time (not a delta); unknown keys and
 * invalid ids are dropped. Returns the refined report so the page can
 * re-render from the server's arithmetic.
 */
export async function refineReport(id: unknown, refinements: unknown): Promise<RefineReportResult> {
  if (typeof id !== "string" || !UUID.test(id)) throw new Error("That report id is not valid.");
  const submission = await getSubmission(id);
  if (!submission) throw new Error("That report no longer exists.");
  const result = refine(submission.answers, refinements as Refinements);
  const saved = await saveRefinement(id, result.refinements);
  if (!saved) throw new Error("That report no longer exists.");
  return { report: result.report, accuracy: result.accuracy, refinements: result.refinements };
}
