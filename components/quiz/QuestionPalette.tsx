// components/quiz/QuestionPalette.tsx
'use client';
import React, { useCallback } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- The "Data Store"
import { useQuizUIStore } from '@/lib/quizUIStore'; // <-- 💎 NEW "UI Store"
import { X, Flag, Bookmark } from 'lucide-react';
import { Question } from '@/lib/quizTypes';

interface QuestionPaletteProps {
  onClose: () => void;
}

export default function QuestionPalette({ onClose }: QuestionPaletteProps) {
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  // 1. Get "Data" state
  const questions = useQuizStore((state) => state.questions);
  const userAnswers = useQuizStore((state) => state.userAnswers);
  const markedForReview = useQuizStore((state) => state.markedForReview);
  const bookmarkedQuestions = useQuizStore((state) => state.bookmarkedQuestions);

  // 2. Get "UI" state AND actions
  const currentQuestionNumberInView = useQuizUIStore(
    (state) => state.currentQuestionNumberInView
  );
  const setCurrentQuestionNumberInView = useQuizUIStore(
    (state) => state.setCurrentQuestionNumberInView
  );
  // --- 💎 --- END OF FIX --- 💎 ---

  const userAnswersMap = new Map(
    userAnswers.map((ua) => [ua.questionId, ua.answer])
  );

  const scrollToQuestion = useCallback((qNum: number) => {
    const qElement = document.getElementById(`question-card-${qNum}`);
    if (qElement) {
      qElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentQuestionNumberInView(qNum); // <-- Calls UI Store
      onClose(); // Close palette on click
    }
  }, [setCurrentQuestionNumberInView, onClose]);

  const getStatusClass = (q: Question) => { 
    if (currentQuestionNumberInView === q.questionNumber) {
      return 'bg-blue-600 text-white border-blue-700';
    }
    if (markedForReview.has(q.id)) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (userAnswersMap.has(q.id)) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  };

  return (
    <div className="absolute bottom-20 right-0 w-72 h-96 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Question Palette</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => scrollToQuestion(q.questionNumber)}
              className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm font-medium ${getStatusClass(
                q
              )}`}
            >
              {bookmarkedQuestions.has(q.id) ? (
                <Bookmark className="w-4 h-4" />
              ) : (
                q.questionNumber
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}