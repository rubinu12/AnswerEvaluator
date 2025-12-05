'use client';

import React from 'react';
import { FileText, ChevronUp, ChevronDown, AlertCircle, Bookmark, Download } from 'lucide-react';
import { QuestionAnalysis } from '@/lib/types';

interface HeaderProps {
  data: QuestionAnalysis;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Optional handlers to satisfy usage in QuestionCard if present
  onBookmark?: () => void;
  onDownload?: () => void;
}

export default function Header({ 
  data, 
  isCollapsed, 
  onToggleCollapse, 
  onBookmark, 
  onDownload 
}: HeaderProps) {
  const { meta, score, maxMarks, questionText, subject } = data;

  // Calculate percentage for the circle
  // Guard against divide by zero just in case
  const safeMax = maxMarks || 1;
  const percentage = Math.round((score / safeMax) * 100);
  const degrees = (percentage / 100) * 360;

  return (
    <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 sticky top-2 z-40 transition-all duration-300">
      <div className="flex justify-between items-start">
        
        {/* LEFT: Score & Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Score Circle */}
          <div 
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 relative shadow-inner bg-slate-100"
            style={{
              background: `conic-gradient(#4f46e5 ${degrees}deg, #e2e8f0 0deg)`
            }}
          >
            <div className="w-[50px] h-[50px] bg-white rounded-full absolute flex items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900">{score}</span>
            </div>
          </div>

          <div className="flex-1">
            {/* Tags Strip */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded border border-slate-200 tracking-wide">
                {subject}
              </span>
              {meta?.topicTree && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase rounded border border-indigo-100 tracking-wide">
                  {meta.topicTree.mainTopic}
                </span>
              )}
            </div>

            {/* Question Text */}
            <h1 className={`text-lg font-semibold text-slate-900 leading-tight transition-all ${isCollapsed ? "line-clamp-1 text-sm" : ""}`}>
              {questionText}
            </h1>

            {/* Meta Stats */}
            {!isCollapsed && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span>
                  Max Marks: <span className="font-semibold text-slate-900">{maxMarks}</span>
                </span>
                <span>•</span>
                <span>
                  Word count:{" "}
                  <span className={`font-semibold ${meta?.overLimit ? "text-amber-700" : "text-slate-900"}`}>
                    ~{meta?.wordCount || 0}
                  </span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span>{meta?.wordLimit} ± 10%</span>
                </span>
                
                {meta?.overLimit && (
                  <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    <AlertCircle size={10} />
                    Over limit
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex gap-2 items-center shrink-0 ml-2">
          
          {/* Optional Action Buttons */}
          {onDownload && (
            <button 
              onClick={onDownload}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          )}
          
          {onBookmark && (
            <button 
              onClick={onBookmark}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              title="Bookmark"
            >
              <Bookmark size={16} />
            </button>
          )}
          
          {/* Collapse Toggle */}
          <button 
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>
      
      {/* Topic Sub-tags (Hidden when collapsed) */}
      {!isCollapsed && meta?.topicTree?.subTopics?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 self-center">
            Key Themes:
          </span>
          {meta.topicTree.subTopics.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}