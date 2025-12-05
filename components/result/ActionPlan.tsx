'use client';

import { Rocket, BookOpen, PenTool } from 'lucide-react';
import { ActionPlan as ActionPlanType } from '@/lib/types';

interface ActionPlanProps {
  data: ActionPlanType;
}

export default function ActionPlan({ data }: ActionPlanProps) {
  // Guard clause if data is missing
  if (!data) return null;

  return (
    <section className="bg-slate-900 rounded-xl p-5 text-white shadow-lg overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Rocket size={18} className="text-yellow-400" />
        <h3 className="text-sm font-bold tracking-wide">Action Plan (Next 1 Hour)</h3>
      </div>

      <ul className="space-y-4 relative z-10">
        
        {/* Step 1: READ */}
        <li className="flex gap-3 items-start group">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold border border-slate-700 shrink-0 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors">
            1
          </div>
          <div className="flex-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 block flex items-center gap-1.5">
               <BookOpen size={12} /> Read
             </span>
             <p className="text-sm text-slate-200 leading-relaxed font-medium">
               {data.read}
             </p>
          </div>
        </li>

        {/* Step 2: REWRITE */}
        <li className="flex gap-3 items-start group">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold border border-slate-700 shrink-0 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-colors">
            2
          </div>
          <div className="flex-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 block flex items-center gap-1.5">
               <PenTool size={12} /> Rewrite
             </span>
             <p className="text-sm text-slate-200 leading-relaxed font-medium">
               {data.rewrite}
             </p>
          </div>
        </li>

      </ul>
    </section>
  );
}