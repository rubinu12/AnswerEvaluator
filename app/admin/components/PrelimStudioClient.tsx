"use client";

import { useEffect, useState } from "react";
import QuestionCard, {
  ResolvedTopic,
} from "@/app/admin/components/QuestionCard";
import EditQuestionPanel from "@/app/admin/components/EditQuestionPanel";
import { validateBatch } from "@/app/admin/components/validateIngestion";
import { commitBatchAction } from "@/app/actions/prelim-bulk";
import { parseIngestedJSON } from "./jsonParser";

/* ---------------------------------------------
   Types
--------------------------------------------- */

export interface Subject {
  id: string;
  name: string;
  slug: string;
}

type IngestedQuestion = {
  tempId: string;
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

export interface PrelimStudioClientProps {
  initialSubjects: Subject[];
}

/* ---------------------------------------------
   Component
--------------------------------------------- */

export default function PrelimStudioClient({
  initialSubjects,
}: PrelimStudioClientProps) {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [rawJSON, setRawJSON] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<IngestedQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubjects.length > 0) {
      setActiveSubjectId(initialSubjects[0].id);
    }
  }, [initialSubjects]);

  /* -------------------------------------------
     Validation
  ------------------------------------------- */

  const validationResults = validateBatch(questions);
  const hasBlockingErrors = validationResults.some(
    (r) => r.errors.length > 0
  );

  /* -------------------------------------------
     JSON INGESTION (CORE FIX)
  ------------------------------------------- */

  function handleParseJSON() {
    setParseError(null);

    try {
      const parsed = parseIngestedJSON(rawJSON);
      setQuestions(parsed);
    } catch (e: any) {
      setParseError(e.message);
    }
  }

  /* -------------------------------------------
     Commit
  ------------------------------------------- */

  async function handleCommitAllQuestions() {
    if (questions.length === 0) {
      setCommitError("No questions to commit.");
      return;
    }
    if (hasBlockingErrors) return;

    setIsCommitting(true);
    setCommitError(null);

    try {
      const payload = {
        paper: "GS",
        year: new Date().getFullYear(),
        source: "UPSC",
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctOption: q.correctOption,
          statements: q.statements,
          resolvedTopics: q.resolvedTopics
            .filter((t) => t.topicId)
            .map((t) => ({ topicId: t.topicId! })),
        })),
      };

      const result = await commitBatchAction(payload);
      if (!result.success) throw new Error(result.error);

      setQuestions([]);
      setRawJSON("");
      alert("Questions committed successfully");
    } catch (e: any) {
      setCommitError(e.message);
    } finally {
      setIsCommitting(false);
    }
  }

  /* -------------------------------------------
     Render
  ------------------------------------------- */

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <h1 className="mb-4 text-xl font-semibold">
        Prelims Question Ingestion Studio
      </h1>

      {/* JSON INGESTION */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <textarea
          value={rawJSON}
          onChange={(e) => setRawJSON(e.target.value)}
          placeholder="Paste AI-generated JSON here..."
          className="h-40 w-full rounded border p-2 text-sm"
        />

        {parseError && (
          <div className="mt-2 text-sm text-red-600">
            {parseError}
          </div>
        )}

        <button
          onClick={handleParseJSON}
          className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Parse JSON
        </button>
      </div>

      {/* QUESTIONS */}
      {questions.map((q, index) => (
        <QuestionCard
          key={q.tempId}
          tempId={q.tempId}
          questionText={q.questionText}
          questionType={q.questionType as any}
          statements={q.statements}
          options={q.options}
          correctOption={q.correctOption}
          subjectId={activeSubjectId!}
          resolvedTopics={q.resolvedTopics}
          validation={validationResults[index]}
          onReplaceTopic={(t, id, path) => {
            const next = [...questions];
            next[index].resolvedTopics[t] = {
              ...next[index].resolvedTopics[t],
              topicId: id,
              ancestryPath: path,
              topicType: "canonical",
            };
            setQuestions(next);
          }}
          onRemoveTopic={(t) => {
            const next = [...questions];
            next[index].resolvedTopics.splice(t, 1);
            setQuestions(next);
          }}
          onAttachTopicManually={(id, path) => {
            const next = [...questions];
            next[index].resolvedTopics.push({
              aiLabel: "Manual Attach",
              topicId: id,
              ancestryPath: path,
              topicType: "canonical",
            });
            setQuestions(next);
          }}
          onEditQuestion={() => setEditingIndex(index)}
          onDeleteQuestion={() =>
            setQuestions((prev) => prev.filter((_, i) => i !== index))
          }
        />
      ))}

      {/* COMMIT */}
      <div className="mt-8 flex justify-end gap-4">
        {commitError && (
          <div className="text-sm text-red-600">{commitError}</div>
        )}

        <button
          onClick={handleCommitAllQuestions}
          disabled={hasBlockingErrors || isCommitting || questions.length === 0}
          className={`rounded px-6 py-2 text-white ${
            hasBlockingErrors || isCommitting || questions.length === 0
              ? "bg-slate-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isCommitting ? "Committing..." : "Commit All Questions"}
        </button>
      </div>

      <EditQuestionPanel
        isOpen={editingIndex !== null}
        question={editingIndex !== null ? questions[editingIndex] : null}
        onSave={(updated) => {
          if (editingIndex !== null) {
            const next = [...questions];
            next[editingIndex] = { ...next[editingIndex], ...updated };
            setQuestions(next);
          }
        }}
        onClose={() => setEditingIndex(null)}
      />
    </div>
  );
}
