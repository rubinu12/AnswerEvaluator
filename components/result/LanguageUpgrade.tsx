'use client';

import React from 'react'; // Import React to use React.Fragment
import { Languages } from 'lucide-react';
import { VocabularySwap } from '@/lib/types';

interface LanguageUpgradeProps {
  data: VocabularySwap[];
}

export default function LanguageUpgrade({ data }: LanguageUpgradeProps) {
  if (!data || data.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Languages size={14} className="text-slate-900" /> Language Upgrade
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        {/* Header Row (Hidden on mobile, shown on desktop) */}
        <div className="hidden sm:block bg-slate-50 p-3 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
          You Wrote (Generic)
        </div>
        <div className="hidden sm:block bg-slate-50 p-3 text-[10px] font-bold uppercase text-slate-800 border-b border-slate-100 border-l border-slate-100">
          Topper Writes (Precise)
        </div>

        {/* Rows */}
        {data.map((item, i) => (
          <React.Fragment key={i}>
            {/* Cell 1: Original */}
            <div className={`p-3 text-xs text-slate-500 border-b border-slate-100 ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>
              <span className="sm:hidden block text-[10px] font-bold uppercase text-slate-300 mb-1">Original</span>
              "{item.original}"
            </div>

            {/* Cell 2: Replacement */}
            <div className={`p-3 text-xs font-semibold text-indigo-900 border-b border-slate-100 sm:border-l sm:border-slate-100 ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>
               <span className="sm:hidden block text-[10px] font-bold uppercase text-indigo-300 mb-1">Better</span>
               "{item.replacement}"
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}