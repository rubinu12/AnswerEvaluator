'use client';

import React, { useState } from 'react';
import { useEvaluationStore } from '@/lib/store';
import { PreparedQuestion, EvaluationCompletePayload } from '@/lib/types';
import { ChevronDown, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// A final, perfected sub-component for a single question card
const EditableQuestionCard = ({
    question,
    index,
    updateQuestion,
    removeQuestion,
}: {
    question: PreparedQuestion;
    index: number;
    updateQuestion: (index: number, updatedQuestion: PreparedQuestion) => void;
    removeQuestion: (index: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAnswer, setEditedAnswer] = useState(question.userAnswer);

    const handleSaveChanges = () => {
        updateQuestion(index, { ...question, userAnswer: editedAnswer });
        setIsEditing(false);
    };

    const handleMarksChange = (marks: number) => {
        updateQuestion(index, { ...question, maxMarks: marks });
    };

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            {/* Header section for collapsing and marks */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                {/* --- [THE FIX] Use the card's index for sequential numbering --- */}
                <strong className="font-semibold text-slate-800 truncate flex-1 text-left">
                    Q{index + 1}: {question.questionText.substring(0, 100)}...
                </strong>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                        value={question.maxMarks}
                        onChange={(e) => handleMarksChange(Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1"
                    >
                        {[10, 15, 20, 25].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown
                        size={20}
                        className={clsx('text-slate-500 transition-transform', { 'rotate-180': isOpen })}
                    />
                </div>
            </div>
            {/* Collapsible content area */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50/50">
                            {isEditing ? (
                                // EDIT MODE
                                <div className="bg-white p-2 rounded-md border border-blue-400 shadow-inner">
                                    <textarea
                                        value={editedAnswer}
                                        onChange={(e) => setEditedAnswer(e.target.value)}
                                        className="w-full text-sm text-slate-700 min-h-[300px] resize-none focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md">Cancel</button>
                                        <button onClick={handleSaveChanges} className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div className="relative group">
                                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                                        <div className="text-sm text-slate-800 space-y-4">
                                            <p className="font-bold">Q: {question.questionText}</p>
                                            <p className="whitespace-pre-wrap text-slate-700">{question.userAnswer}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsEditing(true)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-white flex items-center gap-1">
                                        <Edit3 size={12} /> Edit
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-end mt-2">
                                <button onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// The main ReviewCard component
export default function ReviewCard() {
    const {
        setIsReviewing,
        preparedData,
        setPreparedData,
        startEvaluation,
        completeEvaluation,
        failEvaluation,
        selectedPaper,
    } = useEvaluationStore();

    const updateQuestion = (index: number, updatedQuestion: PreparedQuestion) => {
        const newData = [...preparedData];
        newData[index] = updatedQuestion;
        setPreparedData(newData);
    };

    const removeQuestion = (index: number) => {
        const newData = preparedData.filter((_, i) => i !== index);
        // We still need to update the questionNumber in the data for when it's saved
        const renumberedData = newData.map((q, i) => ({ ...q, questionNumber: i + 1 }));
        setPreparedData(renumberedData);
    };

    const handleConfirmEvaluation = async () => {
        // Before sending to backend, ensure the data has the correct sequential numbers
        const correctlyNumberedData = preparedData.map((q, i) => ({ ...q, questionNumber: i + 1 }));
        setPreparedData(correctlyNumberedData);

        setIsReviewing(false);
        startEvaluation();
        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preparedData: correctlyNumberedData, // Send the corrected data
                    subject: selectedPaper,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get final evaluation.');
            }
            completeEvaluation({
                analysis: result,
                preparedData: correctlyNumberedData, // Use corrected data for final payload
                subject: selectedPaper as EvaluationCompletePayload['subject'],
            });
        } catch (err: any) {
            failEvaluation(err.message);
        }
    };

    const handleCancelReview = () => {
        setIsReviewing(false);
        setPreparedData([]);
    };

    return (
        <>
            <style jsx global>{`
                .custom-scrollbar {
                    scrollbar-width: none; /* For Firefox */
                    -ms-overflow-style: none; /* For Internet Explorer and Edge */
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }
            `}</style>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/60 flex flex-col min-h-[85vh]">
                <h3 className="text-xl font-bold text-slate-800">Review Your Answer</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                    The AI's transcription is below. Click "Edit" to make changes.
                </p>
                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {preparedData.map((q, index) => (
                            <EditableQuestionCard
                                key={index}
                                index={index}
                                question={q}
                                updateQuestion={updateQuestion}
                                removeQuestion={removeQuestion}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex space-x-4 mt-6 pt-4 border-t">
                    <button
                        onClick={handleCancelReview}
                        className="w-full rounded-lg px-6 py-3 text-md font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmEvaluation}
                        className="w-full rounded-lg px-6 py-3 text-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all btn"
                    >
                        Confirm & Start Evaluation
                    </button>
                </div>
            </div>
        </>
    );
}