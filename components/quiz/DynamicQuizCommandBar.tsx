// components/quiz/DynamicQuizCommandBar.tsx
'use client';

import React, { useMemo } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- Use Zustand Store

// Import the specialized bar components
import TopicFocusBar from '@/components/quiz/TopicFocusBar';
import PerformanceAnalyticsBar from './PerformanceAnalyticsBar';
import { useRouter } from 'next/navigation';

// This component for group navigation is unchanged internally
const GroupNavigation = () => {
  const {
    questions,
    quizGroupBy,
    isGroupingEnabled,
    setIsGroupingEnabled,
    currentGroupInView,
  } = useQuizStore();

  const sortedGroups = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return [];
    const groups = Array.from(
      new Set(questions.map((q) => q[quizGroupBy]).filter(Boolean))
    ) as (string | number)[];
    if (groups.length === 0) return [];
    
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
    // --- THIS IS THE "PIXEL-PERFECT" FIX ---
    // This div no longer has any animation or position classes.
    // It's now flexible and fills the space given by the parent.
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
  const {
    isTestMode,
    showReport,
    showDetailedSolution,
    isGroupingEnabled,
    questions,
    currentQuestionNumberInView,
  } = useQuizStore();

  const currentQuestion = useMemo(() => {
    if (questions.length > 0 && currentQuestionNumberInView > 0) {
      return questions[currentQuestionNumberInView - 1];
    }
    return null;
  }, [questions, currentQuestionNumberInView]);

  // The logic for *what* to show is unchanged
  if (isTestMode) {
    return null;
  }
  if (showReport || showDetailedSolution) {
    return <PerformanceAnalyticsBar />;
  }
  if (isGroupingEnabled) {
    return <GroupNavigation />;
  }
  
  return <TopicFocusBar currentQuestion={currentQuestion} />;
};

export default DynamicQuizCommandBar;