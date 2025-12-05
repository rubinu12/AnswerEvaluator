'use client';

import { ClipboardList } from 'lucide-react';
import { QuestionDeconstruction } from '@/lib/types';

interface MarkReceiptProps {
  data: QuestionDeconstruction;
}

const StatusPill = ({ status }: { status: 'hit' | 'partial' | 'miss' }) => {
  const styles = {
    hit: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-orange-100 text-orange-700',
    miss: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function MarkReceipt({ data }: MarkReceiptProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_14px_30px_rgba(15,23,42,0.04)] mb-6">
      
      {/* Receipt Header */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ClipboardList size={14} className="text-slate-500" /> 
          Demand Map & Marks
        </h4>
        <span className="text-[10px] font-bold text-slate-400">Total Weightage: 100%</span>
      </div>

      {/* The Receipt Rows */}
      <div className="divide-y divide-slate-50">
        {data.demands.map((demand, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_90px_70px] gap-4 items-center p-4 hover:bg-slate-50/50 transition-colors">
            
            {/* Column 1: Topic, Bar, Comment */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                D{idx + 1} – {demand.topic}
              </span>
              
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    demand.status === 'hit' ? 'bg-emerald-500' : 
                    demand.status === 'partial' ? 'bg-orange-400' : 'bg-red-500'
                  }`} 
                  style={{ width: `${demand.weightage}%` }}
                ></div>
              </div>

              {/* Mentor Comment (New V2 Feature) */}
              <p className="text-[11px] text-slate-500 leading-snug">
                {demand.mentorComment}
              </p>
            </div>

            {/* Column 2: Status Badge */}
            <div className="flex justify-center">
              <StatusPill status={demand.status} />
            </div>

            {/* Column 3: Weightage Label */}
            <div className="text-center">
               <span className="text-[11px] font-bold text-slate-900 block">
                 ~ {Math.round((demand.weightage / 100) * 15 * (demand.status === 'hit' ? 0.6 : demand.status === 'partial' ? 0.4 : 0.1))} / {(demand.weightage / 100) * 15}
               </span>
               <span className="text-[10px] font-medium text-slate-400 block">
                 Marks
               </span>
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}