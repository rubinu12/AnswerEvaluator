"use client";

import React, { useMemo } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // 1. Use the new Zustand store

const PerformanceAnalyticsBar: React.FC = () => {
    // 2. Select the raw data needed for calculations from the store
    const { questions, userAnswers, initialTime, timeLeft } = useQuizStore();

    // 3. Perform all performance calculations here, wrapped in useMemo for efficiency
    const performanceStats = useMemo(() => {
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const incorrectCount = userAnswers.length - correctCount;
        const totalQuestions = questions.length;
        
        // UPSC Scoring Logic
        const marksForCorrect = correctCount * 2;
        const marksDeducted = incorrectCount * (2 / 3);
        const finalScore = marksForCorrect - marksDeducted;
        
        const accuracy = userAnswers.length > 0 ? Math.round((correctCount / userAnswers.length) * 100) : 0;
        
        const totalTimeTaken = initialTime - timeLeft;
        const avgTimePerQuestion = userAnswers.length > 0 ? Math.round(totalTimeTaken / userAnswers.length) : 0;
        
        // Pacing logic (based on 72 seconds per question)
        let pacing = 'On Track';
        if (avgTimePerQuestion > 72) pacing = 'Behind';
        if (avgTimePerQuestion < 65) pacing = 'Ahead'; // Give a small buffer

        return { finalScore, accuracy, avgTimePerQuestion, pacing, maxScore: totalQuestions * 2 };
    }, [questions, userAnswers, initialTime, timeLeft]);


    // All the original UI and helper functions are preserved below
    const { finalScore, accuracy, avgTimePerQuestion, pacing, maxScore } = performanceStats;

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === 0) return '0s';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m > 0 ? `${m}m ` : ''}${s}s`;
    };

    const getPacingColor = () => {
        if (pacing === 'Behind') return 'text-red-600';
        if (pacing === 'Ahead') return 'text-green-600';
        return 'text-gray-800';
    };

    const Metric = ({ label, value, valueClassName = '' }: { label: string, value: string | number, valueClassName?: string }) => (
        <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">{label}</div>
            <div className={`text-lg font-bold text-gray-800 ${valueClassName}`}>{value}</div>
        </div>
    );

    return (
        <div className="flex items-center justify-around w-full">
            <Metric label="Final Score" value={finalScore.toFixed(2)} valueClassName={finalScore > (maxScore * 0.4) ? 'text-green-600' : 'text-red-600'} />
            <Metric label="Accuracy" value={`${accuracy}%`} valueClassName={accuracy > 75 ? 'text-green-600' : accuracy < 40 ? 'text-red-600' : 'text-yellow-600'} />
            <Metric label="Avg. Time / Q" value={formatTime(avgTimePerQuestion)} />
            <Metric label="Pacing" value={pacing} valueClassName={getPacingColor()} />
        </div>
    );
};

export default PerformanceAnalyticsBar;
