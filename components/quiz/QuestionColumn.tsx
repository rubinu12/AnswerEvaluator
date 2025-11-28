// components/quiz/QuestionColumn.tsx
'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { Question } from '@/lib/quizTypes';
import QuestionPalette from './QuestionPalette';
import { Bookmark, Flag, Grid } from 'lucide-react';

const QuestionCard = ({ question, displayNumber }: { question: Question, displayNumber: number }) => {
    const { 
        userAnswers, isTestMode, showReport, showDetailedSolution,
        markedForReview, toggleMarkForReview, bookmarkedQuestions, toggleBookmark 
    } = useQuizStore();
    
    const { currentQuestionNumberInView } = useQuizUIStore();
    
    const isLongOption = question.options.some((opt) => opt.text.length > 50);
    const userAnswer = userAnswers.find((ua) => ua.questionId === question.id)?.answer;

    // --- ROOTRISE STYLE LOGIC (Read-Only Visuals) ---
    const getOptionStyle = (optionLabel: string) => {
        const baseClasses = "p-4 rounded-lg border text-left font-medium transition-all duration-200";
        
        // 1. Feedback Mode
        if (showReport || (!isTestMode && userAnswer) || (showDetailedSolution && userAnswer)) {
            const correctLabel = String(question.correctAnswer).trim().toUpperCase();
            const currentLabel = String(optionLabel).trim().toUpperCase();
            const userLabel = String(userAnswer).trim().toUpperCase();

            if (currentLabel === correctLabel) {
                return `${baseClasses} bg-emerald-100 border-emerald-500 text-emerald-900`; // Correct (Green)
            }
            if (currentLabel === userLabel) {
                return `${baseClasses} bg-rose-100 border-rose-500 text-rose-900`; // Wrong (Red)
            }
        }
        
        // 2. Selected State
        if (userAnswer === optionLabel) {
            return `${baseClasses} bg-blue-50 border-blue-500 text-blue-900 shadow-sm`; // Selected (Blue)
        }

        // 3. Default
        return `${baseClasses} bg-white border-gray-200`;
    };

    // Active Card Highlight
    const cardClass = currentQuestionNumberInView === displayNumber 
        ? "bg-blue-50/50 border-blue-300 shadow-md" 
        : "bg-white border-gray-200";

    return (
        <div id={`question-card-${displayNumber}`} className={`rounded-xl p-6 border relative transition-all duration-300 mb-6 ${cardClass}`}>
            <div className="flex items-start gap-4">
                {/* BADGE COLUMN */}
                <div className="flex flex-col items-center flex-shrink-0">
                    {/* ✨ SIZE: Reduced to w-8 h-8 (RootRise) */}
                    <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
                        {displayNumber}
                    </div>
                    <div className="flex flex-col items-center mt-3 space-y-2">
                        <button onClick={() => toggleMarkForReview(question.id)} className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Mark for Review">
                            <Flag className={`w-5 h-5 ${markedForReview.has(question.id) ? "fill-purple-600 text-purple-600" : ""}`} />
                        </button>
                        <button onClick={() => toggleBookmark(question.id)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Bookmark">
                            <Bookmark className={`w-5 h-5 ${bookmarkedQuestions.has(question.id) ? "fill-blue-600 text-blue-600" : ""}`} />
                        </button>
                    </div>
                </div>
                
                {/* CONTENT COLUMN */}
                <div className="flex-1 min-w-0">
                    {/* ✨ SIZE: Reduced to text-lg (RootRise) */}
                    <p className="text-lg text-gray-900 font-semibold leading-relaxed whitespace-pre-line">
                        {question.text}
                    </p>
                    
                    <div className={`pt-4 grid ${isLongOption ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
                        {question.options.map((option) => (
                            <div 
                                key={option.label} 
                                className={getOptionStyle(option.label)}
                                // No onClick here -> Read Only for Desktop
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

const QuestionColumn = () => {
  const { questions, quizGroupBy, isGroupingEnabled } = useQuizStore();
  const { 
    setCurrentQuestionNumberInView, setIsPageScrolled, setCurrentGroupInView, 
    isTopBarVisible, setIsTopBarVisible 
  } = useQuizUIStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const groupObserverRef = useRef<IntersectionObserver | null>(null);
  const questionObserverRef = useRef<IntersectionObserver | null>(null);

  const questionsByGroup = useMemo(() => {
    if (!quizGroupBy || !isGroupingEnabled) return null;
    return questions.reduce((acc, q) => {
        const groupKey = String(q[quizGroupBy] || 'Uncategorized');
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(q);
        return acc;
    }, {} as Record<string, Question[]>);
  }, [questions, quizGroupBy, isGroupingEnabled]);

  const sortedGroups = useMemo(() => {
    if (!questionsByGroup) return [];
    return Object.keys(questionsByGroup).sort();
  }, [questionsByGroup]);

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

  // Observers (Group & Question)
  useEffect(() => {
    if (groupObserverRef.current) groupObserverRef.current.disconnect();
    const container = scrollContainerRef.current;
    if (!container || !isGroupingEnabled) { setCurrentGroupInView(null); return; }
    groupObserverRef.current = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                setCurrentGroupInView(entry.target.getAttribute('data-group'));
                break; 
            }
        }
    }, { root: container, rootMargin: "-40% 0px -60% 0px", threshold: 0 });
    container.querySelectorAll('[data-group]').forEach(el => groupObserverRef.current?.observe(el));
    return () => groupObserverRef.current?.disconnect();
  }, [sortedGroups, isGroupingEnabled]);

  useEffect(() => {
      if (questionObserverRef.current) questionObserverRef.current.disconnect();
      const container = scrollContainerRef.current;
      if (!container) return;
      questionObserverRef.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cardId = entry.target.id.replace("question-card-", "");
              setCurrentQuestionNumberInView(Number(cardId));
            }
          });
      }, { root: container, rootMargin: "-50% 0px -50% 0px", threshold: 0 });
      container.querySelectorAll('[id^="question-card-"]').forEach(el => questionObserverRef.current?.observe(el));
      return () => questionObserverRef.current?.disconnect();
  }, [questions, setCurrentQuestionNumberInView]);

  let questionCounter = 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-6 pb-24">
          {isGroupingEnabled && questionsByGroup && sortedGroups.map(groupName => (
            <div key={groupName} id={`group-${groupName}`}>
              <div data-group={groupName} className="py-2 mt-4 sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                  <div className="bg-gray-200 text-gray-700 font-bold text-sm py-2 px-4 rounded-full inline-block capitalize shadow-sm">{groupName}</div>
              </div>
              {questionsByGroup[groupName].map((question) => {
                  questionCounter++;
                  return <QuestionCard key={question.id} question={question} displayNumber={questionCounter} />
              })}
            </div>
          ))}
          {!isGroupingEnabled && questions.map((question, index) => <QuestionCard key={question.id} question={question} displayNumber={index + 1} />)}
        </div>
      </div>
      
      {/* MOBILE FAB */}
      <div className="absolute bottom-6 right-6 z-50 lg:hidden">
        {isPaletteOpen && <QuestionPalette onClose={() => setIsPaletteOpen(false)} />}
        <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform mt-4">
            <Grid className={`w-6 h-6 transition-transform duration-300 ${isPaletteOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default QuestionColumn;