'use client';

import { EyeOff, CheckCircle2, XCircle, CircleDashed, AlertCircle } from 'lucide-react';
import { BlindSpotAnalysis } from '@/lib/types';

// 1. Define the type locally to fix the import error and allow UI flexibility
type DimensionStatus = 'hit' | 'miss' | 'partial' | 'unused';

interface BlindSpotDetectorProps {
  data: BlindSpotAnalysis;
}

export default function BlindSpotDetector({ data }: BlindSpotDetectorProps) {
  
  // 2. Count critical misses for the badge
  // We explicitly cast to allow for future expansion if backend sends other statuses
  const missCount = data.dimensions.filter(d => (d.status as DimensionStatus) === 'miss').length;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
          <EyeOff size={16} className="text-slate-900" /> Blind Spot Detector
        </h3>
        
        {missCount > 0 ? (
          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded border border-red-100 flex items-center gap-1 animate-pulse">
            <AlertCircle size={12} />
            {missCount} Critical {missCount === 1 ? 'Miss' : 'Misses'}
          </span>
        ) : (
          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 size={12} />
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
          // 3. We use 'as DimensionStatus' to satisfy TypeScript because 
          // types.ts currently says status is always 'miss'.
          // This allows the UI code to be "smarter" than the current backend.
          const status = dim.status as DimensionStatus;
          const style = getDimensionStyle(status);
          
          return (
            <div 
              key={i} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${style.className}`}
              title={dim.comment || dim.name}
            >
              {style.icon}
              {dim.name}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-[10px] text-slate-400 mt-4 border-t border-gray-50 pt-3 italic flex items-center gap-1">
        <CircleDashed size={10} />
        Note: Focus on fixing the Red items to improve your score.
      </p>
    </section>
  );
}

// --- HELPER: STYLES & ICONS (Matches v21.html aesthetics) ---
function getDimensionStyle(status: DimensionStatus) {
  switch (status) {
    case 'hit':
      return {
        className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        icon: <CheckCircle2 size={13} className="shrink-0" />
      };
    case 'miss':
      return {
        className: 'bg-red-50 border-red-200 text-red-700 shadow-sm',
        icon: <XCircle size={13} className="shrink-0" />
      };
    case 'partial':
      return {
        className: 'bg-orange-50 border-orange-200 text-orange-700',
        icon: <CircleDashed size={13} className="shrink-0" />
      };
    case 'unused':
    default: 
      return {
        className: 'bg-slate-50 border-slate-200 text-slate-400 border-dashed opacity-80',
        icon: <CircleDashed size={13} className="shrink-0" />
      };
  }
}