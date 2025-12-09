'use client';

import { 
  Database, 
  PlusCircle, 
  Users, 
  Scale, 
  BookOpen, 
  BarChart3, 
  Copy 
} from 'lucide-react';
import { ContentInjection } from '@/lib/types';
import { useState } from 'react';

interface ToppersArsenalProps {
  data: ContentInjection[];
}

export default function ToppersArsenal({ data = [] }: ToppersArsenalProps) {
  // If no injections, don't render the section
  if (!data || data.length === 0) return null;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  // Icon & Color Helper
  const getStyle = (type: string) => {
    switch (type) {
      case 'data': return { icon: <BarChart3 size={18} />, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
      case 'case': return { icon: <Scale size={18} />, color: 'bg-orange-100 text-orange-600 border-orange-200' };
      case 'committee': return { icon: <Users size={18} />, color: 'bg-blue-100 text-blue-600 border-blue-200' };
      case 'law': return { icon: <BookOpen size={18} />, color: 'bg-purple-100 text-purple-600 border-purple-200' };
      default: return { icon: <Database size={18} />, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <section className="mb-8">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Database size={14} /> 
        Topper's Arsenal (Missed Opportunities)
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
          {data.length}
        </span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, i) => {
          const style = getStyle(item.type);
          return (
            <div 
              key={i} 
              className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.color}`}>
                  {style.icon}
                </div>
                
                {/* Copy Button */}
                <button 
                  onClick={() => handleCopy(item.injectionContent, i)}
                  className="text-slate-300 hover:text-indigo-600 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === i ? (
                    <span className="text-xs font-bold text-emerald-600">Copied!</span>
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded border border-slate-100">
                    {item.type}
                  </span>
                  {item.source && (
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                      — {item.source}
                    </span>
                  )}
                </div>
                
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {item.injectionContent.replace(/^Insert:\s*/i, '')}
                </p>
                
                {/* Context Hint */}
                {item.locationInAnswer && (
                  <p className="mt-2 text-[11px] text-slate-400 italic border-l-2 border-slate-100 pl-2">
                    Relevant to: "...{item.locationInAnswer.substring(0, 40)}..."
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}