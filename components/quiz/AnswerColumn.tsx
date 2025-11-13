// components/quiz/AnswerColumn.tsx
'use client';

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { Question } from '@/lib/quizTypes';
import { Check, X, Flag, Bookmark, Eye } from 'lucide-react';

const AnswerColumn = () => {
  const {
    questions,
    userAnswers,
    markedForReview,
    bookmarkedQuestions,
    isTestMode,
    showReport,
    showDetailedSolution,
    handleAnswerSelect,
  } = useQuizStore();

  const {
    openExplanationModal,
    currentQuestionNumberInView,
    setCurrentQuestionNumberInView,
  } = useQuizUIStore();


  const answerListRef = useRef<HTMLDivElement>(null);

  const userAnswersMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const ua of userAnswers) {
      map.set(ua.questionId, ua.answer);
    }
    return map;
  }, [userAnswers]);

  const scrollToQuestion = useCallback((qNum: number) => {
    const qElement = document.getElementById(`question-card-${qNum}`);
    if (qElement) {
      qElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentQuestionNumberInView(qNum); 
    }
  }, [setCurrentQuestionNumberInView]);

  // --- 💎 --- "REVEALS ALL" BUG FIX --- 💎 ---
  const getButtonClass = useCallback(
    (q: Question, qNum: number, optionLabel: string) => {
      const selectedAnswer = userAnswersMap.get(q.id);
      const isSelected = selectedAnswer === optionLabel;
      const isCurrent = currentQuestionNumberInView === qNum;
      const isAnswered = !!selectedAnswer; // Has this specific question been answered?

      let baseClass =
        'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400';

      if (isCurrent && !showReport && !showDetailedSolution) {
        baseClass = 'border-blue-400 bg-blue-50 text-gray-700';
      }

      if (isTestMode) {
        if (isSelected) {
          baseClass = 'bg-blue-600 border-blue-600 text-white';
        }
      } 
      
      // This is the new, correct logic for Practice and Review modes
      // We check `isAnswered` to ensure we only color the buttons *for that question*
      if (showReport || (showDetailedSolution && isAnswered)) {
        const isCorrect = q.correctAnswer === optionLabel;
        
        if (isCorrect && isSelected) {
          // User selected the correct answer
          baseClass = 'bg-green-600 border-green-600 text-white';
        } else if (isCorrect && !isSelected) {
          // This is the correct answer, but user selected something else
          baseClass = 'bg-green-100 border-green-300 text-green-800';
        } else if (!isCorrect && isSelected) {
          // User selected this incorrect answer
          baseClass = 'bg-red-100 border-red-300 text-red-800';
        }
        // If !isCorrect && !isSelected (just a regular wrong option), it keeps the baseClass
      }
      
      // Override for Test Mode to keep selected answer blue
      if (isTestMode && isSelected) {
         baseClass = 'bg-blue-600 border-blue-600 text-white';
      }
      
      return `transition-all duration-150 ease-in-out ${baseClass}`;
    },
    [userAnswersMap, currentQuestionNumberInView, isTestMode, showReport, showDetailedSolution]
  );
  // --- 💎 --- END OF FIX --- 💎 ---

  const getIndicator = useCallback(
    (q: Question, optionLabel: string) => {
      const selectedAnswer = userAnswersMap.get(q.id);
      const isAnswered = !!selectedAnswer;

      // Only show indicators if this question has been answered
      if (!isAnswered || (!showReport && !showDetailedSolution)) return null;

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

  const onAnswerClick = (questionId: string, optionLabel: string) => {
    handleAnswerSelect(questionId, optionLabel);
  };

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

  const questionDatalist = useMemo(() => {
    return questions.map((q, index) => ({
      id: q.id,
      qNum: index + 1,
      question: q,
      options: q.options,
    }));
  }, [questions]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Answer Palette</h3>
          <p className="text-sm text-gray-500">
            Click an answer to select it.
          </p>
        </div>
      </div>
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
              className={`p-3 rounded-lg border transition-all duration-300 ${
                currentQuestionNumberInView === qNum
                  ? 'bg-white border-blue-500 shadow-lg'
                  : 'bg-gray-50 border-transparent'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToQuestion(qNum)}
                      className={`font-bold text-sm px-3 py-1 rounded-md transition-all ${
                        currentQuestionNumberInView === qNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      } ${
                        // This logic seems correct for the Q# button
                        isAnswered && !showReport && !isTestMode
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

                  {!isTestMode && (
                    <button
                      onClick={() => openExplanationModal(id)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {options.map((option) => (
                    <button
                      key={option.label}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        if (!showReport && !isAnswered) { 
                          onAnswerClick(id, option.label);
                        }
                        scrollToQuestion(qNum);
                      }}
                      disabled={showReport || isAnswered} 
                      className={`h-10 flex items-center justify-center rounded-lg border font-semibold text-sm
                        ${getButtonClass(question, qNum, option.label)}
                        ${(showReport || isAnswered) ? 'cursor-not-allowed' : 'transform active:scale-95'}
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

                {(showReport || (showDetailedSolution && isAnswered)) && (
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
        <div className="h-[30vh]" />
      </div>
    </div>
  );
};

export default AnswerColumn;