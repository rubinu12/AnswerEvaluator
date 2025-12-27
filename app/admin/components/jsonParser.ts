// app/admin/prelims/jsonParser.ts

import { ResolvedTopic } from "@/app/admin/components/QuestionCard";

export type ParsedQuestion = {
  tempId: string;
  questionText: string;
  questionType: string;
  options?: { label: string; text: string }[];
  correctOption?: string;
  statements?: {
    idx: number;
    text: string;
    isTrue: boolean;
  }[];
  resolvedTopics: ResolvedTopic[];
};

export function parseIngestedJSON(raw: string): ParsedQuestion[] {
  let data: any[];

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of questions");
  }

  return data.map((item, index) => {
    const q = item.question;

    return {
      tempId: `q_${Date.now()}_${index}`,
      questionText: q.question_text,
      questionType: item.meta.question_type === "statement"
        ? "StatementBased"
        : "SingleChoice",

      options: q.options?.map((o: any) => ({
        label: o.label,
        text: o.text,
      })),

      correctOption: q.correct_option,

      statements: q.statements?.map((s: any) => ({
        idx: s.idx,
        text: s.text,
        isTrue: s.is_statement_true,
      })),

      resolvedTopics: item.topics.map((t: any) => ({
        aiLabel: `${t.anchor} → ${t.detailed}`,
        topicId: null,              // resolved later
        ancestryPath: null,
        topicType: "provisional",
      })),
    };
  });
}
