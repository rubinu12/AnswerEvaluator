"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuizStore } from "@/lib/quizStore"; // 1. Use the new Zustand store
import { Question } from "@/lib/quizTypes"; // Use our unified types
import QuestionPalette from './QuestionPalette'; 

// --- Refactored QuestionCard ---
const QuestionCard = ({ question, displayNumber }: { question: Question, displayNumber: number }) => {
    // 2. Select state and actions from the store
    const { 
        userAnswers, mode, currentQuestionInView,
        bookmarkedQuestions, toggleBookmark
    } = useQuizStore();
    
    const isLongOption = question.options.some((opt) => opt.text.length > 50);
    const userAnswer = userAnswers.find((ua) => ua.questionId === question.id);

    // 3. Updated styling logic for the new data structures
    const getOptionStyle = (optionIndex: number) => {
        const baseClasses = "p-4 rounded-lg border text-left font-medium transition-all duration-200";
        const isSelected = userAnswer?.selectedOption === optionIndex;
        const isCorrect = question.options[optionIndex].isCorrect;

        if (mode === 'review') {
            if (isCorrect) return `${baseClasses} bg-green-100 border-green-300 text-green-700`;
            if (isSelected && !isCorrect) return `${baseClasses} bg-red-100 border-red-300 text-red-700`;
        }
        if (isSelected) return `${baseClasses} bg-blue-100 border-blue-300 text-blue-800`;
        return `${baseClasses} bg-white border-gray-300`;
    };

    return (
        <div id={`question-card-${displayNumber}`} className={`rounded-xl p-6 border relative transition-all duration-300 mb-6 ${currentQuestionInView === (displayNumber - 1) ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {displayNumber}
                    </div>
                    <div className="flex flex-col items-center mt-3 space-y-2">
                        {/* Mark for review can be added back later if needed */}
                        <button onClick={() => toggleBookmark(question.id!)} className="p-2 text-gray-400 hover:text-blue-600" title="Bookmark"><i className={bookmarkedQuestions.has(question.id!) ? "ri-bookmark-fill text-blue-600" : "ri-bookmark-line"}></i></button>
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-lg text-gray-900 font-semibold leading-relaxed whitespace-pre-line">{question.questionText}</p>
                    <div className={`pt-4 grid ${isLongOption ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
                        {question.options.map((option, index) => (
                            <div key={index} className={getOptionStyle(index)}>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span><span>{option.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Refactored QuestionColumn ---
const QuestionColumn = () => {
  // 4. Select all necessary state and actions from the store
  const { 
    questions, currentViewAnswerId, closeAnswerView, setCurrentQuestionInView, 
    setPageScrolled, isGroupingEnabled
  } = useQuizStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // Grouping logic is preserved
  const questionsByGroup = useMemo(() => {
    if (!isGroupingEnabled) return null;
    return questions.reduce((acc, q) => {
        const groupKey = q.subject || 'Uncategorized';
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(q);
        return acc;
    }, {} as Record<string, Question[]>);
  }, [questions, isGroupingEnabled]);

  const sortedGroups = useMemo(() => {
    if (!questionsByGroup) return [];
    return Object.keys(questionsByGroup).sort((a, b) => a.localeCompare(b));
  }, [questionsByGroup]);

  // Scroll handler for the sub-header is preserved
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setPageScrolled(container.scrollTop > 20);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setPageScrolled]);

  // IntersectionObserver for question-in-view is preserved and updated
  useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const cardId = entry.target.id.replace("question-card-", "");
              setCurrentQuestionInView(Number(cardId) - 1); // Update store with 0-based index
            }
          });
        }, { root: container, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      const questionElements = container.querySelectorAll('[id^="question-card-"]');
      questionElements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
  }, [questions, setCurrentQuestionInView, isGroupingEnabled]);
  
  // Detailed Answer View logic is preserved
  if (currentViewAnswerId) {
    const question = questions.find((q) => q.id === currentViewAnswerId);
    if (!question) return null;
    
    // Find the display number for the detailed view
    const displayNumber = questions.findIndex(q => q.id === currentViewAnswerId) + 1;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Solution</h3>
                <button onClick={closeAnswerView} className="p-2 rounded-full hover:bg-gray-100"><i className="ri-close-line text-xl"></i></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <div><p className="font-semibold text-lg mb-4 whitespace-pre-line">Q{displayNumber}: {question.questionText}</p></div>
                    {/* The detailed explanation text would go here. We can add it to the Question type later. */}
                    <div><h4 className="font-semibold text-lg mb-2">Explanation:</h4><p className="text-gray-700 leading-relaxed whitespace-pre-line">[Explanation for this question will be displayed here.]</p></div>
                </div>
            </div>
        </div>
    );
  }

  let questionCounter = 0;

  // Main render logic is preserved
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {isGroupingEnabled && questionsByGroup && sortedGroups.map(groupName => (
            <div key={groupName} id={`group-${groupName}`}>
              <div data-group={groupName} className="py-2 mt-4">
                  <div className="bg-gray-200 text-gray-700 font-bold text-sm py-2 px-4 rounded-full inline-block capitalize">{groupName}</div>
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
      <div className="absolute bottom-6 right-6">
        {isPaletteOpen && <QuestionPalette onClose={() => setIsPaletteOpen(false)} />}
        <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform mt-4">
            <i className={`ri-grid-fill text-2xl transition-transform duration-300 ${isPaletteOpen ? 'rotate-45' : ''}`}></i>
        </button>
      </div>
    </div>
  );
};

export default QuestionColumn;
