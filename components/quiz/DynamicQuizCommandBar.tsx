// components/quiz/DynamicQuizCommandBar.tsx
'use client';

import React, { useMemo } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- The "Data Store"
import { useQuizUIStore } from '@/lib/quizUIStore'; // <-- 💎 NEW "UI Store"
import { Question } from '@/lib/quizTypes';

// Import the specialized bar components
import TopicFocusBar from '@/components/quiz/TopicFocusBar';
import PerformanceAnalyticsBar from './PerformanceAnalyticsBar';
import { useRouter } from 'next/navigation';

// This component for group navigation is unchanged internally
const GroupNavigation = () => {
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  // We select each piece of state individually.
  // This is fast and type-safe.
  const questions = useQuizStore((state) => state.questions);
  const quizGroupBy = useQuizStore((state) => state.quizGroupBy);
  const isGroupingEnabled = useQuizStore((state) => state.isGroupingEnabled);
  const setIsGroupingEnabled = useQuizStore((state) => state.setIsGroupingEnabled);
  
  const currentGroupInView = useQuizUIStore((state) => state.currentGroupInView);
  const setCurrentGroupInView = useQuizUIStore((state) => state.setCurrentGroupInView);
  // --- 💎 --- END OF FIX --- 💎 ---

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
      setCurrentGroupInView(String(groupName)); // <-- Call UI Store action
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
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  const isTestMode = useQuizStore((state) => state.isTestMode);
  const showReport = useQuizStore((state) => state.showReport);
  const showDetailedSolution = useQuizStore((state) => state.showDetailedSolution);
  const isGroupingEnabled = useQuizStore((state) => state.isGroupingEnabled);
  const questions = useQuizStore((state) => state.questions);
    
  const currentQuestionNumberInView = useQuizUIStore(
    (state) => state.currentQuestionNumberInView
  );
  // --- 💎 --- END OF FIX --- 💎 ---

  const currentQuestion = useMemo(() => {
    if (questions.length > 0 && currentQuestionNumberInView > 0) {
      return questions[currentQuestionNumberInView - 1] as Question | null;
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