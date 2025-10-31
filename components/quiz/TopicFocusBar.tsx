"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/quizTypes';

// A helper function to create URL-friendly strings
const slugify = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
};

interface TopicFocusBarProps {
    currentQuestion: Question | null;
}

const TopicFocusBar: React.FC<TopicFocusBarProps> = ({ currentQuestion }) => {
    const router = useRouter(); // 1. Use the Next.js router for navigation

    if (!currentQuestion) {
        return null;
    }

    // 2. Our new Question type doesn't have 'exam', so we use the fields we have
    const { subject, topic, type } = currentQuestion;

    const handlePracticeTopic = () => {
        if (topic) {
            // 3. Navigate to a new quiz page, filtered by the current topic.
            // This reuses our existing dynamic page route.
            router.push(`/practice/${type}/topic/${slugify(topic)}`);
        }
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
                <span className="font-semibold text-gray-800 flex-shrink-0">{subject}</span>
                {topic && (
                    <>
                        <i className="ri-arrow-right-s-line"></i>
                        <span className="text-gray-500 truncate">{topic}</span>
                    </>
                )}
            </div>
            {topic && (
                <button
                    onClick={handlePracticeTopic}
                    className="btn flex-shrink-0 ml-4 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-200"
                >
                    Practice this Topic
                </button>
            )}
        </div>
    );
};

export default TopicFocusBar;
