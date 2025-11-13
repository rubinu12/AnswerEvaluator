// components/quiz/DynamicQuizCommandBar.tsx
"use client";

import Image from 'next/image';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';

// --- INLINE ICONS ---
// (These are from your file)

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 2v6h6M21 22v-6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

// --- STYLED COMPONENTS ---
// (These are from your file)

const IconButton = ({ onClick, children, className = '' }: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {children}
  </button>
);

const StyledButton = ({ onClick, children, variant = 'primary', className = '' }: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  className?: string;
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm';
  const primaryClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  const outlineClasses = 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variant === 'primary' ? primaryClasses : outlineClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// --- HELPER FUNCTION (NEW) ---
/**
 * Formats seconds into a "m:ss" string.
 * e.g., 95 seconds -> "1:35"
 */
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
// --- END OF HELPER ---


export default function DynamicQuizCommandBar() {
  // --- STATE ---
  const isTopBarVisible = useQuizUIStore(s => s.isTopBarVisible);
  const setIsTopBarVisible = useQuizUIStore(s => s.setIsTopBarVisible);

  const showReport = useQuizStore(s => s.showReport);
  const questions = useQuizStore(s => s.questions);
  const currentQuestionNumberInView = useQuizUIStore(s => s.currentQuestionNumberInView);
  
  const stats = useQuizStore(s => s.performanceStats);

  const questionInView = questions[currentQuestionNumberInView - 1] || questions[0];
  const subject = questionInView?.subject || 'Loading...';
  const topic = questionInView?.topic || 'Loading...';

  // --- RENDER ---
  const barClasses = [
    'fixed left-0 right-0 z-10 flex w-full items-center border-b border-gray-200 bg-white px-6 transition-all duration-300 ease-in-out',
    'h-16', 
    isTopBarVisible ? 'top-16' : 'top-0 shadow-md'
  ].join(' ');

  const arrowClasses = [
    'h-5 w-5 text-gray-600 transition-transform duration-300',
    isTopBarVisible ? 'rotate-0' : 'rotate-180'
  ].join(' ');
  
  // --- PACING COLOR LOGIC ---
  const paceColor = {
    "Ahead": "text-green-600",
    "On Pace": "text-gray-800",
    "Behind": "text-red-600",
  }[stats?.pacing || "On Pace"];

  return (
    <div className={barClasses}>
      {/* 1. The Arrow Button */}
      <IconButton
        className="mr-2"
        onClick={() => setIsTopBarVisible(!isTopBarVisible)}
      >
        <ChevronUpIcon className={arrowClasses} />
      </IconButton>

      {/* 2. Mode-Dependent Content */}
      <div className="flex flex-1 items-center justify-between">
        {!showReport ? (
          // --- Practice Mode Content (Unchanged) ---
          <>
            <div>
              <span className="text-xs font-medium uppercase text-blue-600">
                {subject}
              </span>
              <h2 className="truncate text-lg font-semibold text-gray-800">
                {topic}
              </h2>
            </div>
            <StyledButton variant="outline" className="flex items-center">
              <RefreshIcon className="mr-2 h-4 w-4" />
              Practice this topic
            </StyledButton>
          </>
        ) : (
          // --- 💎 --- REVIEW MODE CONTENT (FIXED) --- 💎 ---
          <div className="flex w-full items-center justify-around space-x-4">
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Score</span>
              <h2 className="text-lg font-semibold text-blue-600">
                {/* This is the fix: 'score' -> 'finalScore' */}
                {stats?.finalScore ?? 0}%
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Accuracy</span>
              <h2 className="text-lg font-semibold text-gray-800">
                {stats?.accuracy ?? 0}%
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Avg. Time</span>
              <h2 className="text-lg font-semibold text-gray-800">
                {formatTime(stats?.avgTimePerQuestion ?? 0)}
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Pacing</span>
              <h2 className={`text-lg font-semibold ${paceColor}`}>
                {stats?.pacing ?? 'On Pace'}
              </h2>
            </div>
          </div>
          // --- 💎 --- END OF FIX --- 💎 ---
        )}
      </div>
    </div>
  );
}