'use client';

import { Rocket } from 'lucide-react';
import { OverallFeedback } from '@/lib/types';

interface ActionPlanProps {
  feedback: OverallFeedback;
}

export default function ActionPlan({ feedback }: ActionPlanProps) {
  const params = feedback.parameters;
  // Convert object to array for mapping
  const actionItems = Object.entries(params).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
    suggestion: value.suggestion
  }));

  return (
    <section className="bg-slate-900 rounded-xl p-5 text-white shadow-lg mb-8">
      <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
        <Rocket size={16} className="text-yellow-400" /> Strategic Action Plan
      </h4>
      
      <div className="space-y-4">
        {actionItems.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-[10px] font-bold shrink-0 text-yellow-400 border border-white/10">
              {i + 1}
            </span>
            <div className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white block mb-0.5 text-xs uppercase tracking-wide opacity-80">
                {item.label} Focus
              </strong>
              {item.suggestion}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}