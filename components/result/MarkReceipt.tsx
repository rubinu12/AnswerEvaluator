'use client';

import { ClipboardCheck } from 'lucide-react';
import { QuestionDeconstruction } from '@/lib/types';

interface MarkReceiptProps {
  data: QuestionDeconstruction;
}

const StatusPill = ({ status }: { status: 'hit' | 'partial' | 'miss' }) => {
  const styles = {
    hit: 'bg-green-100 text-green-700 border-green-200',
    partial: 'bg-orange-100 text-orange-700 border-orange-200',
    miss: 'bg-red-100 text-red-700 border-red-200'
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function MarkReceipt({ data }: MarkReceiptProps) {
  return (
    <section className="px-6 py-5 border-b border-gray-100 bg-slate-50/50">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <ClipboardCheck size={14} /> Mark Breakdown
        </h4>
        <span className="text-[10px] font-bold text-slate-400">Total Weightage: 100%</span>
      </div>

      {/* The Receipt Rows */}
      <div className="space-y-3">
        {data.demands.map((demand, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_80px_60px] gap-4 items-center">
            
            {/* Column 1: Topic & Bar */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 mb-1.5 truncate" title={demand.topic}>
                {demand.topic}
              </span>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    demand.status === 'hit' ? 'bg-green-500' : 
                    demand.status === 'partial' ? 'bg-orange-400' : 'bg-red-500'
                  }`} 
                  style={{ width: `${demand.weightage}%` }}
                ></div>
              </div>
            </div>

            {/* Column 2: Weightage Label */}
            <span className="text-[10px] font-medium text-gray-500 text-right">
              {demand.weightage}% Weight
            </span>

            {/* Column 3: Status Badge */}
            <div className="text-right">
              <StatusPill status={demand.status} />
            </div>
            
          </div>
        ))}
      </div>
      
      {/* Optional: Directive Feedback Footer */}
      {data.directive && (
        <div className="mt-4 pt-3 border-t border-gray-200/50 text-[10px] text-slate-500 flex justify-between">
            <span>Directive: <strong>{data.directive.verb}</strong></span>
            <span className={`${data.directive.fulfillment === 'met' ? 'text-green-600' : 'text-red-500 font-semibold'}`}>
                {data.directive.fulfillment === 'met' ? 'Directive Followed ✅' : 'Directive Ignored ⚠️'}
            </span>
        </div>
      )}
    </section>
  );
}