'use client';

import { AlertCircle, PlusCircle, ThumbsUp } from 'lucide-react';
import { MentorsPenData } from '@/lib/types';

interface MicroCorrectionsProps {
  data: MentorsPenData;
}

export default function MicroCorrections({ data }: MicroCorrectionsProps) {
  // We take the first 2-3 items to show in this summary view
  const fixItems = data.redPen.slice(0, 3);
  const addItems = data.greenPen.slice(0, 3);
  const keepItems = data.bluePen.slice(0, 3);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      
      {/* FIX THESE (Red) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-[11px] font-bold text-red-600 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <AlertCircle size={14} /> Fix These
        </h3>
        <ul className="space-y-2.5">
          {fixItems.map((item, i) => (
            <li key={i} className="text-[12px] text-slate-600 leading-snug pl-3 border-l-2 border-red-100">
               {item.comment}
            </li>
          ))}
          {fixItems.length === 0 && <li className="text-[11px] text-gray-400 italic">No critical errors found.</li>}
        </ul>
      </div>

      {/* ADD THESE (Green) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-[11px] font-bold text-emerald-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <PlusCircle size={14} /> Add These
        </h3>
        <ul className="space-y-2.5">
          {addItems.map((item, i) => (
            <li key={i} className="text-[12px] text-slate-600 leading-snug pl-3 border-l-2 border-emerald-100">
               <span className="block font-medium text-slate-900 mb-0.5">
                 Use {item.arsenalId ? item.arsenalId : 'Data/Quote'}
               </span>
               {item.suggestion}
            </li>
          ))}
           {addItems.length === 0 && <li className="text-[11px] text-gray-400 italic">No additions suggested.</li>}
        </ul>
      </div>

      {/* KEEP THESE (Blue) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-[11px] font-bold text-indigo-600 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <ThumbsUp size={14} /> Keep & Reuse
        </h3>
        <ul className="space-y-2.5">
          {keepItems.map((item, i) => (
            <li key={i} className="text-[12px] text-slate-600 leading-snug pl-3 border-l-2 border-indigo-100">
               {item.comment}
            </li>
          ))}
           {keepItems.length === 0 && <li className="text-[11px] text-gray-400 italic">Nothing specific to reuse.</li>}
        </ul>
      </div>

    </section>
  );
}