'use client';

import { CoachBlueprint as CoachBlueprintType } from '@/lib/types';
import { Flag, ArrowDown, Target, LayoutList } from 'lucide-react';

interface CoachBlueprintProps {
  data: CoachBlueprintType;
}

// Helper to highlight "A1", "A2" references as tiny pills
const renderInstruction = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(A[1-4])/g);
  return parts.map((part, i) => {
    if (part.match(/A[1-4]/)) {
      return (
        <span key={i} className="inline-flex items-center justify-center px-1.5 ml-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CoachBlueprint({ data }: CoachBlueprintProps) {
  const { introduction, body, conclusion } = data;

  return (
    <div className="relative py-2 pl-2">
      
      {/* 1. INTRO NODE */}
      <div className="flex gap-4 mb-1">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 z-10 shrink-0">
            <Flag size={14} />
          </div>
          <div className="w-0.5 h-full bg-slate-100 my-1"></div>
        </div>
        
        <div className="pb-6 w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Step 1: Introduction
          </span>
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start mb-1.5">
               <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">
                 {introduction.strategy || "The Hook"}
               </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {renderInstruction(introduction.content)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BODY NODE */}
      <div className="flex gap-4 mb-1">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 z-10 shrink-0">
            <LayoutList size={14} />
          </div>
          <div className="w-0.5 h-full bg-slate-100 my-1"></div>
        </div>
        
        <div className="pb-6 w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Step 2: The Body (Core Structure)
          </span>
          
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            
            {/* Thesis Statement */}
            <div className="flex gap-2 items-start text-xs text-slate-700 bg-slate-50 p-2 rounded">
               <Target size={14} className="text-indigo-500 shrink-0 mt-0.5" />
               <p className="italic">{body.coreArgument}</p>
            </div>

            {/* Checklist */}
            <ul className="space-y-2">
              {body.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                  <span className="leading-snug">{renderInstruction(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. CONCLUSION NODE */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 z-10 shrink-0">
            <ArrowDown size={14} />
          </div>
        </div>
        
        <div className="w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Step 3: Conclusion
          </span>
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
             <div className="flex justify-between items-start mb-1.5">
               <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded">
                 {conclusion.strategy || "Way Forward"}
               </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {renderInstruction(conclusion.content)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}