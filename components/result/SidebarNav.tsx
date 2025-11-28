'use client';

import { EvaluationData } from '@/lib/types';

interface SidebarNavProps {
  data: EvaluationData;
  activeQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

export default function SidebarNav({ 
  data, 
  activeQuestionIndex, 
  onSelectQuestion 
}: SidebarNavProps) {
  
  const questions = data.questionAnalysis;
  const totalEvaluated = questions.length;
  // In a real scenario, you might want to pass 'totalQuestionsInPaper' if it differs from evaluated count
  // For now, we assume the list represents the full set or the set user cares about.

  return (
    <aside className="hidden md:flex flex-col w-28 shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-xs text-slate-600 h-fit sticky top-24">
      
      {/* 1. Paper Meta */}
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Paper</div>
        <div className="mt-1 space-y-0.5">
          <div className="flex justify-between">
            <span>Total Marks:</span>
            <span className="font-semibold text-slate-800">{data.totalMarks}</span>
          </div>
          <div className="flex justify-between">
            <span>Evaluated:</span>
            <span className="font-semibold text-slate-800">{totalEvaluated}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-0.5 mt-0.5">
            <span>Your Score:</span>
            <span className="font-bold text-indigo-600">{data.overallScore}</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation List */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Navigate</div>
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {questions.map((q, idx) => {
            const isActive = idx === activeQuestionIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectQuestion(idx)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-all group ${
                  isActive 
                    ? 'bg-slate-900 text-white font-semibold shadow-sm' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  Q{q.questionNumber}
                </span>
                <span className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-500'}`}>
                  {q.score}/{q.maxMarks}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}