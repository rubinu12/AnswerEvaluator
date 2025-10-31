// components/quiz/QuestionPalette.tsx
"use client";

import React, { FC, useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // 1. Use the new Zustand store

interface QuestionPaletteProps {
    onClose: () => void;
}

const QuestionPalette: FC<QuestionPaletteProps> = ({ onClose }) => {
    // 2. Select all necessary state (using our 1-based number)
    const { 
      questions, 
      userAnswers, 
      markedForReview, // Added this back
      currentQuestionNumberInView, // Use 1-based number
      setCurrentQuestionNumberInView // Use 1-based setter
    } = useQuizStore();
    
    const paletteContainerRef = useRef<HTMLDivElement>(null);

    // 3. Updated to watch the 1-based number
    useEffect(() => {
        if (paletteContainerRef.current) {
            const activeButton = paletteContainerRef.current.querySelector(
              `#palette-btn-${currentQuestionNumberInView}` // Find 1-based ID
            );
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentQuestionNumberInView]);

    // 4. Updated to take and set the 1-based question number
    const scrollToQuestion = (questionNumber: number) => {
        setCurrentQuestionNumberInView(questionNumber); // Set 1-based number
        const questionElement = document.getElementById(
          `question-card-${questionNumber}` // Find 1-based card
        );
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        onClose(); // Close the palette after selection
    };

    // 5. Refactored to get status based on 1-based number
    const getStatusClass = (qNumber: number): string => {
        const questionId = questions[qNumber - 1]?.id; // Use qNumber-1 to index array
        if (currentQuestionNumberInView === qNumber) 
          return 'bg-blue-100 border-blue-500 text-blue-600';
        if (markedForReview.has(questionId)) // Added this back
          return 'bg-purple-100 border-purple-300 text-purple-700';
        if (userAnswers.some(a => a.questionId === questionId)) 
          return 'bg-green-100 border-green-300 text-green-700';
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    };

    const gridCols = questions.length > 50 ? 'grid-cols-6' : 'grid-cols-5';

    return (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
            <div 
                className="absolute bottom-24 right-6 p-4 bg-gray-50 w-auto rounded-xl shadow-2xl border"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-md font-semibold text-center text-gray-800 mb-4">All Questions</h3>
                <div ref={paletteContainerRef} className={`grid ${gridCols} gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar`}>
                    {/* 6. Looping and passing the 1-based question number */}
                    {questions.map((q) => (
                        <button
                            key={q.id}
                            id={`palette-btn-${q.questionNumber}`}
                            onClick={() => scrollToQuestion(q.questionNumber)}
                            className={`btn w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border ${getStatusClass(q.questionNumber)}`}
                        >
                            {q.questionNumber}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;