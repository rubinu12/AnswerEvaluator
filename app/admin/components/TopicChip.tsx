"use client";

import { useState } from "react";
import { searchTopics } from "@/app/actions/searchTopics";

type TopicStatus = "canonical" | "provisional";

export interface TopicChipProps {
  /** AI suggested topic label */
  aiLabel: string;

  /** Resolved DB topic id (null if provisional) */
  topicId: string | null;

  /** Full hierarchy path from DB (camelCase – Drizzle schema) */
  ancestryPath: string | null; // e.g. "Polity > State Executive > Governor"

  /** canonical | provisional */
  status: TopicStatus;

  /** Subject boundary (L2 topic id) */
  subjectId: string;

  /** Anchor boundary (L3 topic id), optional */
  anchorId?: string;

  /** Replace handler */
  onReplace: (newTopicId: string, newAncestryPath: string | null) => void;

  /** Remove handler */
  onRemove: () => void;
}

type SearchResult = {
  id: string;
  name: string;
  ancestryPath: string | null;
};

export default function TopicChip({
  aiLabel,
  ancestryPath,
  status,
  subjectId,
  anchorId,
  onReplace,
  onRemove,
}: TopicChipProps) {
  const [isReplacing, setIsReplacing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const data = await searchTopics({
      query: value,
      subjectId,
      anchorId,
      limit: 10,
    });

    setResults(
      data.map((t) => ({
        id: t.id,
        name: t.name,
        ancestryPath: t.ancestryPath,
      }))
    );
  }

  function handleSelect(topicId: string, path: string | null) {
    onReplace(topicId, path);
    setIsReplacing(false);
    setQuery("");
    setResults([]);
  }

  const displayPath =
    ancestryPath?.replace(/>/g, " → ") ?? "—";

  return (
    <div
      className={`rounded-lg border px-3 py-2 mb-2 ${
        status === "canonical"
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {/* AI Suggested Label */}
      <div className="text-sm font-medium text-slate-900">
        {aiLabel}
      </div>

      {/* DB Hierarchy Path (same style, different color) */}
      <div className="text-sm text-slate-600 mt-0.5">
        {displayPath}
      </div>

      {/* Status */}
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {status}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-3 text-xs">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setIsReplacing((v) => !v)}
        >
          Replace
        </button>
        <button
          type="button"
          className="text-slate-600 hover:underline"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>

      {/* Replace UI */}
      {isReplacing && (
        <div className="mt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search topic…"
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm
                       focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {results.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-md border bg-white shadow-sm">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="cursor-pointer px-2 py-1 hover:bg-slate-100"
                  onClick={() =>
                    handleSelect(r.id, r.ancestryPath)
                  }
                >
                  <div className="text-sm font-medium text-slate-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.ancestryPath?.replace(/>/g, " → ") ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
