'use client';

import { CoachBlueprint as BlueprintType } from '@/lib/types';

interface CoachBlueprintProps {
  data: BlueprintType;
}

export default function CoachBlueprint({ data }: CoachBlueprintProps) {
  return (
    <div className="space-y-5 p-2">
      
      {/* 1. Introduction Block */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-full"></div>
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
            Introduction Strategy
          </h4>
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {data.introduction.strategy}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.introduction.content}
          </p>
        </div>
      </div>

      {/* 2. Body Block (Core Argument) */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-200 rounded-full"></div>
        <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
          <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">
            Core Argument
          </h4>
          <p className="text-sm font-semibold text-slate-800 mb-3">
            {data.body.coreArgument}
          </p>
          
          {data.body.keyPoints && data.body.keyPoints.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Key Dimensions</span>
              <ul className="space-y-2">
                {data.body.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-700 items-start">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. Conclusion Block */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-200 rounded-full"></div>
        <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
          <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2">
            Conclusion Strategy
          </h4>
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {data.conclusion.strategy}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.conclusion.content}
          </p>
        </div>
      </div>

    </div>
  );
}