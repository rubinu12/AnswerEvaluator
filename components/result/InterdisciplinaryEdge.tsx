'use client';

import { InterdisciplinaryContext } from '@/lib/types';
import { Puzzle, Check, Lightbulb, ArrowRight, Layers, AlertCircle } from 'lucide-react';

interface InterdisciplinaryEdgeProps {
  data: InterdisciplinaryContext;
}

export default function InterdisciplinaryEdge({ data }: InterdisciplinaryEdgeProps) {
  if (!data) return null;

  const hasUsed = data.used && data.used.length > 0;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 transition-all hover:shadow-md">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-50 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
              <Puzzle size={16} />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">The Interdisciplinary Edge</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium ml-1">
            {data.summary}
          </p>
        </div>
        <div className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0">
          {data.tag}
        </div>
      </div>

      <div className="space-y-5">
        
        {/* SECTION A: WHAT YOU DID (USED) */}
        {hasUsed ? (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 ml-1">
              <Check size={14} className="stroke-[3px]" /> Great Connections You Made
            </div>
            {data.used!.map((link, i) => (
              <div key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 flex gap-3 items-start">
                <div className="mt-0.5 min-w-[40px] text-center">
                  <span className="block text-[9px] font-black text-emerald-600 uppercase">{link.paper}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {link.content}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1 block">
                    {link.topic}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertCircle size={12} /> No cross-connection found
            </div>
            <p className="text-xs text-slate-800 font-medium mb-1">
              Next time, try to bring in <strong>one</strong> related area (Env, Econ, Society) with a single line.
            </p>
          </div>
        )}

        {/* SECTION B: SUGGESTED (BONUS MARKS) */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <Layers size={14} /> Linkages to Boost Score (+1-2 Marks)
          </div>
          
          <div className="grid gap-2">
            {data.suggested.map((link, i) => (
              <div key={i} className="bg-blue-50/30 border border-blue-100/80 rounded-lg p-3 flex gap-3 items-start hover:bg-blue-50/60 transition-colors">
                {/* Paper Badge */}
                <div className="mt-0.5 min-w-[40px] flex flex-col items-center justify-center bg-white border border-blue-100 rounded shadow-sm py-1">
                  <span className="text-[9px] font-black text-blue-600 uppercase">{link.paper}</span>
                </div>
                
                {/* Content */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">
                      {link.topic}
                    </span>
                    <ArrowRight size={10} className="text-blue-300" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {link.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}