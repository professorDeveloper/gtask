"use server";

import { evaluate } from "@/lib/readiness/engine";
import { isCompleteAnswerSet } from "@/lib/readiness/questions";
import { saveSubmission } from "@/lib/store";

/**
 * Scores a finished check and stores it. Returns the id of the saved
 * submission, which is also the address of the report.
 */
export async function submitCheck(answers: unknown): Promise<{ id: string }> {
  if (!isCompleteAnswerSet(answers)) {
    throw new Error("That answer set is incomplete — every question needs an answer.");
  }
  const report = evaluate(answers);
  const submission = await saveSubmission(answers, report);
  return { id: submission.id };
}
