// app/actions/prelim-bulk.ts
"use server";

/**
 * This file acts as a FACADE for backward compatibility.
 *
 * UI continues to import from this file.
 * Internals are routed to dedicated, clean modules.
 */

import { analyzeTopicsAction as analyzeTopics } from "./topic-analysis";
import { finalCommitAction } from "./prelim-commit";

/* -------------------------------------------------
   Re-export: Topic Analysis (AI-assisted)
-------------------------------------------------- */

export async function analyzeTopicsAction(
  suggestions: string[],
  subjectId: string | null
) {
  return analyzeTopics(suggestions, subjectId);
}

/* -------------------------------------------------
   Facade: Final Commit
   (UI still calls commitBatchAction)
-------------------------------------------------- */

export async function commitBatchAction(payload: any) {
  /**
   * NOTE:
   * - This function intentionally keeps the old name
   * - Internally routes to finalCommitAction
   * - Can be safely renamed later
   */
  return finalCommitAction(payload);
}
