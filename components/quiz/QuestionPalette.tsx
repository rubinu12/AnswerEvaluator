"use client";

import React, { FC, useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // 1. Use the new Zustand store

interface QuestionPaletteProps {
    onClose: () => void;
}

const QuestionPalette: FC<QuestionPaletteProps> = ({ onClose }) => {
    // 2. Select all necessary state and actions from the store
    const { questions, userAnswers, currentQuestionInView, setCurrentQuestionInView } = useQuizStore();
    const paletteContainerRef = useRef<HTMLDivElement>(null);

    // Synchronized Scrolling Logic (preserved and updated for 0-based index)
    useEffect(() => {
        if (paletteContainerRef.current) {
            const activeButton = paletteContainerRef.current.querySelector(`#palette-btn-${currentQuestionInView}`);
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentQuestionInView]);

    // 3. Updated to work with 0-based index and scroll to the correct card
    const scrollToQuestion = (questionIndex: number) => {
        setCurrentQuestionInView(questionIndex);
        const questionElement = document.getElementById(`question-card-${questionIndex + 1}`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        onClose(); // Close the palette after selection
    };

    // 4. Refactored to get status based on 0-based index
    const getStatusClass = (index: number): string => {
        const questionId = questions[index]?.id;
        if (currentQuestionInView === index) return 'bg-blue-100 border-blue-500 text-blue-600';
        // Mark for review logic is removed to match QuestionColumn
        if (userAnswers.some(a => a.questionId === questionId)) return 'bg-green-100 border-green-300 text-green-700';
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
                    {questions.map((q, index) => (
                        <button
                            key={q.id}
                            id={`palette-btn-${index}`}
                            onClick={() => scrollToQuestion(index)}
                            className={`btn w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border ${getStatusClass(index)}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
