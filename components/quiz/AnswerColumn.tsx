// components/quiz/AnswerColumn.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { useQuizStore } from "@/lib/quizStore"; // <-- 1. Use Zustand Store
import { Question } from "@/lib/quizTypes"; // <-- 2. Use our Zustand types
// --- 3. IMPORT THE ICONS from lucide-react ---
import { ArrowRight, Check, X } from "lucide-react";

const AnswerColumnHeader = () => {
  // 4. Get state from Zustand.
  const attemptedCount = useQuizStore((state) => state.userAnswers.length);
  const notAttemptedCount = useQuizStore(
    (state) => state.questions.length - state.userAnswers.length
  );

  return (
    <div className="p-4 border-b border-gray-200 flex-shrink-0">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          {/* 5. Use the state variable */}
          <div className="text-xl font-bold text-blue-700">{attemptedCount}</div>
          <div className="text-xs font-medium text-blue-800">Attempted</div>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
          {/* 6. Use the state variable */}
          <div className="text-xl font-bold text-gray-700">
            {notAttemptedCount}
          </div>
          <div className="text-xs font-medium text-gray-800">Not Attempted</div>
        </div>
      </div>
    </div>
  );
};

const AnswerColumn = () => {
  // 7. Get ALL state and actions from our Zustand store
  const {
    questions,
    userAnswers,
    handleAnswerSelect,
    viewAnswer,
    isTestMode,
    showDetailedSolution,
    currentQuestionNumberInView,
  } = useQuizStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 8. This is the "One-Way Sync" (Left-to-Right)
  // This logic is from your file and is perfect.
  useEffect(() => {
    if (scrollContainerRef.current && currentQuestionNumberInView > 0) {
      const answerElement = scrollContainerRef.current.querySelector(
        `#answer-card-${currentQuestionNumberInView}`
      );
      if (answerElement) {
        answerElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentQuestionNumberInView]);

  const getUserAnswer = (questionId: string) => {
    return userAnswers.find((ua) => ua.questionId === questionId)?.answer;
  };

  // 9. This styling logic is from your file and is perfect.
  const getOptionButtonStyle = (question: Question, optionLabel: string) => {
    const userAnswer = getUserAnswer(question.id);
    const baseStyle =
      "btn h-10 rounded-md font-medium transition-all duration-200 border";
    
    if (showDetailedSolution || (!isTestMode && userAnswer)) {
      if (optionLabel === question.correctAnswer)
        return `${baseStyle} bg-green-500 border-green-600 text-white`;
      if (optionLabel === userAnswer)
        return `${baseStyle} bg-red-500 border-red-600 text-white`;
    }

    if (userAnswer === optionLabel)
      return `${baseStyle} bg-blue-600 border-blue-700 text-white`;
    
    return `${baseStyle} bg-white border-gray-300 hover:border-blue-400`;
  };

  const getOptionCursor = (questionId: string) => {
    const userAnswer = getUserAnswer(questionId);
    if (isTestMode && userAnswer) {
      return "cursor-not-allowed";
    }
    return "cursor-pointer";
  };
  
  // 10. This is the "bluish liquid glass" effect
  const getQuestionCardStyle = (displayNumber: number) => {
    return currentQuestionNumberInView === displayNumber ? "liquid-highlight" : "";
  };

  // 11. This is the "Reverse Click" (Right-to-Left)
  const scrollToQuestion = (displayNumber: number) => {
    const questionElement = document.getElementById(
      `question-card-${displayNumber}`
    );
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    // 12. This is the main layout from your file.
    // I am adding the col-span classes we discussed to fix the "cramped" layout.
    <div className="hidden lg:block col-span-4 xl:col-span-3 h-[calc(100vh-121px)] overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* This is the "bluish liquid glass" CSS, copied exactly */}
      <style jsx>{`
        .liquid-highlight {
          position: relative;
          z-index: 1;
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }
        .liquid-highlight::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120%;
          height: 120%;
          background-color: #dbeafe;
          border-radius: 0.5rem;
          transform: translate(-50%, -50%);
          filter: blur(30px);
          opacity: 0.8;
          z-index: -1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <AnswerColumnHeader />

      <div
        ref={scrollContainerRef}
        className="p-4 overflow-y-auto custom-scrollbar"
      >
        <div className="space-y-3">
          {/* 13. This is the "pixel perfect" Answer Card, copied exactly */}
          {questions.map((question, index) => {
            const displayNumber = index + 1;
            const userAnswer = getUserAnswer(question.id);
            return (
              <div
                key={question.id}
                id={`answer-card-${displayNumber}`}
                className={`bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300 relative overflow-hidden ${getQuestionCardStyle(
                  displayNumber
                )}`}
              >
                {/* Row 1: Q# and View button */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => scrollToQuestion(displayNumber)}
                    className="font-bold text-gray-700 hover:text-blue-600 flex items-center"
                  >
                    Q{displayNumber}{" "}
                    {/* --- 14. REPLACED ICON --- */}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  {(!isTestMode || showDetailedSolution) && (
                    <button
                      onClick={() => viewAnswer(question.id)}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  )}
                </div>
                {/* Row 2: A, B, C, D buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option.label}
                      onClick={() =>
                        handleAnswerSelect(question.id, option.label)
                      }
                      disabled={
                        isTestMode && !!userAnswer && userAnswer !== option.label
                      }
                      className={`${getOptionButtonStyle(
                        question,
                        option.label
                      )} ${getOptionCursor(
                        question.id
                      )} flex items-center justify-center gap-1`}
                    >
                      <span>{option.label}</span>
                      {/* --- 15. REPLACED ICONS --- */}
                      {showDetailedSolution &&
                        userAnswer === option.label && (
                          <>
                            {question.correctAnswer === userAnswer ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </>
                        )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnswerColumn;