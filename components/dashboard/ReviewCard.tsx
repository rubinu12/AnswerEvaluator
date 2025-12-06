'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useEvaluationStore } from '@/lib/store';
import { PreparedQuestion, EvaluationCompletePayload } from '@/lib/types';
import { ChevronDown, Edit3, Trash2, Plus, ArrowUpToLine, AlertTriangle, Save, X } from 'lucide-react';
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
    isEditing, // Controlled by Parent
    setEditing, // Function to tell parent "I want to edit"
    onSave,     // Function to save data and close
    onCancel,   // Function to close without saving
    removeQuestion,
    mergeUp,
}: {
    question: PreparedQuestion;
    index: number;
    isEditing: boolean;
    setEditing: () => void;
    onSave: (qText: string, aText: string) => void;
    onCancel: () => void;
    removeQuestion: (index: number) => void;
    mergeUp: (index: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    
    // Local form state
    const [editedAnswer, setEditedAnswer] = useState(question.userAnswer);
    const [editedText, setEditedText] = useState(question.questionText);

    // Sync local state when the card enters Edit Mode or Props change
    useEffect(() => {
        setEditedAnswer(question.userAnswer);
        setEditedText(question.questionText);
    }, [isEditing, question.userAnswer, question.questionText]);

    const wordCount = useMemo(() => countWords(editedAnswer), [editedAnswer]);

    // Derived State
    const isTooShort = wordCount < 40;
    const wordLimit = question.maxMarks === 10 ? 150 : 250;
    const wordCountColor = wordCount > wordLimit * 1.1 ? 'text-red-500' : wordCount > wordLimit ? 'text-amber-500' : 'text-slate-500';

    return (
        <div className={`border-b border-slate-200 last:border-b-0 group/card ${isEditing ? 'bg-blue-50/30' : ''}`}>
            <div className="flex w-full items-start p-4 gap-4 bg-white hover:bg-slate-50 transition-colors">
                {/* Badge */}
                <div className="flex flex-col items-center gap-1 mt-1">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border transition-colors ${
                        isEditing ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {index + 1}
                    </span>
                    {index > 0 && !isEditing && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); mergeUp(index); }}
                            className="mt-1 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Merge with previous question"
                        >
                            <ArrowUpToLine size={14} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => !isEditing && setIsOpen(!isOpen)}>
                    <div className="flex justify-between items-start cursor-pointer">
                        <div className="flex-1 pr-4">
                            <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                                {question.questionText || "Untitled Question"}
                            </h4>
                            {isTooShort && !isEditing && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded w-fit">
                                    <AlertTriangle size={10} />
                                    <span>Looks incomplete. Merge or Edit?</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {question.maxMarks} Marks
                            </div>
                            {!isEditing && (
                                <ChevronDown
                                    size={16}
                                    className={clsx('text-slate-400 transition-transform', { 'rotate-180': isOpen })}
                                />
                            )}
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
                                    <div className="bg-white p-4 rounded-xl border-2 border-blue-500/20 shadow-lg space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Question Text</label>
                                            <input 
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Your Answer</label>
                                            <textarea
                                                value={editedAnswer}
                                                onChange={(e) => setEditedAnswer(e.target.value)}
                                                className="w-full text-sm text-slate-700 min-h-[240px] p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-y leading-relaxed transition-all"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                            <span className={`text-xs font-bold ${wordCountColor}`}>
                                                {wordCount} / {wordLimit} words
                                            </span>
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={onCancel}
                                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={() => onSave(editedText, editedAnswer)} 
                                                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                                >
                                                    <Save size={14} /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <p className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-6 bg-slate-50 p-3 rounded border border-slate-100 font-medium leading-relaxed">
                                            {question.userAnswer || <span className="italic text-slate-400">No answer text extracted...</span>}
                                        </p>
                                        <div className="flex justify-end gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditing(); }}
                                                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                            >
                                                <Edit3 size={12} /> Edit
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
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
    
    // [LIFTED STATE] Track which card is editing (if any)
    // null = no one editing. number = index of editing card.
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleSaveUpdate = (index: number, qText: string, aText: string) => {
        const newData = [...preparedData];
        newData[index] = { 
            ...newData[index], 
            questionText: qText,
            userAnswer: aText 
        };
        setPreparedData(newData);
        setEditingIndex(null); // Close edit mode
    };

    const removeQuestion = (index: number) => {
        if (editingIndex === index) setEditingIndex(null); // Safety reset
        const newData = preparedData.filter((_, i) => i !== index);
        setPreparedData(newData);
    };

    const mergeUp = (index: number) => {
        if (index === 0) return;
        const prev = preparedData[index - 1];
        const curr = preparedData[index];

        const merged: PreparedQuestion = {
            ...prev,
            userAnswer: `${prev.userAnswer}\n\n${curr.userAnswer}`,
            questionText: prev.questionText.length > 10 ? prev.questionText : curr.questionText,
        };

        const newData = [...preparedData];
        newData.splice(index - 1, 2, merged);
        setPreparedData(newData);
        setEditingIndex(null); // Reset to be safe
    };

    const addNewQuestion = () => {
        const newQ: PreparedQuestion = {
            questionNumber: preparedData.length + 1,
            questionText: "Enter Question Text Here...",
            userAnswer: "Type or paste your answer here...",
            maxMarks: 15,
            directive: "Analyze",
            subject: selectedPaper as any
        };
        setPreparedData([...preparedData, newQ]);
        setEditingIndex(preparedData.length); // Auto-open edit for new question
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

        if (userProfile.subscriptionStatus !== 'PREMIUM' && userProfile.subscriptionStatus !== 'ADMIN') {
            if (userProfile.remainingEvaluations < evaluationCost) {
                setError(`Insufficient Credits. Cost: ${evaluationCost}, You have: ${userProfile.remainingEvaluations}`);
                return;
            }
        }

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

    // [SAFETY LOCK] Disable button if ANY card is in edit mode
    const isConfirmDisabled = editingIndex !== null;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Review Tickets</h3>
                    <p className="text-xs text-slate-500">
                        {preparedData.length} Ticket{preparedData.length !== 1 ? 's' : ''} generated.
                    </p>
                </div>
                <button 
                    onClick={addNewQuestion}
                    className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {preparedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <p className="text-sm">No questions found.</p>
                        <button onClick={addNewQuestion} className="text-blue-600 text-sm font-semibold mt-2 hover:underline">Add one manually</button>
                    </div>
                ) : (
                    preparedData.map((q, index) => (
                        <EditableQuestionCard
                            key={index}
                            index={index}
                            question={q}
                            // [LIFTED STATE PROPS]
                            isEditing={editingIndex === index}
                            setEditing={() => setEditingIndex(index)}
                            onCancel={() => setEditingIndex(null)}
                            onSave={(qText, aText) => handleSaveUpdate(index, qText, aText)}
                            // Actions
                            removeQuestion={removeQuestion}
                            mergeUp={mergeUp}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                            disabled={isConfirmDisabled}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                                isConfirmDisabled 
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                            }`}
                        >
                            {isConfirmDisabled ? 'Save open edits to continue' : 'Confirm & Evaluate'}
                            {!isConfirmDisabled && <span className="opacity-70 text-xs font-normal ml-1">({preparedData.length})</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}