'use client';

import React, { useState, useMemo } from 'react';
import { useEvaluationStore } from '@/lib/store';
import { PreparedQuestion, EvaluationCompletePayload } from '@/lib/types';
import { ChevronDown, Edit3, Trash2, Plus, ArrowUpToLine, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuthContext } from '@/lib/AuthContext';

// Word counting utility
const countWords = (text: string): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const EditableQuestionCard = ({
    question,
    index,
    totalQuestions,
    updateQuestion,
    removeQuestion,
    mergeUp,
}: {
    question: PreparedQuestion;
    index: number;
    totalQuestions: number;
    updateQuestion: (index: number, updatedQuestion: PreparedQuestion) => void;
    removeQuestion: (index: number) => void;
    mergeUp: (index: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAnswer, setEditedAnswer] = useState(question.userAnswer);
    const [editedText, setEditedText] = useState(question.questionText); // Allow editing question text too

    const wordCount = useMemo(() => countWords(editedAnswer), [editedAnswer]);

    const handleSaveChanges = () => {
        updateQuestion(index, { 
            ...question, 
            userAnswer: editedAnswer,
            questionText: editedText 
        });
        setIsEditing(false);
    };

    const handleMarksChange = (marks: number) => {
        updateQuestion(index, { ...question, maxMarks: marks });
    };
    
    // Logic for "Short Question" Warning
    const isTooShort = wordCount < 40;
    
    const wordLimit = question.maxMarks === 10 ? 150 : 250;
    const wordCountColor = wordCount > wordLimit * 1.1 ? 'text-red-500' : wordCount > wordLimit ? 'text-amber-500' : 'text-slate-500';

    return (
        <div className="border-b border-slate-200 last:border-b-0 group/card">
            <div className="flex w-full items-start p-4 gap-4 bg-white hover:bg-slate-50 transition-colors">
                {/* Ticket Number Badge */}
                <div className="flex flex-col items-center gap-1 mt-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                        {index + 1}
                    </span>
                    {/* MERGE UP BUTTON (Only for Q2 onwards) */}
                    {index > 0 && (
                        <button 
                            onClick={() => mergeUp(index)}
                            className="mt-1 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Merge with previous question"
                        >
                            <ArrowUpToLine size={14} />
                        </button>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0" onClick={() => !isEditing && setIsOpen(!isOpen)}>
                    <div className="flex justify-between items-start cursor-pointer">
                        <div className="flex-1 pr-4">
                            <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                                {question.questionText || "Untitled Question"}
                            </h4>
                            {isTooShort && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded w-fit">
                                    <AlertTriangle size={10} />
                                    <span>Looks incomplete. Merge or Edit?</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <select
                                value={question.maxMarks}
                                onChange={(e) => handleMarksChange(Number(e.target.value))}
                                className="rounded-md border-slate-300 shadow-sm text-xs py-1 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                {[10, 15, 20, 25].map(m => <option key={m} value={m}>{m} Marks</option>)}
                            </select>
                            <ChevronDown
                                size={16}
                                className={clsx('text-slate-400 transition-transform', { 'rotate-180': isOpen })}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-3"
                            >
                                {isEditing ? (
                                    <div className="bg-white p-3 rounded-lg border border-blue-400 shadow-sm space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Question Text</label>
                                            <input 
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                className="w-full text-sm border border-slate-200 rounded p-2 mt-1 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400">Your Answer</label>
                                            <textarea
                                                value={editedAnswer}
                                                onChange={(e) => setEditedAnswer(e.target.value)}
                                                className="w-full text-sm text-slate-700 min-h-[200px] p-2 mt-1 border border-slate-200 rounded focus:outline-none focus:border-blue-500 resize-y"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-semibold ${wordCountColor}`}>
                                                {wordCount} / {wordLimit} words
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">Cancel</button>
                                                <button onClick={handleSaveChanges} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <p className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-6 bg-slate-50 p-3 rounded border border-slate-100">
                                            {question.userAnswer || <span className="italic text-slate-400">No answer text extracted...</span>}
                                        </p>
                                        <div className="flex justify-end gap-3 mt-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                                className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default function ReviewCard() {
    const { user, userProfile } = useAuthContext();
    const {
        setIsReviewing,
        preparedData,
        setPreparedData,
        startEvaluation,
        completeEvaluation,
        failEvaluation,
        selectedPaper,
    } = useEvaluationStore();
    const [error, setError] = useState('');

    const updateQuestion = (index: number, updatedQuestion: PreparedQuestion) => {
        const newData = [...preparedData];
        newData[index] = updatedQuestion;
        setPreparedData(newData);
    };

    const removeQuestion = (index: number) => {
        const newData = preparedData.filter((_, i) => i !== index);
        setPreparedData(newData); // Store auto-renumbers in Step 1, but we can trust the map index
    };

    // [NEW] MERGE LOGIC: Combines current question with the previous one
    const mergeUp = (index: number) => {
        if (index === 0) return;
        const prev = preparedData[index - 1];
        const curr = preparedData[index];

        const merged: PreparedQuestion = {
            ...prev,
            userAnswer: `${prev.userAnswer}\n\n${curr.userAnswer}`,
            // We keep the previous question text unless it's empty
            questionText: prev.questionText.length > 10 ? prev.questionText : curr.questionText,
        };

        const newData = [...preparedData];
        newData.splice(index - 1, 2, merged); // Remove 2, insert 1
        setPreparedData(newData);
    };

    // [NEW] ADD LOGIC: Creates a blank slate
    const addNewQuestion = () => {
        const newQ: PreparedQuestion = {
            questionNumber: preparedData.length + 1,
            questionText: "Enter Question Text Here...",
            userAnswer: "Type or paste your answer here...",
            maxMarks: 15,
            directive: "Analyze", // Default
            subject: selectedPaper as any
        };
        setPreparedData([...preparedData, newQ]);
    };

    const handleConfirmEvaluation = async () => {
        setError('');

        if (!user || !userProfile) {
            failEvaluation("Authentication error. Please log in again.");
            return;
        }

        const evaluationCost = preparedData.length;
        if (evaluationCost === 0) {
            setError("Please add at least one question to evaluate.");
            return;
        }

        // [BILLING CHECK - Client Side Pre-Check]
        if (userProfile.subscriptionStatus !== 'PREMIUM' && userProfile.subscriptionStatus !== 'ADMIN') {
            if (userProfile.remainingEvaluations < evaluationCost) {
                setError(`Insufficient Credits. Cost: ${evaluationCost}, You have: ${userProfile.remainingEvaluations}`);
                return;
            }
        }

        // Renumber one last time to be safe
        const correctlyNumberedData = preparedData.map((q, i) => ({ ...q, questionNumber: i + 1 }));
        setPreparedData(correctlyNumberedData);

        setIsReviewing(false);
        startEvaluation();
        
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    preparedData: correctlyNumberedData,
                    subject: selectedPaper,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Evaluation failed.');
            
            // --- [CRITICAL FIX: Unwrap the Data] ---
            completeEvaluation({
                analysis: result.analysis, 
                preparedData: correctlyNumberedData,
                subject: selectedPaper as EvaluationCompletePayload['subject'],
            });

        } catch (err: any) {
            console.error("Evaluation Error:", err);
            failEvaluation(err.message);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Review Tickets</h3>
                    <p className="text-xs text-slate-500">
                        {preparedData.length} Ticket{preparedData.length !== 1 ? 's' : ''} generated from your upload.
                    </p>
                </div>
                <button 
                    onClick={addNewQuestion}
                    className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {preparedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <p className="text-sm">No questions found.</p>
                        <button onClick={addNewQuestion} className="text-blue-600 text-sm font-semibold mt-2 hover:underline">Add one manually</button>
                    </div>
                ) : (
                    preparedData.map((q, index) => (
                        <EditableQuestionCard
                            key={index} // Index is safe here as we rebuild array on change
                            index={index}
                            totalQuestions={preparedData.length}
                            question={q}
                            updateQuestion={updateQuestion}
                            removeQuestion={removeQuestion}
                            mergeUp={mergeUp}
                        />
                    ))
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
                
                <div className="flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 hidden sm:block">
                        <strong>Cost:</strong> {preparedData.length} Credits
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => { setIsReviewing(false); setPreparedData([]); }}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleConfirmEvaluation}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            Confirm & Evaluate <span className="opacity-70 text-xs font-normal">({preparedData.length} Credits)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}