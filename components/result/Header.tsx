'use client';

import { Bookmark, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionAnalysis } from '@/lib/types';

interface HeaderProps {
  data: QuestionAnalysis;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onBookmark: () => void;
  onDownload: () => void;
}

// Helper for the Score Breakdown Pills
const ScorePill = ({ label, score }: { label: string; score: number }) => (
  <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-center min-w-[50px]">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
    <div className={`text-xs font-bold ${score <= 1.5 ? 'text-red-600' : 'text-slate-800'}`}>{score}</div>
  </div>
);

export default function Header({ 
  data, 
  isCollapsed, 
  onToggleCollapse,
  onBookmark,
  onDownload
}: HeaderProps) {
  
  // Calculate Word Count Logic (Simple estimation based on spaces)
  // In a real scenario, this might come pre-calculated from backend
  const wordCount = data.userAnswer.trim().split(/\s+/).length;
  // Assumption: Standard 15 marks = 250 words, 10 marks = 150 words
  const limit = data.maxMarks === 15 ? 250 : 150;
  const isOverLimit = wordCount > limit + 20;
  
  return (
    <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex justify-between items-start sticky top-2 z-30 transition-all duration-200">
      
      <div className="flex gap-5">
        
        {/* 1. Circular Score */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          {/* Progress Arc (Dynamic based on score %) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-indigo-600"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray={`${(data.score / data.maxMarks) * 100}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative text-xl font-black text-slate-900">{data.score}</span>
        </div>

        {/* 2. Meta Info & Title */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
              Question {data.questionNumber}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded border border-blue-100">
              {data.subject}
            </span>
          </div>
          
          <h2 className="text-lg font-bold text-slate-800 leading-tight max-w-xl line-clamp-2">
            {data.questionText}
          </h2>
          
          {/* Structured Marks Breakdown */}
          {!isCollapsed && (
            <div className="flex flex-wrap gap-2 mt-3 items-end">
              <ScorePill label="Intro" score={data.scoreBreakdown.intro} />
              <ScorePill label="Body" score={data.scoreBreakdown.body} />
              <ScorePill label="Conc" score={data.scoreBreakdown.conclusion} />
              
              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Word Count Analysis */}
              <p className="text-[11px] text-slate-500 mb-0.5">
                Words: <span className={`font-semibold ${isOverLimit ? 'text-amber-600' : 'text-slate-800'}`}>{wordCount}</span> 
                <span className="text-slate-400"> / {limit}</span>
                {isOverLimit && (
                  <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    Over Limit
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={onBookmark}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Bookmark Answer"
        >
          <Bookmark size={18} />
        </button>
        
        <button 
          onClick={onDownload}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
          title="Download Report PDF"
        >
          <Download size={18} />
        </button>
        
        <button 
          onClick={onToggleCollapse}
          className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-slate-600 transition-colors ${isCollapsed ? 'bg-gray-100' : ''}`}
          title={isCollapsed ? "Expand Details" : "Collapse Details"}
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

    </header>
  );
}