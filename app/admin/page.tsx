"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Using our corrected firebase config
import { Question } from '@/lib/quizTypes'; // Using our unified Question type
import QuestionList from './components/QuestionList';
import AdminHeader from './components/AdminHeader';
import BulkAddModal from './components/BulkAddModal';
import QuestionEditorModal from './components/QuestionEditorModal';

export default function Page() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

    // Refactored to fetch directly from Firestore
    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const questionsRef = collection(db, 'questions');
            // Query to get all questions, ordered by year (descending)
            const q = query(questionsRef, orderBy('year', 'desc'));
            
            const querySnapshot = await getDocs(q);
            const fetchedQuestions: Question[] = [];
            querySnapshot.forEach((doc) => {
                fetchedQuestions.push({ id: doc.id, ...doc.data() } as Question);
            });
            
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error("Failed to fetch questions from Firestore", error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    if (isLoading && questions.length === 0) {
        return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Questions...</div>;
    }

    return (
        <div className="bg-gray-50 h-screen flex flex-col font-sans">
            <header className="flex-shrink-0 z-10">
                <AdminHeader 
                    onBulkAddClick={() => setIsBulkAddModalOpen(true)}
                    onNewQuestionClick={() => setIsEditorModalOpen(true)}
                />
            </header>
            
            <main className="flex-1 flex flex-row overflow-hidden">
                <div className="w-full border-r border-gray-200 bg-white flex flex-col">
                    <QuestionList 
                        questions={questions}
                        selectedQuestionIds={selectedQuestionIds}
                        setSelectedQuestionIds={setSelectedQuestionIds}
                    />
                </div>
            </main>
            
            {isBulkAddModalOpen && (
                <BulkAddModal 
                    onClose={() => setIsBulkAddModalOpen(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        setIsBulkAddModalOpen(false);
                    }}
                />
            )}

            {isEditorModalOpen && (
                <QuestionEditorModal
                    onClose={() => setIsEditorModalOpen(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        setIsEditorModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}