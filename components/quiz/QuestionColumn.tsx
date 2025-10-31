// components/quiz/QuestionColumn.tsx
'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { Question } from '@/lib/quizTypes';
import QuestionPalette from './QuestionPalette';
// --- 1. IMPORT THE ICONS from lucide-react ---
import { Bookmark, Flag, Grid, X } from 'lucide-react';

// --- Individual Question Card (Read-Only) ---
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
  } = useQuizStore();

  const isLongOption = question.options.some((opt) => opt.text.length > 50);

  return (
    <div
      id={`question-card-${displayNumber}`}
      className={`rounded-xl p-6 border relative transition-all duration-300 mb-6 ${
        currentQuestionNumberInView === displayNumber
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Column 1: Question Number & Actions */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {displayNumber}
          </div>
          <div className="flex flex-col items-center mt-3 space-y-2">
            {/* --- 2. REPLACED ICON --- */}
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
            {/* --- 3. REPLACED ICON --- */}
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

        {/* Column 2: Question Text & Options (Read-Only) */}
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

  // ... (all the useMemo and useEffect hooks remain exactly the same) ...
  // Memoize the grouped questions
  const questionsByGroup = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return null;
    return questions.reduce((acc, q) => {
      const groupKey = String(q[quizGroupBy] || 'Uncategorized');
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(q);
      return acc;
    }, {} as Record<string, Question[]>);
  }, [questions, quizGroupBy, isGroupingEnabled]);

  // Memoize the sorted group names
  const sortedGroups = useMemo(() => {
    if (!questionsByGroup) return [];
    const keys = Object.keys(questionsByGroup);
    if (keys.length === 0) return [];
    const isNumeric = !isNaN(Number(keys[0]));
    return keys.sort((a, b) =>
      isNumeric ? Number(b) - Number(a) : a.localeCompare(b)
    );
  }, [questionsByGroup]);

  // Effect for tracking page scroll (to hide/show Header)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isScrolled = container.scrollTop > 20;
      setIsPageScrolled(isScrolled);
      if (isScrolled && isTopBarVisible) setIsTopBarVisible(false);
      else if (!isScrolled && !isTopBarVisible) setIsTopBarVisible(true);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setIsPageScrolled, isTopBarVisible, setIsTopBarVisible]);

  // Effect for "Sync Scrolling" - Watching for Groups
  useEffect(() => {
    if (groupObserverRef.current) groupObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (!container || !quizGroupBy || !isGroupingEnabled) {
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
  }, [sortedGroups, setCurrentGroupInView, quizGroupBy, isGroupingEnabled]);

  // Effect for "Sync Scrolling" - Watching for Questions
  useEffect(() => {
    if (questionObserverRef.current) questionObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (!container) return;

    questionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.id.replace('question-card-', '');
            setCurrentQuestionNumberInView(Number(cardId));
          }
        });
      },
      { root: container, rootMargin: '-50% 0px -50% 0px', threshold: 0.5 }
    );

    const questionElements = container.querySelectorAll('[id^="question-card-"]');
    questionElements.forEach((el) => questionObserverRef.current?.observe(el));
    
    return () => questionObserverRef.current?.disconnect();
  }, [questions, setCurrentQuestionNumberInView, isGroupingEnabled]);


  // --- THIS IS THE "VIEW ANSWER" MODE ---
  if (currentViewAnswer) {
    const question = questions.find((q) => q.id === currentViewAnswer);
    if (!question) return null;
    
    return (
      // --- 4. THIS IS THE LAYOUT FIX ---
      // Added col-span- classes back
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-[calc(100vh-121px)] overflow-y-auto custom-scrollbar p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
          {/* --- THIS IS THE HEADER WITH THE "CLOSE" BUTTON --- */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Solution for Q{question.questionNumber}
            </h3>
            {/* --- 5. THIS IS THE LUCIDE-REACT <X> ICON --- */}
            <button
              onClick={closeAnswerView} // Action from "Brain"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              title="Close Solution"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* --- END OF HEADER --- */}

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-lg mb-2 whitespace-pre-line">
                  Q{question.questionNumber}: {question.text}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Explanation:</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This is the default view: show the list of questions
  let questionCounter = 0;
  return (
    // --- 6. THIS IS THE LAYOUT FIX ---
    // Added col-span- classes back
    <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-[calc(100vh-121px)] relative">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto custom-scrollbar p-6"
      >
        <div className="space-y-6">
          {/* Render Grouped Questions */}
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
          
          {/* Render Ungrouped Questions */}
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
      
      {/* This is the floating button for the mobile modal */}
      <div className="absolute bottom-6 right-6 lg:hidden">
        {isPaletteOpen && (
          <QuestionPalette onClose={() => setIsPaletteOpen(false)} />
        )}
        <button
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform mt-4"
        >
          {/* --- 7. REPLACED ICON --- */}
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