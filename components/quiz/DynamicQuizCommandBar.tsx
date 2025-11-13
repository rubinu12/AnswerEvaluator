// components/quiz/DynamicQuizCommandBar.tsx
"use client";

import Image from 'next/image';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';

// --- INLINE ICONS ---
// We include these here to be self-contained

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
// We include these here to be self-contained

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
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
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


/**
 * This is the new "Sub-Header" component.
 * It animates its position from `top-20` (below main header) to `top-0` (stuck)
 * based on the `isTopBarVisible` state from the scroll listener.
 * It also renders different content based on Practice vs. Review mode.
 */
export default function DynamicQuizCommandBar() {
  // --- STATE ---
  // UI State (Atomic selectors)
  const isTopBarVisible = useQuizUIStore(s => s.isTopBarVisible);
  const setIsTopBarVisible = useQuizUIStore(s => s.setIsTopBarVisible);

  // Data State (Atomic selectors)
  const showReport = useQuizStore(s => s.showReport);
  const questions = useQuizStore(s => s.questions);
  const currentQuestionNumberInView = useQuizUIStore(s => s.currentQuestionNumberInView);

  // Get the question based *only* on the scrolled question in view.
  // We provide a fallback to the first question (index 0) if it's not ready.
  const questionInView = questions[currentQuestionNumberInView - 1] || questions[0];

  const subject = questionInView?.subject || 'Loading...';
  const topic = questionInView?.topic || 'Loading...';

  // --- RENDER ---
  
  // This is the core "stick" animation.
  const barClasses = [
    'fixed left-0 right-0 z-10 flex h-20 w-full items-center border-b border-gray-200 bg-white px-6 transition-all duration-300 ease-in-out',
    isTopBarVisible ? 'top-20' : 'top-0 shadow-md'
  ].join(' ');

  // This animates the arrow button itself
  const arrowClasses = [
    'h-5 w-5 text-gray-600 transition-transform duration-300',
    isTopBarVisible ? 'rotate-0' : 'rotate-180'
  ].join(' ');

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
          // --- Practice Mode Content ---
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
          // --- Review Mode Content ---
          // This is the NEW logic with PLACEHOLDERS
          <div className="flex w-full items-center justify-around space-x-4">
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Score</span>
              <h2 className="text-lg font-semibold text-blue-600">
                [Score]%
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Accuracy</span>
              <h2 className="text-lg font-semibold text-gray-800">
                [Acc]%
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Avg. Time</span>
              <h2 className="text-lg font-semibold text-gray-800">
                [Time]
              </h2>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium uppercase text-gray-500">Pacing</span>
              <h2 className="text-lg font-semibold text-green-600">
                [Pace]
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}