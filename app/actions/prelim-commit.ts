// app/actions/prelim-commit.ts
"use server";

import { db } from "@/lib/db";
import {
  prelimQuestions,
  prelimQuestionStatements,
  prelimQuestionPairs,
  prelimQuestionTopics,
  topics,
} from "@/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { validateQuestion } from "@/app/admin/components/validateIngestion";
import { revalidatePath } from "next/cache";

/* ---------------------------------------------
   Types (Server-side authoritative)
--------------------------------------------- */

export type CommitQuestionPayload = {
  questionText: string;
  questionType: string;

  options?: {
    label: string;
    text: string;
  }[];

  correctOption?: string;

  statements?: {
    idx: number;
    text: string;
    isTrue: boolean;
  }[];

  resolvedTopics: {
    topicId: string;
  }[];
};

export type CommitBatchPayload = {
  paper: string;
  year: number;
  source: string;
  questions: CommitQuestionPayload[];
};

/* ---------------------------------------------
   Final Commit Action
--------------------------------------------- */

export async function finalCommitAction(
  payload: CommitBatchPayload
) {
  /* -------------------------------------------
     🔒 Server-side validation (never trust client)
  ------------------------------------------- */

  for (const q of payload.questions) {
    const result = validateQuestion({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctOption: q.correctOption,
      statements: q.statements,
      resolvedTopics: q.resolvedTopics.map((t) => ({
        aiLabel: "",
        topicId: t.topicId,
        ancestryPath: null,
        topicType: "canonical",
      })),
    });

    if (result.errors.length > 0) {
      return {
        success: false,
        error: "Validation failed on server",
        details: result.errors,
      };
    }
  }

  /* -------------------------------------------
     🔍 Topic integrity check
     (no orphan / no deleted topic)
  ------------------------------------------- */

  const allTopicIds = payload.questions.flatMap((q) =>
    q.resolvedTopics.map((t) => t.topicId)
  );

  const uniqueTopicIds = Array.from(new Set(allTopicIds));

  const existingTopics = await db
    .select({
      id: topics.id,
      topicType: topics.topicType,
    })
    .from(topics)
    .where(inArray(topics.id, uniqueTopicIds));

  if (existingTopics.length !== uniqueTopicIds.length) {
    return {
      success: false,
      error: "One or more attached topics no longer exist",
    };
  }

  /* -------------------------------------------
     🧾 Transactional Commit
  ------------------------------------------- */

  try {
    await db.transaction(async (tx) => {
      for (const q of payload.questions) {
        /* ---- Insert Question ---- */

        const [question] = await tx
          .insert(prelimQuestions)
          .values({
            paper: payload.paper,
            year: payload.year,
            source: payload.source,
            questionType: q.questionType,
            questionText: q.questionText,
            optionA: q.options?.find((o) => o.label === "A")?.text,
            optionB: q.options?.find((o) => o.label === "B")?.text,
            optionC: q.options?.find((o) => o.label === "C")?.text,
            optionD: q.options?.find((o) => o.label === "D")?.text,
            correctOption: q.correctOption,
          })
          .returning({ id: prelimQuestions.id });

        /* ---- Statements ---- */

        if (
          q.questionType === "StatementBased" &&
          q.statements
        ) {
          await tx.insert(prelimQuestionStatements).values(
            q.statements.map((s) => ({
              questionId: question.id,
              statementNumber: s.idx,
              statementText: s.text,
              correctTruth: s.isTrue,
            }))
          );
        }

        /* ---- Topic Mapping ---- */

        await tx.insert(prelimQuestionTopics).values(
          q.resolvedTopics.map((t) => ({
            questionId: question.id,
            topicId: t.topicId,
          }))
        );
      }
    });

    revalidatePath("/admin/prelims");

    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || "Database commit failed",
    };
  }
}
