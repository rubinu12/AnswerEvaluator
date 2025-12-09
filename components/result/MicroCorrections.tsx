'use client';

import { AlertOctagon, ThumbsUp, ArrowRight, Quote } from 'lucide-react';
import { LogicCheck, StrategicPraise } from '@/lib/types';

interface MicroCorrectionsProps {
  logicChecks: LogicCheck[];
  strategicPraise: StrategicPraise[];
}

export default function MicroCorrections({ 
  logicChecks = [], 
  strategicPraise = [] 
}: MicroCorrectionsProps) {

  // If both are empty, hide the section
  if (logicChecks.length === 0 && strategicPraise.length === 0) return null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 🔴 RED PEN: LOGIC & STRUCTURE (The Fixes) */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${strategicPraise.length === 0 ? 'lg:col-span-2' : ''}`}>
        <div className="bg-red-50/50 px-5 py-3 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-2">
            <AlertOctagon size={14} /> Logic & Accuracy
          </h3>
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {logicChecks.length} Issues
          </span>
        </div>
        
        <div className="p-0 divide-y divide-gray-100">
          {logicChecks.length > 0 ? logicChecks.map((item, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="mt-1 min-w-[16px]">
                   <span className={`flex h-4 w-4 rounded-full items-center justify-center text-[10px] font-bold ${
                     item.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                   }`}>
                     {i + 1}
                   </span>
                </div>
                <div className="space-y-2 w-full">
                  <div className="relative bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-500 italic">
                    <Quote size={10} className="absolute top-1 left-1 text-slate-300 transform -scale-x-100" />
                    <span className="relative z-10 pl-2">"{item.originalText}"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {item.critique}
                    </p>
                  </div>
                  {item.severity === 'critical' && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Critical Error
                    </span>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              No logic errors detected. Solid reasoning!
            </div>
          )}
        </div>
      </div>

      {/* 🔵 BLUE PEN: STRATEGIC PRAISE (The Wins) */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${logicChecks.length === 0 ? 'lg:col-span-2' : ''}`}>
        <div className="bg-indigo-50/50 px-5 py-3 border-b border-indigo-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-2">
            <ThumbsUp size={14} /> Strategic Strengths
          </h3>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {strategicPraise.length} Points
          </span>
        </div>

        <div className="p-0 divide-y divide-gray-100">
          {strategicPraise.length > 0 ? strategicPraise.map((item, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1 min-w-[16px]">
                   <span className="flex h-4 w-4 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center text-[10px] font-bold">
                     {i + 1}
                   </span>
                </div>
                <div className="space-y-2 w-full">
                  <div className="relative bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-500 italic">
                    <Quote size={10} className="absolute top-1 left-1 text-slate-300 transform -scale-x-100" />
                    <span className="relative z-10 pl-2">"{item.appreciatedText}"</span>
                  </div>
                  <p className="text-sm font-medium text-indigo-900 leading-snug pl-1 border-l-2 border-indigo-200">
                    {item.comment}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              Keep improving to earn strategic praise.
            </div>
          )}
        </div>
      </div>

    </section>
  );
}