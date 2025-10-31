"use client";

import { useState } from 'react';

// Mock Data for the Gauges
const performanceData = {
  week: [
    { id: 'GS-I', score: 6.8, improvement: 0.8, rating: 'Good' },
    { id: 'GS-II', score: 7.2, improvement: 1.2, rating: 'Good' },
    { id: 'GS-III', score: 4.5, improvement: -0.3, rating: 'Average' },
    { id: 'GS-IV', score: 8.1, improvement: 0.5, rating: 'Excellent' },
    { id: 'Essay', score: 6.0, improvement: 0.0, rating: 'Good' },
    { id: 'Optional', score: 7.8, improvement: 1.5, rating: 'Excellent' },
  ],
  month: [
    { id: 'GS-I', score: 7.5, improvement: 1.5, rating: 'Excellent' },
    { id: 'GS-II', score: 6.5, improvement: 0.5, rating: 'Good' },
    { id: 'GS-III', score: 5.2, improvement: 0.0, rating: 'Average' },
    { id: 'GS-IV', score: 8.5, improvement: 0.9, rating: 'Excellent' },
    { id: 'Essay', score: 7.0, improvement: 1.0, rating: 'Good' },
    { id: 'Optional', score: 7.9, improvement: 1.6, rating: 'Excellent' },
  ],
};

export default function PerformanceGauges() {
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const data = performanceData[period];

  const getRatingClass = (rating: string) => {
    if (rating === 'Excellent') return 'from-emerald-400 to-green-500';
    if (rating === 'Good') return 'from-amber-400 to-orange-500';
    return 'from-red-500 to-rose-600'; // Average
  };

  return (
    // [FIX] Card padding is now responsive
    <div className="bg-white p-4 xs:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/60">
      {/* [FIX] Header items will wrap on the smallest screens */}
      <div className="flex justify-between items-center flex-wrap gap-y-4">
        {/* [FIX] Title font size is responsive */}
        <h2 className="text-lg xs:text-xl font-bold text-gray-800">Performance Snapshot</h2>
        {/* [FIX] Period selector buttons are smaller */}
        <div className="flex items-center bg-slate-100/80 rounded-full p-1 text-xs xs:text-sm">
          <button onClick={() => setPeriod('week')} className={`px-3 xs:px-4 py-1 xs:py-1.5 font-semibold rounded-full ${period === 'week' ? 'bg-white shadow' : 'text-gray-500'}`}>Week</button>
          <button onClick={() => setPeriod('month')} className={`px-3 xs:px-4 py-1 xs:py-1.5 font-semibold rounded-full ${period === 'month' ? 'bg-white shadow' : 'text-gray-500'}`}>Month</button>
        </div>
      </div>

      {/* [FIX] Gap between bars is now responsive */}
      <div className="mt-8 grid grid-cols-6 gap-x-2 xs:gap-x-4 md:gap-x-6 text-center">
        {data.map(subject => {
          const improvementColor = subject.improvement > 0 ? 'text-green-500' : subject.improvement < 0 ? 'text-red-500' : 'text-gray-400';
          const improvementSign = subject.improvement > 0 ? '+' : '';

          return (
            <div key={subject.id} className="flex flex-col items-center justify-end">
              {/* [FIX] Gauge bar is now thinner and shorter on small screens */}
              <div className="w-6 h-32 xs:w-8 md:w-10 xs:h-36 md:h-40 bg-slate-100 rounded-full flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-full bg-gradient-to-t ${getRatingClass(subject.rating)} transition-all duration-700 ease-out`}
                  style={{ height: `${subject.score * 10}%` }}
                ></div>
              </div>
              {/* [FIX] Text below bars is smaller and more compact */}
              <p className="mt-3 font-bold text-gray-700 text-xs md:text-sm">{subject.id}</p>
              <p className="text-[10px] xs:text-xs text-gray-500 mt-0.5">{subject.score.toFixed(1)}/10</p>
              <p className={`text-[10px] xs:text-xs font-semibold ${improvementColor}`}>
                {improvementSign}{subject.improvement.toFixed(1)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}