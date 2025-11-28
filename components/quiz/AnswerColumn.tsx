// components/quiz/AnswerColumn.tsx
'use client';

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { Question } from '@/lib/quizTypes';
import { ArrowRight, Eye } from 'lucide-react';

const AnswerColumnHeader = () => {
    const { questions, userAnswers } = useQuizStore();
    const attemptedCount = userAnswers.length;
    const notAttemptedCount = questions.length - attemptedCount;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white z-10">
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
    questions, userAnswers, handleAnswerSelect, isTestMode, 
    showDetailedSolution, showReport
  } = useQuizStore();

  const { 
    currentQuestionNumberInView, 
    openExplanationModal: viewAnswer, 
    setCurrentQuestionNumberInView
  } = useQuizUIStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // --- 🎨 MODIFIED: New Colors, Old Size ---
  const getOptionButtonStyle = (question: Question, optionLabel: string) => {
    const userAnswer = getUserAnswer(question.id);
    
    // 🔒 SIZE KEPT: h-10, rounded-md, text-sm (Your Original)
    const baseStyle = "h-10 rounded-md font-medium transition-all duration-200 border w-full flex items-center justify-center text-sm";
    
    const showFeedback = showReport || (showDetailedSolution && userAnswer);

    if (showFeedback) {
        const correct = String(question.correctAnswer).trim().toUpperCase();
        const current = String(optionLabel).trim().toUpperCase();
        const selected = String(userAnswer).trim().toUpperCase();

        // ✅ CORRECT (Green)
        if (current === correct) {
            return `${baseStyle} bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm`;
        }
        // ❌ WRONG (Red)
        if (current === selected) {
            return `${baseStyle} bg-rose-100 border-rose-500 text-rose-800 shadow-sm`;
        }
    }

    // 🔵 SELECTED (Blue)
    if (userAnswer === optionLabel) {
        return `${baseStyle} bg-blue-600 border-blue-600 text-white shadow-sm`;
    }

    // ⚪ DEFAULT (Gray/White)
    return `${baseStyle} bg-white border-gray-300 hover:border-blue-400 text-gray-700 hover:bg-gray-50`;
  };

  const getOptionCursor = (questionId: string) => {
    const userAnswer = getUserAnswer(questionId);
    if ((isTestMode && userAnswer) || showReport) {
      return "cursor-not-allowed opacity-80";
    }
    return "cursor-pointer active:scale-95 transform";
  };
  
  const getQuestionCardStyle = (displayNumber: number) => {
    // Kept original liquid-highlight logic
    return currentQuestionNumberInView === displayNumber 
        ? "liquid-highlight" 
        : "bg-white border-gray-200";
  };

  const scrollToQuestion = (displayNumber: number) => {
    const questionElement = document.getElementById(`question-card-${displayNumber}`);
    if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setCurrentQuestionNumberInView(displayNumber);
    }
  };

  const questionDatalist = useMemo(() => questions.map((q, i) => ({ id: q.id, qNum: i + 1, question: q, options: q.options })), [questions]);

  return (
    <div className="bg-white border-l border-gray-200 h-full flex flex-col overflow-hidden w-full">
       <style jsx>{`
        .liquid-highlight { position: relative; z-index: 1; background-color: #eff6ff; border-color: #bfdbfe; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .liquid-highlight::before { content: ""; position: absolute; top: 50%; left: 50%; width: 120%; height: 120%; background-color: #dbeafe; border-radius: 0.5rem; transform: translate(-50%, -50%); filter: blur(30px); opacity: 0.6; z-index: -1; }
      `}</style>
      
      <AnswerColumnHeader />

      <div ref={scrollContainerRef} className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
        <div className="space-y-3 pb-24">
          {questionDatalist.map(({ id, qNum, question, options }) => {
              const displayNumber = qNum;
              const userAnswer = getUserAnswer(id);

              return (
              <div
                key={id}
                id={`answer-card-${displayNumber}`}
                // 🔒 LAYOUT KEPT: rounded-lg, p-4, border
                className={`rounded-lg p-4 border transition-all duration-300 relative overflow-hidden ${getQuestionCardStyle(displayNumber)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* 🔒 HEADER KEPT: Plain text buttons */}
                  <button onClick={() => scrollToQuestion(displayNumber)} className="font-bold text-gray-700 hover:text-blue-600 flex items-center gap-1 text-sm group">
                    Q{displayNumber} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  {(!isTestMode || showDetailedSolution) && (
                    <button onClick={() => viewAnswer(id)} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </button>
                  )}
                </div>
                
                {/* 🔒 GRID KEPT: gap-2 */}
                <div className="grid grid-cols-4 gap-2">
                  {options.map((option) => (
                    <button
                      key={option.label}
                      onClick={(e) => {
                          e.stopPropagation();
                          if (!showReport && (!isTestMode || !userAnswer)) {
                              handleAnswerSelect(id, option.label);
                          }
                          scrollToQuestion(displayNumber);
                      }}
                      disabled={(isTestMode && !!userAnswer) || showReport}
                      className={`${getOptionButtonStyle(question, option.label)} ${getOptionCursor(id)}`}
                      title={option.label}
                    >
                      {/* Clean Label Only (No Icons) */}
                      {option.label}
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