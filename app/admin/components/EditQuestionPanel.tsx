"use client";

import { useEffect, useState } from "react";

export interface EditQuestionPanelProps {
  isOpen: boolean;
  question: {
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
  } | null;

  onSave: (updatedQuestion: {
    questionText: string;
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
  }) => void;

  onClose: () => void;
}

export default function EditQuestionPanel({
  isOpen,
  question,
  onSave,
  onClose,
}: EditQuestionPanelProps) {
  const [local, setLocal] = useState<typeof question>(null);

  useEffect(() => {
    setLocal(question);
  }, [question]);

  if (!isOpen || !local) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      {/* Panel */}
      <div className="h-full w-[480px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-slate-900">
            Edit Question
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text
            </label>
            <textarea
              value={local.questionText}
              onChange={(e) =>
                setLocal({
                  ...local,
                  questionText: e.target.value,
                })
              }
              rows={4}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          {/* Statements */}
          {local.statements && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                Statements
              </div>
              {local.statements.map((s, idx) => (
                <div
                  key={s.idx}
                  className="mb-2 rounded-md border p-2"
                >
                  <textarea
                    value={s.text}
                    onChange={(e) => {
                      const updated = [...local.statements!];
                      updated[idx] = {
                        ...s,
                        text: e.target.value,
                      };
                      setLocal({
                        ...local,
                        statements: updated,
                      });
                    }}
                    rows={2}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                  />

                  <label className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={s.isTrue}
                      onChange={(e) => {
                        const updated = [...local.statements!];
                        updated[idx] = {
                          ...s,
                          isTrue: e.target.checked,
                        };
                        setLocal({
                          ...local,
                          statements: updated,
                        });
                      }}
                    />
                    Statement is true
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Options */}
          {local.options && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                Options
              </div>
              {local.options.map((o, idx) => (
                <div
                  key={o.label}
                  className="flex items-center gap-2 mb-2"
                >
                  <span className="text-sm font-semibold">
                    {o.label}.
                  </span>
                  <input
                    type="text"
                    value={o.text}
                    onChange={(e) => {
                      const updated = [...local.options!];
                      updated[idx] = {
                        ...o,
                        text: e.target.value,
                      };
                      setLocal({
                        ...local,
                        options: updated,
                      });
                    }}
                    className="flex-1 rounded-md border px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Correct Option */}
          {local.options && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correct Option
              </label>
              <select
                value={local.correctOption}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    correctOption: e.target.value,
                  })
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                {local.options.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-slate-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(local);
              onClose();
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
