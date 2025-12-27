"use client";

import { useState } from "react";
import { searchTopics } from "@/app/actions/searchTopics";

type SearchResult = {
  id: string;
  name: string;
  ancestryPath: string | null;
};

export interface ManualTopicAttachProps {
  /** Subject boundary (L2 topic id) */
  subjectId: string;

  /** Optional anchor boundary (L3 topic id) */
  anchorId?: string;

  /** Called when a topic is selected */
  onSelect: (topicId: string, ancestryPath: string | null) => void;

  /** Close handler (modal / inline container decides UX) */
  onClose: () => void;
}

export default function ManualTopicAttach({
  subjectId,
  anchorId,
  onSelect,
  onClose,
}: ManualTopicAttachProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const data = await searchTopics({
        query: value,
        subjectId,
        anchorId,
        limit: 15,
      });

      setResults(
        data.map((t) => ({
          id: t.id,
          name: t.name,
          ancestryPath: t.ancestryPath,
        }))
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">
          Attach Topic Manually
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search topic by name…"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {isSearching && (
        <div className="mt-2 text-xs text-slate-500">
          Searching…
        </div>
      )}

      {!isSearching && results.length === 0 && query.length >= 2 && (
        <div className="mt-2 text-xs text-slate-400">
          No matching topics found
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-md border">
          {results.map((r) => (
            <div
              key={r.id}
              className="cursor-pointer px-3 py-2 hover:bg-slate-50"
              onClick={() => {
                onSelect(r.id, r.ancestryPath);
                onClose();
              }}
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

      <div className="mt-3 text-xs text-slate-400">
        Selected topic will be attached as{" "}
        <span className="font-semibold">canonical</span>
      </div>
    </div>
  );
}
