"use client";

import React, { useEffect, useRef } from "react";
import { useQuizStore } from "@/lib/quizStore"; // 1. Use the new Zustand store
import { Question } from "@/lib/quizTypes"; // Use our unified types

const AnswerColumnHeader = () => {
    // 2. Select state from the store to calculate counts
    const { questions, userAnswers, mode } = useQuizStore();

    // Don't show this header outside of test mode
    if (mode !== 'test') {
        return null;
    }

    const attemptedCount = userAnswers.length;
    const notAttemptedCount = questions.length - attemptedCount;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xl font-bold text-blue-700">{attemptedCount}</div>
                    <div className="text-xs font-medium text-blue-800">Attempted</div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="text-xl font-bold text-gray-700">{notAttemptedCount}</div>
                    <div className="text-xs font-medium text-gray-800">Not Attempted</div>
                </div>
            </div>
        </div>
    );
}

const AnswerColumn = () => {
  const {
    questions, userAnswers, handleAnswerSelect, viewAnswer, mode, currentQuestionInView,
  } = useQuizStore(); // 3. Select all necessary state and actions

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized scrolling logic, preserved and updated for 0-based index
  useEffect(() => {
    if (scrollContainerRef.current && questions.length > 0) {
      const currentQuestion = questions[currentQuestionInView];
      if (currentQuestion) {
        const answerElement = scrollContainerRef.current.querySelector(
          `#answer-card-${currentQuestion.id}`
        );
        if (answerElement) {
          answerElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentQuestionInView, questions]);
  
  // Refactored styling logic to work with the new store state and data types
  const getOptionButtonStyle = (question: Question, optionIndex: number) => {
    const userAnswer = userAnswers.find((ua) => ua.questionId === question.id);
    const isSelected = userAnswer?.selectedOption === optionIndex;
    const isCorrect = question.options[optionIndex].isCorrect;
    const baseStyle = "btn h-10 rounded-md font-medium transition-all duration-200 border";

    if (mode === 'review') {
        if (isCorrect) return `${baseStyle} bg-green-100 border-green-300 text-green-700`;
        if (isSelected && !isCorrect) return `${baseStyle} bg-red-100 border-red-300 text-red-700`;
    }
    if (isSelected) return `${baseStyle} bg-blue-600 text-white border-blue-700`;
    return `${baseStyle} bg-white border-gray-300 hover:border-blue-400`;
  };

  const scrollToQuestion = (questionId: string) => {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
        {/* All original JSX styles are preserved */}
        <style jsx>{`
         .liquid-highlight { position: relative; z-index: 1; background-color: #eff6ff; border-color: #bfdbfe; }
         .liquid-highlight::before { content: ""; position: absolute; top: 50%; left: 50%; width: 120%; height: 120%; background-color: #dbeafe; border-radius: 0.5rem; transform: translate(-50%, -50%); filter: blur(30px); opacity: 0.8; z-index: -1; }
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
       `}</style>
      
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Answer Sheet</h2>
      </div>

      <AnswerColumnHeader />

      <div ref={scrollContainerRef} className="p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {questions.map((question, index) => {
              const userAnswer = userAnswers.find(ua => ua.questionId === question.id);
              return (
              <div
                key={question.id}
                id={`answer-card-${question.id}`} // Use question ID for a stable reference
                className={`bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300 relative overflow-hidden ${currentQuestionInView === index ? "liquid-highlight" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => scrollToQuestion(question.id!)} className="font-bold text-gray-700 hover:text-blue-600">
                    Q{index + 1} <i className="ri-arrow-right-line align-middle"></i>
                  </button>
                  {/* Show View button in practice or review mode */}
                  {(mode === 'practice' || mode === 'review') && (
                    <button onClick={() => viewAnswer(question.id!)} className="text-sm font-medium text-blue-600 hover:underline">
                      View
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(question.id!, optionIndex)}
                      disabled={mode !== 'test'} // Disable buttons unless in test mode
                      className={`${getOptionButtonStyle(question, optionIndex)} ${mode !== 'test' ? 'cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-center gap-1`}>
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {mode === 'review' && userAnswer?.selectedOption === optionIndex && (
                          <i className={userAnswer.isCorrect ? "ri-check-line text-green-700" : "ri-close-line text-red-700"}></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )})}
        </div>
      </div>
    </div>
  );
};

export default AnswerColumn;
