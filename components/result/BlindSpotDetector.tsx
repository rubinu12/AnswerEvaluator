'use client';

import { EyeOff, CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import { BlindSpotAnalysis, DimensionStatus } from '@/lib/types';

interface BlindSpotDetectorProps {
  data: BlindSpotAnalysis;
}

export default function BlindSpotDetector({ data }: BlindSpotDetectorProps) {
  
  // Count critical misses to show in the header badge
  const missCount = data.dimensions.filter(d => d.status === 'miss').length;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 tracking-wider">
          <EyeOff size={16} className="text-slate-900" /> Blind Spot Detector
        </h3>
        
        {missCount > 0 ? (
          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded border border-red-100 animate-pulse">
            {missCount} Critical {missCount === 1 ? 'Miss' : 'Misses'}
          </span>
        ) : (
          <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-1 rounded border border-green-100">
            All Angles Covered
          </span>
        )}
      </div>

      {/* Verdict Text */}
      <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
        {data.overallVerdict || "Check the dimensions below to see which perspectives you missed."}
      </p>
      
      {/* The Chips Grid */}
      <div className="flex flex-wrap gap-2.5">
        {data.dimensions.map((dim, i) => {
          const style = getDimensionStyle(dim.status);
          
          return (
            <div 
              key={i} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${style.className}`}
              title={dim.comment || dim.name}
            >
              {style.icon}
              {dim.name}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-[10px] text-slate-400 mt-4 border-t border-gray-50 pt-3 italic">
        Note: Dimensions marked in grey were not strictly required for this question. Focus on fixing the Red items.
      </p>
    </section>
  );
}

// --- HELPER: STYLES & ICONS ---
function getDimensionStyle(status: DimensionStatus) {
  switch (status) {
    case 'hit':
      return {
        className: 'bg-green-50 border-green-200 text-green-700',
        icon: <CheckCircle2 size={13} className="shrink-0" />
      };
    case 'miss':
      return {
        className: 'bg-white border-red-200 text-red-600 shadow-sm ring-1 ring-red-50',
        icon: <XCircle size={13} className="shrink-0" />
      };
    case 'partial':
      return {
        className: 'bg-orange-50 border-orange-200 text-orange-700',
        icon: <CircleDashed size={13} className="shrink-0" />
      };
    default: // 'unused' or 'not_applicable'
      return {
        className: 'bg-slate-50 border-slate-200 text-slate-400 border-dashed opacity-70',
        icon: <CircleDashed size={13} className="shrink-0" />
      };
  }
}