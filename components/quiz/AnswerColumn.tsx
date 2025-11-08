// components/quiz/AnswerColumn.tsx
'use client';

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { Question } from '@/lib/quizTypes';
import { Check, X, Flag, Bookmark, Eye } from 'lucide-react';

const AnswerColumn = () => {
  // --- 1. USE ZUSTAND STORE (with correct state/actions) ---
  const {
    questions,
    userAnswers, // This is an array: { questionId: string, answer: string }[]
    markedForReview,
    bookmarkedQuestions,
    isTestMode,
    showReport,
    showDetailedSolution,
    handleAnswerSelect, // This is the action for selection
    // viewAnswer, // <-- OLD ACTION (REMOVED)
    openExplanationModal, // <-- 💎 NEW ACTION (ADDED)
    currentQuestionNumberInView,
    setCurrentQuestionNumberInView,
  } = useQuizStore();

  const answerListRef = useRef<HTMLDivElement>(null);

  // --- 2. Find Current Answer (Helper) ---
  // Memoized for performance, uses the correct array structure
  const userAnswersMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const ua of userAnswers) {
      map.set(ua.questionId, ua.answer);
    }
    return map;
  }, [userAnswers]);

  // --- 3. Scroll-to-Question Logic (from rootrise) ---
  const scrollToQuestion = useCallback((qNum: number) => {
    const qElement = document.getElementById(`question-card-${qNum}`);
    if (qElement) {
      qElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Manually set for instant feedback
      setCurrentQuestionNumberInView(qNum);
    }
  }, [setCurrentQuestionNumberInView]);

  // --- 4. Get Button Class Logic (Adapted for your state) ---
  const getButtonClass = useCallback(
    (q: Question, qNum: number, optionLabel: string) => {
      const selectedAnswer = userAnswersMap.get(q.id);
      const isSelected = selectedAnswer === optionLabel;
      const isCurrent = currentQuestionNumberInView === qNum;

      // Default state
      let baseClass =
        'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400';

      if (isCurrent && !showReport && !showDetailedSolution) {
        baseClass = 'border-blue-400 bg-blue-50 text-gray-700';
      }

      if (isTestMode) {
        if (isSelected) {
          baseClass = 'bg-blue-600 border-blue-600 text-white';
        }
      } else {
        // Practice Mode (before report)
        if (isSelected && !showReport && !showDetailedSolution) {
          // Use green like your original code for practice mode
          baseClass = 'bg-green-600 border-green-700 text-white';
        }
      }

      // Report Card / Detailed Solution Mode
      if (showReport || showDetailedSolution) {
        const isCorrect = q.correctAnswer === optionLabel;
        if (isCorrect) {
          // Is the correct answer
          baseClass = 'bg-green-100 border-green-300 text-green-800';
        }
        if (isSelected && !isCorrect) {
          // Is the user's WRONG answer
          baseClass = 'bg-red-100 border-red-300 text-red-800';
        }
        if (isSelected && isCorrect) {
          // Is the user's RIGHT answer
          baseClass = 'bg-green-600 border-green-600 text-white';
        }
      }
      
      return `transition-all duration-150 ease-in-out ${baseClass}`;
    },
    [userAnswersMap, currentQuestionNumberInView, isTestMode, showReport, showDetailedSolution]
  );

  // --- 5. Get Indicator Logic (Adapted for your state) ---
  const getIndicator = useCallback(
    (q: Question, optionLabel: string) => {
      if (!showReport && !showDetailedSolution) return null;

      const selectedAnswer = userAnswersMap.get(q.id);
      const isSelected = selectedAnswer === optionLabel;
      const isCorrect = q.correctAnswer === optionLabel;

      if (isCorrect) {
        return <Check className="w-4 h-4 text-green-600" />;
      }
      if (isSelected && !isCorrect) {
        return <X className="w-4 h-4 text-red-600" />;
      }
      return null;
    },
    [userAnswersMap, showReport, showDetailedSolution]
  );

  // --- 6. Handle Click Logic (Using your action) ---
  const onAnswerClick = (questionId: string, optionLabel: string) => {
    if (isTestMode) {
      handleAnswerSelect(questionId, optionLabel);
    } else {
      // In practice mode, clicking an answer is final
      if (!userAnswersMap.has(questionId)) {
        handleAnswerSelect(questionId, optionLabel);
      }
    }
  };

  // --- 7. Sync-Scroll listener (from your original code) ---
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

  // --- 8. Memoized Question List (Performance) ---
  const questionDatalist = useMemo(() => {
    return questions.map((q, index) => ({
      id: q.id,
      qNum: index + 1,
      question: q,
      options: q.options,
    }));
  }, [questions]);

  // --- 9. The "Pixel-Perfect" JSX (from rootrise) ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Answer Palette</h3>
          <p className="text-sm text-gray-500">
            Click an answer to select it.
          </p>
        </div>
      </div>

      {/* Answer Grid (Scrollable) */}
      <div
        ref={answerListRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2"
      >
        {questionDatalist.map(({ id, qNum, question, options }) => {
          const selectedAnswer = userAnswersMap.get(id);
          const isAnswered = !!selectedAnswer;

          return (
            <div
              key={id}
              id={`answer-card-${qNum}`}
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                currentQuestionNumberInView === qNum
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-transparent bg-white'
              }`}
            >
              <div className="flex flex-col gap-2">
                {/* Row 1: Q#, Status, and View Button */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToQuestion(qNum)}
                      className={`font-bold text-sm px-3 py-1 rounded-md transition-all ${
                        currentQuestionNumberInView === qNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      } ${
                        isAnswered && !showReport
                          ? 'ring-2 ring-offset-1 ring-green-500'
                          : ''
                      }`}
                    >
                      Q{qNum}
                    </button>
                    <div className="flex items-center gap-1">
                      {markedForReview.has(id) && (
                        <Flag className="w-4 h-4 text-purple-600" />
                      )}
                      {bookmarkedQuestions.has(id) && (
                        <Bookmark className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {/* --- 💎 MODIFIED VIEW BUTTON (AS REQUESTED) 💎 --- */}
                  <button
                    onClick={() => openExplanationModal(id)} // <-- This is the new "Modal Sheet" trigger
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                {/* Row 2: Answer Buttons (A, B, C, D) */}
                <div className="grid grid-cols-4 gap-2">
                  {options.map((option) => (
                    <button
                      key={option.label}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        if (!showReport && !showDetailedSolution) {
                          onAnswerClick(id, option.label);
                        }
                        scrollToQuestion(qNum);
                      }}
      disabled={showReport || showDetailedSolution || (isAnswered && !isTestMode)}
                      className={`h-10 flex items-center justify-center rounded-lg border font-semibold text-sm
                        ${getButtonClass(question, qNum, option.label)}
                        ${(showReport || showDetailedSolution) ? 'cursor-default' : 'transform active:scale-95'}
                      `}
                      title={`Select Answer ${option.label}`}
                    >
                      <span className="flex items-center gap-1">
                        {getIndicator(question, option.label)}
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Row 3: Report Card Status (if applicable) */}
                {(showReport || showDetailedSolution) && isAnswered && (
                  <div className="pt-2 text-xs font-bold text-right">
                    {selectedAnswer === question.correctAnswer ? (
                      <span className="text-green-600">Correct</span>
                    ) : (
                      <span className="text-red-600">Incorrect</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* Spacer at the bottom */}
        <div className="h-[30vh]" />
      </div>
    </div>
  );
};

export default AnswerColumn;