// components/quiz/TestStatusBar.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // 1. Use our Zustand Store

// --- The Timer logic now lives here ---
const Timer = () => {
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  // We select each piece of state atomically to prevent
  // the "getSnapshot" infinite loop.
  const totalTime = useQuizStore((state) => state.totalTime);
  const timeLeft = useQuizStore((state) => state.timeLeft);
  const setTimeLeft = useQuizStore((state) => state.setTimeLeft);
  const submitTest = useQuizStore((state) => state.submitTest);
  const showToast = useQuizStore((state) => state.showToast);
  // --- 💎 --- END OF FIX --- 💎 ---
    
  // This ref tracks which notifications we've already sent
  const notificationFlags = useRef({ half: false, ten: false, one: false });

  useEffect(() => {
    // 3. Start the timer logic
    if (timeLeft <= 0) {
      submitTest(); // Time's up!
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1); // Decrement time
    }, 1000);

    // 4. Notification Logic (as you wanted)
    const halfTime = totalTime / 2;
    if (timeLeft <= halfTime && !notificationFlags.current.half) {
      showToast('Half of the time has passed!', 'info');
      notificationFlags.current.half = true;
    }
    if (timeLeft <= 600 && !notificationFlags.current.ten) {
      // 10 minutes
      showToast('10 minutes remaining.', 'warning');
      notificationFlags.current.ten = true;
    }
    if (timeLeft <= 60 && !notificationFlags.current.one) {
      // 1 minute
      showToast('1 minute remaining!', 'warning');
      notificationFlags.current.one = true;
    }

    return () => clearInterval(intervalId); // Clean up the interval
  }, [timeLeft, setTimeLeft, submitTest, totalTime, showToast]);
  
  // Reset notification flags if the test restarts
  useEffect(() => {
    notificationFlags.current = { half: false, ten: false, one: false };
  }, [totalTime])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // 5. Logic for the progress bar color
  const timePercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
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
        <span
          className={`font-bold text-lg ${barColor.replace('bg-', 'text-')}`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Main Status Bar Component ---
const TestStatusBar = () => {
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  const isTestMode = useQuizStore((state) => state.isTestMode);
  const submitTest = useQuizStore((state) => state.submitTest);
  // --- 💎 --- END OF FIX --- 💎 ---

  // 7. If not in Test Mode, render nothing.
  if (!isTestMode) {
    return null;
  }

  // 8. If in Test Mode, show the bar, timer, and submit button
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-40">
      <div className="p-2 flex items-center justify-between max-w-full mx-auto px-6 h-[69px]">
        <h2 className="text-lg font-bold text-gray-800">Test in Progress</h2>
        <div className="flex items-center gap-4">
          <Timer />
          <button
            onClick={submitTest}
            className="btn px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestStatusBar;