// components/quiz/ConfirmationModal.tsx
'use client';

import React from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- 1. Use Zustand Store
import { Question } from '@/lib/quizTypes'; // <-- 2. Use correct types

interface ConfirmationModalProps {
    onClose: () => void;
    onConfirmErase: () => void;
    onConfirmSave: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirmErase, onConfirmSave }) => {
    // 3. Get state from Zustand
    const { questions, userAnswers, bookmarkedQuestions, performanceStats } = useQuizStore();

    // 4. Get stats from the 'performanceStats' object (calculated by ReportCard)
    //    We provide default values in case it's not set yet.
    const { 
      correctCount = 0, 
      incorrectCount = 0, 
      unattemptedCount = questions.length 
    } = performanceStats || {}; 
    
    // This calculation is still custom to this modal
    const getBookmarkedInUnattemptedOrIncorrect = () => {
        let count = 0;
        questions.forEach(q => {
            if (bookmarkedQuestions.has(q.id)) {
                const userAnswer = userAnswers.find(ua => ua.questionId === q.id);
                // If unattempted OR incorrect, count it
                if (!userAnswer || userAnswer.answer !== q.correctAnswer) {
                    count++;
                }
            }
        });
        return count;
    };

    const bookmarkedCount = getBookmarkedInUnattemptedOrIncorrect();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave Review?</h2>
                <p className="text-gray-600 mb-6">
                    You have reviewed your test. If you go back to the dashboard, this result will be lost unless you save it.
                </p>

                <div className="grid grid-cols-2 gap-4 text-left mb-8 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <p className="font-semibold text-gray-800">Test Stats:</p>
                        <ul className="list-disc list-inside text-gray-600 mt-2">
                            <li><span className="font-medium">{correctCount}</span> Correct</li>
                            <li><span className="font-medium">{incorrectCount}</span> Incorrect</li>
                            <li><span className="font-medium">{unattemptedCount}</span> Unattempted</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Review Stats:</p>
                         <ul className="list-disc list-inside text-gray-600 mt-2">
                            <li><span className="font-medium">{bookmarkedCount}</span> Bookmarked</li>
                            <li className="text-xs text-gray-500">(Incorrect or Unattempted)</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onConfirmSave}
                        className="btn w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        Store for Later Review
                    </button>
                    <button
                        onClick={onConfirmErase}
                        className="btn w-full py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
                    >
                        Yes, Erase This Result
                    </button>
                </div>
                <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;