'use client';

import { Database, PlusCircle, Users, Quote, FileText } from 'lucide-react';
import { TopperArsenalItem } from '@/lib/types';

interface ToppersArsenalProps {
  data: TopperArsenalItem[];
}

export default function ToppersArsenal({ data }: ToppersArsenalProps) {
  
  // Icon mapping helper
  const getIcon = (type: string) => {
    switch (type) {
      case 'data': return <Database size={18} />;
      case 'committee': return <Users size={18} />;
      case 'quote': return <Quote size={18} />;
      case 'judgment': return <FileText size={18} />; // For Polity
      default: return <Database size={18} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'data': return 'bg-green-100 text-green-600';
      case 'committee': return 'bg-orange-100 text-orange-600';
      case 'quote': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <section className="mb-6">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Database size={14} /> Topper's Arsenal
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors group cursor-pointer shadow-sm relative overflow-hidden"
          >
            {/* Hover Effect Bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-2 pl-2">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${getColor(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <button className="text-gray-300 group-hover:text-indigo-600 transition-colors">
                <PlusCircle size={18} />
              </button>
            </div>
            
            <div className="pl-2">
              <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase rounded border border-slate-100 mb-2 inline-block">
                {item.type}
              </span>
              <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-3 leading-snug">
                "{item.content}"
              </p>
              {item.source && (
                <span className="text-[10px] text-slate-400 block font-medium">— {item.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}