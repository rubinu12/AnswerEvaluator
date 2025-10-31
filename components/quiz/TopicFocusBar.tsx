// components/quiz/TopicFocusBar.tsx
'use client';

import React from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- 1. Use Zustand Store
import { Question } from '@/lib/quizTypes'; // <-- 2. Use our new types
import { useRouter } from 'next/navigation'; // <-- 3. Import useRouter

interface TopicFocusBarProps {
  currentQuestion: Question | null;
}

const TopicFocusBar: React.FC<TopicFocusBarProps> = ({ currentQuestion }) => {
  const router = useRouter(); // 4. Get router
  
  // 5. Get the loadAndStartQuiz action from the store
  const { loadAndStartQuiz } = useQuizStore();

  if (!currentQuestion) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <p>Scroll to a question to see its topic...</p>
      </div>
    );
  }

  const { exam, subject, topic } = currentQuestion;

  const handlePracticeTopic = () => {
    if (subject && topic) {
      // 6. Call the action to load a new quiz
      // This will reset the store and fetch new questions
      loadAndStartQuiz({ subject, topic });
      
      // 7. Update the URL to match
      // This navigates to /practice/subject/[subject]/[topic]
      router.push(`/practice/subject/${encodeURIComponent(subject)}/${encodeURIComponent(topic)}`);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
        <span className="font-semibold text-gray-800 flex-shrink-0">
          {exam || 'UPSC'}
        </span>
        <i className="ri-arrow-right-s-line"></i>
        <span className="font-medium">{subject || 'Mixed'}</span>
        {topic && (
          <>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-500 truncate">{topic}</span>
          </>
        )}
      </div>
      {subject && topic && (
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