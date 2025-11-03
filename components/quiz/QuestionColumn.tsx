// components/quiz/QuestionColumn.tsx
'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { Question, isUltimateExplanation } from '@/lib/quizTypes'; // "Perfectly" imported
import QuestionPalette from './QuestionPalette';
import { Bookmark, Flag, Grid, X } from 'lucide-react';
import { useAuthContext } from '@/lib/AuthContext';
import UltimateExplanationUI from './UltimateExplanationUI'; // "Perfect" Magic UI
// --- 💎 "PERFECT" FIX: The old modal import is "perfectly" GONE 💎 ---

// --- Individual Question Card ---
const QuestionCard = ({
  question,
  displayNumber,
}: {
  question: Question;
  displayNumber: number;
}) => {
  const {
    currentQuestionNumberInView,
    markedForReview,
    toggleMarkForReview,
    bookmarkedQuestions,
    toggleBookmark,
    // --- 💎 "PERFECT" FIX: `openExplanationEditor` is "perfectly" GONE 💎 ---
  } = useQuizStore();

  const isLongOption = question.options.some((opt) => opt.text.length > 50);

  const { userProfile } = useAuthContext();
  const isAdmin = userProfile?.subscriptionStatus === 'ADMIN';

  // --- 💎 "PERFECT" NEW HANDLER 💎 ---
  // This is the "perfect" new redirect logic for our "perfect" new architecture.
  const handleAdminEditClick = () => {
    window.open(`/admin/editor/${question.id}`, '_blank');
  };

  return (
    <div
      id={`question-card-${displayNumber}`}
      className={`rounded-xl p-6 border relative transition-all duration-300 mb-6 ${
        currentQuestionNumberInView === displayNumber
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* This button is now "perfectly" connected */}
      {isAdmin && (
        <button
          onClick={handleAdminEditClick} // <-- "PERFECT" FIX
          className="absolute top-2 right-2 p-2 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-500 shadow-sm"
          title="Admin: Edit Explanation"
        >
          <Flag className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {displayNumber}
          </div>
          <div className="flex flex-col items-center mt-3 space-y-2">
            <button
              onClick={() => toggleMarkForReview(question.id)}
              className="p-2 text-gray-400 hover:text-purple-600"
              title="Mark for Review"
            >
              {markedForReview.has(question.id) ? (
                <Flag className="w-5 h-5 text-purple-600 fill-purple-600" />
              ) : (
                <Flag className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => toggleBookmark(question.id)}
              className="p-2 text-gray-400 hover:text-blue-600"
              title="Bookmark"
            >
              {bookmarkedQuestions.has(question.id) ? (
                <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg text-gray-900 font-semibold leading-relaxed whitespace-pre-line">
            {question.text}
          </p>
          <div
            className={`pt-4 grid ${
              isLongOption ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
            } gap-4`}
          >
            {question.options.map((option) => (
              <div
                key={option.label}
                className="p-4 rounded-lg border bg-white border-gray-300 text-left font-medium"
              >
                <span className="font-bold mr-2">{option.label}.</span>
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Question Column Component ---
const QuestionColumn = () => {
  const {
    questions,
    currentViewAnswer,
    closeAnswerView,
    setCurrentQuestionNumberInView,
    setIsPageScrolled,
    setCurrentGroupInView,
    quizGroupBy,
    isGroupingEnabled,
    isTopBarVisible,
    setIsTopBarVisible,
  } = useQuizStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const questionObserverRef = useRef<IntersectionObserver | null>(null);
  const groupObserverRef = useRef<IntersectionObserver | null>(null);

  const questionsByGroup = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return null;
    return questions.reduce((acc, q) => {
      const groupKey = String(q[quizGroupBy] || 'UncategorZzed');
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(q);
      return acc;
    }, {} as Record<string, Question[]>);
  }, [questions, quizGroupBy, isGroupingEnabled]);

  const sortedGroups = useMemo(() => {
    if (!questionsByGroup) return [];
    const keys = Object.keys(questionsByGroup);
    if (keys.length === 0) return [];
    const isNumeric = !isNaN(Number(keys[0]));
    return keys.sort((a, b) =>
      isNumeric ? Number(b) - Number(a) : a.localeCompare(b)
    );
  }, [questionsByGroup]);

  // Header "driver" logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isScrolled = container.scrollTop > 20;
      setIsPageScrolled(isScrolled);
      if (isScrolled && isTopBarVisible) {
        setIsTopBarVisible(false);
      } else if (!isScrolled && !isTopBarVisible) {
        setIsTopBarVisible(true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setIsPageScrolled, isTopBarVisible, setIsTopBarVisible]);

  // Group Scrolling Observer
  useEffect(() => {
    if (groupObserverRef.current) groupObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (
      !container ||
      !quizGroupBy ||
      !isGroupingEnabled ||
      questions.length === 0
    ) {
      setCurrentGroupInView(null);
      return;
    }
    groupObserverRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const groupName = entry.target.getAttribute('data-group');
            if (groupName) {
              setCurrentGroupInView(groupName);
              break;
            }
          }
        }
      },
      { root: container, rootMargin: '-40% 0px -60% 0px', threshold: 0 }
    );
    const groupElements = container.querySelectorAll('[data-group]');
    groupElements.forEach((el) => groupObserverRef.current?.observe(el));
    return () => groupObserverRef.current?.disconnect();
  }, [
    sortedGroups,
    setCurrentGroupInView,
    quizGroupBy,
    isGroupingEnabled,
    questions.length,
  ]);

  // Question Sync-Scroll Observer
  useEffect(() => {
    if (questionObserverRef.current) questionObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (!setCurrentQuestionNumberInView || !container || questions.length === 0) {
      return;
    }
    questionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.id.replace('question-card-', '');
            setCurrentQuestionNumberInView(Number(cardId));
          }
        });
      },
      {
        root: container,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );
    const questionElements =
      container.querySelectorAll('[id^="question-card-"]');
    questionElements.forEach((el) => questionObserverRef.current?.observe(el));
    return () => questionObserverRef.current?.disconnect();
  }, [questions, setCurrentQuestionNumberInView, isGroupingEnabled]);

  // "Perfect" Explanation Renderer
  const renderExplanation = (question: Question) => {
    if (isUltimateExplanation(question.explanation)) {
      return <UltimateExplanationUI explanation={question.explanation} />;
    }
    if (
      typeof question.explanation === 'string' &&
      question.explanation.trim()
    ) {
      return (
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {question.explanation}
        </p>
      );
    }
    return (
      <p className="mt-4 text-gray-600">
        No detailed explanation available for this question.
      </p>
    );
  };

  // "VIEW ANSWER" MODE
  if (currentViewAnswer) {
    const question = questions.find((q) => q.id === currentViewAnswer);
    if (!question) return null;
    const displayNumber = questions.indexOf(question) + 1;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Detailed Solution for Q{displayNumber}
          </h3>
          <button
            onClick={closeAnswerView}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            title="Close Solution"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-lg mb-4 whitespace-pre-line">
                Q{displayNumber}: {question.text}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Explanation:</h4>
              {renderExplanation(question)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT QUESTION LIST VIEW
  let questionCounter = 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative overflow-hidden">
      {/* --- 💎 "PERFECT" FIX: The modal is "perfectly" GONE from here 💎 --- */}
      
      <div
        ref={scrollContainerRef}
        className="flex-1 p-6 overflow-y-auto custom-scrollbar"
      >
        <div className="space-y-6">
          {isGroupingEnabled &&
            questionsByGroup &&
            sortedGroups.map((groupName) => (
              <div key={groupName} id={`group-${groupName}`}>
                <div data-group={groupName} className="py-2 mt-4">
                  <div className="bg-gray-200 text-gray-700 font-bold text-sm py-2 px-4 rounded-full inline-block capitalize">
                    {groupName}
                  </div>
                </div>
                {questionsByGroup[groupName].map((question) => {
                  questionCounter++;
                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      displayNumber={questionCounter}
                    />
                  );
                })}
              </div>
            ))}

          {!isGroupingEnabled &&
            questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                displayNumber={index + 1}
              />
            ))}
        </div>
      </div>

      {/* FAB (This logic is correct) */}
      <div className="absolute bottom-6 right-6">
        {isPaletteOpen && (
          <QuestionPalette onClose={() => setIsPaletteOpen(false)} />
        )}
        <button
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform mt-4"
        >
          <Grid
            className={`w-6 h-6 transition-transform duration-300 ${
              isPaletteOpen ? 'rotate-45' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default QuestionColumn;