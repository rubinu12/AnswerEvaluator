'use client';

import { Info } from 'lucide-react';
import { DirectiveAnalysis, TopicTree } from '@/lib/types';

interface DirectiveTopicStripProps {
  directiveLabel: string;
  directive: DirectiveAnalysis;
  topicTree: TopicTree;
}

export default function DirectiveTopicStrip({ directiveLabel, directive, topicTree }: DirectiveTopicStripProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        
        {/* LEFT: Directive */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Directive & Topic
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-50 text-[10px] font-bold uppercase tracking-wide">
              {directiveLabel}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">{directive.verb}</span> → {directive.description}
          </p>
        </div>

        {/* RIGHT: Topic Tree */}
        <div className="text-left md:text-right">
          <div className="font-semibold text-slate-900 mb-2 tracking-wide text-[11px]">
            Topic Tree
          </div>
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {/* Main Topic Pill */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold shadow-sm">
              {topicTree.mainTopic}
            </span>
            
            {/* Sub Topics Chips */}
            {topicTree.subTopics.map((topic, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-sm hover:translate-y-[-1px] transition-transform">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Warning if Directive Missed */}
      {directive.fulfillment === 'missed' && (
        <div className="mt-3 text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 flex items-start gap-2">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            You treated this largely as a descriptive essay. UPSC expects a specific 
            <span className="font-semibold"> {directive.verb}</span> approach here.
          </span>
        </div>
      )}
    </section>
  );
}