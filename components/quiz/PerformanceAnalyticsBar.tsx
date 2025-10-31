// components/quiz/PerformanceAnalyticsBar.tsx
'use client';

import React from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- 1. Use Zustand Store

const PerformanceAnalyticsBar: React.FC = () => {
  // 2. Get the performanceStats from the store
  const { performanceStats } = useQuizStore();

  if (!performanceStats) {
    // This bar only shows *after* a report is generated.
    // We will implement the logic to calculate stats later.
    return (
      <div className="text-sm text-gray-500">
        Performance stats will be available after the test.
      </div>
    );
  }

  const { finalScore, accuracy, avgTimePerQuestion, pacing, maxScore } = performanceStats;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60); // Round seconds
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  const getPacingColor = () => {
    if (pacing === 'Behind') return 'text-red-600';
    if (pacing === 'Ahead') return 'text-green-600';
    return 'text-gray-800';
  };
  
  const getAccuracyColor = () => {
    if (accuracy > 75) return 'text-green-600';
    if (accuracy < 40) return 'text-red-600';
    return 'text-yellow-600';
  }

  const Metric = ({
    label,
    value,
    valueClassName = '',
  }: {
    label: string;
    value: string | number;
    valueClassName?: string;
  }) => (
    <div className="text-center px-4">
      <div className="text-xs text-gray-600 mb-0.5">{label}</div>
      <div className={`text-lg font-bold text-gray-800 ${valueClassName}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-around w-full">
      <Metric
        label="Final Score"
        value={finalScore.toFixed(2)}
        valueClassName={finalScore > (maxScore * 0.4) ? 'text-green-600' : 'text-red-600'}
      />
      <Metric
        label="Accuracy"
        value={`${accuracy}%`}
        valueClassName={getAccuracyColor()}
      />
      <Metric label="Avg. Time / Q" value={formatTime(avgTimePerQuestion)} />
      <Metric label="Pacing" value={pacing} valueClassName={getPacingColor()} />
    </div>
  );
};

export default PerformanceAnalyticsBar;