'use client';

import { Languages } from 'lucide-react';
import { VocabularySwap } from '@/lib/types';

interface LanguageUpgradeProps {
  data: VocabularySwap[];
}

export default function LanguageUpgrade({ data }: LanguageUpgradeProps) {
  if (!data || data.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
        <Languages size={14} /> Language Upgrade
      </h3>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden grid grid-cols-2 text-sm">
        {/* Header */}
        <div className="bg-slate-50 p-2 text-[10px] font-bold uppercase text-slate-400 border-b border-r border-gray-200">
          You Wrote (Generic)
        </div>
        <div className="bg-slate-50 p-2 text-[10px] font-bold uppercase text-indigo-600 border-b border-gray-200">
          Topper Writes (Precise)
        </div>
        
        {/* Rows */}
        {data.map((swap, i) => (
          <div key={i} className="contents group">
            <div className="p-3 border-b border-r border-gray-100 text-slate-500 bg-white group-last:border-b-0">
              "{swap.original}"
            </div>
            <div className="p-3 border-b border-gray-100 text-slate-800 font-semibold bg-indigo-50/10 group-last:border-b-0">
              "{swap.replacement}"
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}