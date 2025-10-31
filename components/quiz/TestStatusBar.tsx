"use client";

import React from "react";
import { useQuizStore } from "@/lib/quizStore"; // 1. Use the new Zustand store

const Timer = () => {
    // 2. Select the necessary timer state and actions from the store
    const { initialTime, timeLeft, submitTest } = useQuizStore();

    // The timer logic itself is now handled inside the Zustand store,
    // so this component is only responsible for displaying the time.

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const timePercentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

    let barColor = 'bg-green-500';
    if (timePercentage < 50) barColor = 'bg-yellow-500';
    if (timePercentage < 20) barColor = 'bg-red-500';

    return (
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-64">
            <div className="flex justify-between items-center mb-1 px-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <i className="ri-timer-line text-green-500"></i>
                    Time Left
                </div>
                <span className={`font-bold text-lg ${barColor.replace("bg-", "text-")}`}>{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-linear`} style={{ width: `${timePercentage}%` }}></div>
            </div>
        </div>
    );
};


const TestStatusBar = () => {
    const { submitTest } = useQuizStore();

    return (
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-40">
            <div className="p-2 flex items-center justify-between max-w-full mx-auto px-6 h-16">
                <h2 className="text-lg font-bold text-gray-800">Test in Progress</h2>
                <div className="flex items-center gap-4">
                    <Timer />
                    <button onClick={submitTest} className="btn px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">
                        Submit Test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestStatusBar;