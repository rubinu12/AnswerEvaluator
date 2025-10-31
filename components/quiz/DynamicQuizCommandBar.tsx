"use client";

import React, { useMemo } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // 1. Use the new Zustand store

// Import the specialized bar components
import TopicFocusBar from '@/components/quiz/TopicFocusBar';
import PerformanceAnalyticsBar from './PerformanceAnalyticsBar';

// This is the component for the group navigation links, now connected to the store
const GroupNavigation = () => {
    // 2. Select the necessary state and actions from the store
    const { questions, isGroupingEnabled, setIsGroupingEnabled } = useQuizStore();
    
    // The logic for sorting groups is preserved
    const sortedGroups = useMemo(() => {
        // We will group by 'subject' for now. This can be made dynamic later.
        const quizGroupBy = 'subject';
        if (!isGroupingEnabled) return [];

        const groups = Array.from(new Set(questions.map(q => q[quizGroupBy]).filter(Boolean))) as (string | number)[];
        if (groups.length === 0) return [];
        
        const isNumeric = !isNaN(Number(groups[0]));
        return groups.sort((a, b) => isNumeric ? Number(b) - Number(a) : String(a).localeCompare(String(b)));
    }, [questions, isGroupingEnabled]);

    const scrollToGroup = (groupName: string | number) => {
        // This logic remains the same
        const groupElement = document.getElementById(`group-${groupName}`);
        if (groupElement) {
            groupElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // The ToggleSwitch component remains the same
    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (enabled: boolean) => void }) => (
        <button
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    );

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
                <ToggleSwitch enabled={isGroupingEnabled} onChange={setIsGroupingEnabled} />
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                {sortedGroups.map(group => (
                    <React.Fragment key={group}>
                        <div className="border-l border-gray-300 h-4"></div>
                        <button onClick={() => scrollToGroup(group)} className="text-gray-600 hover:text-blue-600 font-semibold px-2">{group}</button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


// The main controller component, now refactored
const DynamicQuizCommandBar: React.FC = () => {
    // 3. Select all state needed for logic from the store
    const {
        mode,
        isGroupingEnabled,
        questions,
        currentQuestionInView
    } = useQuizStore();

    const currentQuestion = useMemo(() => {
        if (questions.length > 0) {
            return questions[currentQuestionInView];
        }
        return null;
    }, [questions, currentQuestionInView]);

    // In Test Mode, render nothing.
    if (mode === 'test') {
        return null;
    }

    // In Review Mode, render the performance analytics.
    if (mode === 'review') {
        return <PerformanceAnalyticsBar />;
    }

    // In Practice Mode, decide which bar to show based on the toggle.
    if (isGroupingEnabled) {
        return <GroupNavigation />;
    } else {
        return <TopicFocusBar currentQuestion={currentQuestion} />;
    }
};

export default DynamicQuizCommandBar;