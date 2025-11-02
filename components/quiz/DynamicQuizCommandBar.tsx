// components/quiz/DynamicQuizCommandBar.tsx
'use client';

import React, { useMemo } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- 1. Use Zustand Store

// Import the specialized bar components
import TopicFocusBar from '@/components/quiz/TopicFocusBar';
import PerformanceAnalyticsBar from './PerformanceAnalyticsBar';
import { useRouter } from 'next/navigation';

// This is the component for the group navigation links (for subject-wise practice)
// This is YOUR component, restored.
const GroupNavigation = () => {
  // 3. Get ALL data from our Zustand store
  const {
    questions,
    quizGroupBy,
    isGroupingEnabled,
    setIsGroupingEnabled,
    currentGroupInView, // We'll use this to highlight the active group
  } = useQuizStore();

  const sortedGroups = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return [];
    const groups = Array.from(
      new Set(questions.map((q) => q[quizGroupBy]).filter(Boolean))
    ) as (string | number)[];
    if (groups.length === 0) return [];
    
    // Sort logic: Years descending, Topics ascending
    const isNumeric = !isNaN(Number(groups[0]));
    return groups.sort((a, b) =>
      isNumeric
        ? Number(b) - Number(a)
        : String(a).localeCompare(String(b))
    );
  }, [questions, quizGroupBy, isGroupingEnabled]);

  const scrollToGroup = (groupName: string | number) => {
    const groupElement = document.getElementById(`group-${groupName}`);
    if (groupElement) {
      groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // The ToggleSwitch component, moved here to be self-contained
  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
      />
    </button>
  );

  return (
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600">Group:</span>
        <ToggleSwitch enabled={isGroupingEnabled} onChange={setIsGroupingEnabled} />
      </div>
      <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap h-full">
        {sortedGroups.map((group) => (
          <React.Fragment key={group}>
            <div className="border-l border-gray-300 h-4"></div>
            <button
              onClick={() => scrollToGroup(group)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                currentGroupInView === String(group)
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'text-gray-600 hover:text-blue-600 font-semibold'
              }`}
            >
              {group}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// The main controller component
const DynamicQuizCommandBar: React.FC = () => {
  // 4. Get all data from our Zustand store
  const {
    isTestMode,
    showReport,
    showDetailedSolution,
    isGroupingEnabled,
    questions,
    currentQuestionNumberInView,
    isTopBarVisible, // --- 1. GET isTopBarVisible ---
  } = useQuizStore();

  // Determine the currently visible question to pass to the TopicFocusBar
  const currentQuestion = useMemo(() => {
    if (questions.length > 0 && currentQuestionNumberInView > 0) {
      // Adjust for 0-based index
      return questions[currentQuestionNumberInView - 1];
    }
    return null;
  }, [questions, currentQuestionNumberInView]);

  let content = null;
  
  // This is YOUR original logic, restored.
  if (isTestMode) {
    return null;
  }
  if (showReport || showDetailedSolution) {
    content = <PerformanceAnalyticsBar />;
  }
  else if (isGroupingEnabled) {
    content = <GroupNavigation />;
  } else {
    content = <TopicFocusBar currentQuestion={currentQuestion} />;
  }
  
  // --- 2. THIS IS THE "PIXEL-PERFECT" FIX ---
  // We use `isTopBarVisible` to slide this bar *down* into view
  // It is sticky at `top-0` with a lower `z-index` (20)
  // When the main header (z-30) slides up, this slides down to take its place.
  return (
    <div 
      className={`sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-20
        transition-transform duration-300 ease-in-out
        ${isTopBarVisible ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="flex items-center justify-between max-w-full mx-auto px-6 h-[52px] gap-4">
        {content}
      </div>
    </div>
  );
};

export default DynamicQuizCommandBar;

