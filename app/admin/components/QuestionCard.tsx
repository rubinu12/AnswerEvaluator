"use client";

import { useState } from "react";
import TopicChip from "@/app/admin/components/TopicChip";
import ManualTopicAttach from "@/app/admin/components/ManualTopicAttach";

type QuestionType =
  | "SingleChoice"
  | "StatementBased"
  | "HowManyPairs"
  | "HowMany"
  | "MatchTheList"
  | "SelectTheCode";

export type ResolvedTopic = {
  aiLabel: string;
  topicId: string | null;
  ancestryPath: string | null;
  topicType: "canonical" | "provisional";
};

export interface QuestionCardProps {
  tempId: string;

  questionText: string;
  questionType: QuestionType;

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

  subjectId: string;

  resolvedTopics: ResolvedTopic[];

  /** Validation (derived, read-only) */
  validation?: {
    errors: string[];
    warnings: string[];
  };

  onReplaceTopic: (
    topicIndex: number,
    newTopicId: string,
    newAncestryPath: string | null
  ) => void;

  onRemoveTopic: (topicIndex: number) => void;

  onAttachTopicManually: (
    topicId: string,
    ancestryPath: string | null
  ) => void;

  onEditQuestion: () => void;
  onDeleteQuestion: () => void;
}

export default function QuestionCard({
  tempId,
  questionText,
  questionType,
  statements,
  options,
  correctOption,
  subjectId,
  resolvedTopics,
  validation,
  onReplaceTopic,
  onRemoveTopic,
  onAttachTopicManually,
  onEditQuestion,
  onDeleteQuestion,
}: QuestionCardProps) {
  const [showManualAttach, setShowManualAttach] = useState(false);

  return (
    <div className="mb-4 rounded-xl border bg-white shadow-sm">
      <div className="p-4 space-y-2">

        {/* 🔴 Validation messages */}
        {validation && (
          <div className="space-y-1">
            {validation.errors.map((e, i) => (
              <div
                key={i}
                className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-700"
              >
                ❌ {e}
              </div>
            ))}
            {validation.warnings.map((w, i) => (
              <div
                key={i}
                className="rounded-md bg-yellow-50 px-3 py-1 text-sm text-yellow-700"
              >
                ⚠️ {w}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-4 px-4 pb-4">
        {/* LEFT — TOPICS */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Topic Mapping
          </div>

          {resolvedTopics.map((topic, index) => (
            <TopicChip
              key={`${tempId}-topic-${index}`}
              aiLabel={topic.aiLabel}
              topicId={topic.topicId}
              ancestryPath={topic.ancestryPath}
              status={topic.topicType}
              subjectId={subjectId}
              onReplace={(id, path) =>
                onReplaceTopic(index, id, path)
              }
              onRemove={() => onRemoveTopic(index)}
            />
          ))}

          {!showManualAttach && (
            <button
              className="mt-2 text-sm text-blue-600 hover:underline"
              onClick={() => setShowManualAttach(true)}
            >
              + Attach topic manually
            </button>
          )}

          {showManualAttach && (
            <ManualTopicAttach
              subjectId={subjectId}
              onSelect={(id, path) =>
                onAttachTopicManually(id, path)
              }
              onClose={() => setShowManualAttach(false)}
            />
          )}
        </div>

        {/* RIGHT — QUESTION */}
        <div>
          <div className="mb-2 text-sm font-medium">
            {questionText}
          </div>

          {questionType === "StatementBased" && statements && (
            <div className="space-y-1 text-sm">
              {statements.map((s) => (
                <div key={s.idx}>
                  {s.idx}. {s.text}
                </div>
              ))}
            </div>
          )}

          {options && (
            <div className="mt-3 space-y-1 text-sm">
              {options.map((o) => (
                <div
                  key={o.label}
                  className={
                    o.label === correctOption
                      ? "bg-emerald-50 px-2 py-1 rounded"
                      : "bg-slate-50 px-2 py-1 rounded"
                  }
                >
                  {o.label}. {o.text}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-4 text-sm">
            <button
              onClick={onEditQuestion}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={onDeleteQuestion}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
