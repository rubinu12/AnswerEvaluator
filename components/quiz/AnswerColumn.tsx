// components/quiz/AnswerColumn.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { Question } from '@/lib/quizTypes';
import { Check, Eye, X, Bookmark, Flag } from 'lucide-react';

// --- Single Answer Card ---
const AnswerCard = ({
  question,
  displayNumber,
}: {
  question: Question;
  displayNumber: number;
}) => {
  const {
    currentQuestionNumberInView,
    userAnswers,
    handleAnswerSelect,
    viewAnswer,
    markedForReview,
    bookmarkedQuestions,
  } = useQuizStore();

  const userAnswer = userAnswers.find(
    (ua) => ua.questionId === question.id
  )?.answer;
  
  const isCurrentInView = currentQuestionNumberInView === displayNumber;
  const isMarked = markedForReview.has(question.id);
  const isBookmarked = bookmarkedQuestions.has(question.id);

  // This helper function is correct.
  const scrollToQuestion = (qNumber: number) => {
    const questionCard = document.getElementById(`question-card-${qNumber}`);
    if (questionCard) {
      questionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    // --- *** LAYOUT FIX *** ---
    // This is the new "pixel-perfect" card from rootrise.
    // It's simpler and designed to be in a list.
    <div
      id={`answer-card-${displayNumber}`}
      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
        isCurrentInView
          ? 'border-blue-500 bg-blue-50 liquid-highlight'
          : 'border-transparent bg-white'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Row 1: Q#, Status, and View Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToQuestion(displayNumber)}
              className={`font-bold text-sm px-3 py-1 rounded-md ${
                isCurrentInView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              } ${
                userAnswer ? 'ring-2 ring-offset-1 ring-green-500' : ''
              }`}
            >
              Q{displayNumber}
            </button>
            <div className="flex items-center gap-1">
              {isMarked && (
                <Flag className="w-4 h-4 text-purple-600 fill-purple-600" />
              )}
              {isBookmarked && (
                <Bookmark className="w-4 h-4 text-blue-600 fill-blue-600" />
              )}
            </div>
          </div>
          <button
            onClick={() => viewAnswer(question.id)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        </div>

        {/* Row 2: Answer Buttons (A, B, C, D) */}
        <div className="grid grid-cols-4 gap-2">
          {question.options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleAnswerSelect(question.id, option.label)}
              className={`p-2 rounded-md font-bold text-sm border-2 transition-all ${
                userAnswer === option.label
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Answer Column Component ---
const AnswerColumn = () => {
  const { questions, currentQuestionNumberInView } = useQuizStore();
  const answerListRef = useRef<HTMLDivElement>(null);

  // This "listener" logic is correct.
  useEffect(() => {
    if (answerListRef.current) {
      const activeCard = answerListRef.current.querySelector(
        `#answer-card-${currentQuestionNumberInView}`
      );
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentQuestionNumberInView]);

  return (
    // --- *** THE "PIXEL-PERFECT" LAYOUT FIX IS HERE *** ---
    // 1. Removed all `col-span-*` and `hidden` classes.
    // 2. Set `h-full` to fill the parent div from the page.
    // 3. Made this the "card" with bg, border, etc.
    // 4. Made the inner div the scroller.
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* This is the "bluish liquid glass" effect style */}
      <style jsx>{`
        .liquid-highlight { position: relative; z-index: 1; }
        .liquid-highlight::before {
          content: ""; position: absolute; top: 50%; left: 50%;
          width: 120%; height: 120%; background-color: #dbeafe;
          border-radius: 0.5rem; transform: translate(-50%, -50%);
          filter: blur(30px); opacity: 0.8; z-index: -1;
        }
      `}</style>

      {/* This is now the scrolling container */}
      <div
        ref={answerListRef}
        className="flex-1 h-full p-3 overflow-y-auto custom-scrollbar space-y-2"
      >
        {questions.map((question, index) => (
          <AnswerCard
            key={question.id}
            question={question}
            displayNumber={index + 1}
          />
        ))}
        {/* Add a spacer at the bottom for better scrolling */}
        <div className="h-[30vh]" />
      </div>
    </div>
  );
};

export default AnswerColumn;