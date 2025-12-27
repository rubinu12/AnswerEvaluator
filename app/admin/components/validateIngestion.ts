import { ResolvedTopic } from "@/app/admin/components/QuestionCard";

/* -----------------------------------------
   Types
----------------------------------------- */

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

export type IngestedQuestionForValidation = {
  questionText: string;
  questionType: string;
  statements?: {
    idx: number;
    text: string;
    isTrue: boolean;
  }[];
  options?: {
    label: string;
    text: string;
  }[];
  correctOption?: string;
  resolvedTopics: ResolvedTopic[];
};

/* -----------------------------------------
   Question-level validation
----------------------------------------- */

export function validateQuestion(
  q: IngestedQuestionForValidation
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  /* ---- Question text ---- */
  if (!q.questionText || q.questionText.trim().length < 5) {
    errors.push("Question text is missing or too short");
  }

  /* ---- Topics ---- */
  if (!q.resolvedTopics || q.resolvedTopics.length === 0) {
    errors.push("No topic attached");
  } else {
    const topicIds = q.resolvedTopics
      .map((t) => t.topicId)
      .filter(Boolean);

    const unique = new Set(topicIds);
    if (unique.size !== topicIds.length) {
      errors.push("Duplicate topic attached");
    }

    const allProvisional = q.resolvedTopics.every(
      (t) => t.topicType === "provisional"
    );
    if (allProvisional) {
      warnings.push(
        "Only provisional topics attached"
      );
    }

    if (q.resolvedTopics.length > 3) {
      warnings.push(
        "Too many topics attached (consider limiting to 2–3)"
      );
    }
  }

  /* ---- Statement-based questions ---- */
  if (q.questionType === "StatementBased") {
    if (!q.statements || q.statements.length === 0) {
      errors.push("No statements provided");
    } else {
      const idxSet = new Set<number>();
      q.statements.forEach((s) => {
        if (!s.text || s.text.trim().length === 0) {
          errors.push("Empty statement text found");
        }
        if (idxSet.has(s.idx)) {
          errors.push("Duplicate statement index");
        }
        idxSet.add(s.idx);
      });
    }
  }

  /* ---- Options ---- */
  if (q.options && q.options.length > 0) {
    const labels = q.options.map((o) => o.label);
    if (!q.correctOption || !labels.includes(q.correctOption)) {
      errors.push(
        "Correct option missing or invalid"
      );
    }
  }

  return { errors, warnings };
}

/* -----------------------------------------
   Batch-level validation
----------------------------------------- */

export function validateBatch(
  questions: IngestedQuestionForValidation[]
) {
  return questions.map((q, index) => ({
    index,
    ...validateQuestion(q),
  }));
}
