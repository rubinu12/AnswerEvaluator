// app/admin/editor/[questionId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/lib/AuthContext';
import { User } from 'firebase/auth';
import {
  Question,
  BackendQuestion,
  isUltimateExplanation,
  UltimateExplanation,
} from '@/lib/quizTypes';
import AdminHeader from '@/app/admin/components/AdminHeader';
import CommandCenter from './CommandCenter'; // Our "Row 1" component
import ExplanationWorkspace from './ExplanationWorkspace'; // --- 💎 IMPORT "ROW 2" 💎 ---

// A simple loader
const AdminPageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-2xl">Loading Editor...</p>
  </div>
);

// This is our new "perfect" Admin Editor Page
export default function AdminEditorPage() {
  const { user, loading: authLoading } = useAuthContext();
  const params = useParams();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This is the "perfect" state that connects Row 1 and Row 2
  const [liveExplanation, setLiveExplanation] =
    useState<UltimateExplanation | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for user to be ready
    if (!user) {
      setError('You must be logged in as an Admin to access this page.');
      setIsLoading(false);
      return;
    }

    if (!questionId) {
      setError('No Question ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchQuestion = async () => {
      try {
        const docRef = doc(db, 'questions', questionId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Question not found.');
        }

        const data = docSnap.data() as BackendQuestion;

        // "Perfectly" transform the BackendQuestion to our Question type
        const processedQuestion: Question = {
          id: docSnap.id,
          questionNumber: 0, // Not needed for editor
          text: data.questionText,
          questionType: data.questionType || 'SingleChoice',
          options: [
            { label: 'A', text: data.optionA },
            { label: 'B', text: data.optionB },
            { label: 'C', text: data.optionC },
            { label: 'D', text: data.optionD },
          ],
          correctAnswer: data.correctOption,
          // Unify explanation, just like in our "perfect" quizStore
          explanation:
            data.explanation || data.explanationText || '',
        };

        setQuestion(processedQuestion);

        // Pre-fill the editor if we have an explanation
        if (isUltimateExplanation(processedQuestion.explanation)) {
          setLiveExplanation(processedQuestion.explanation);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, user, authLoading]);

  if (isLoading || authLoading) {
    return <AdminPageLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!question) {
    return <AdminPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onBulkAddClick={function (): void {
        throw new Error('Function not implemented.');
      } } onNewQuestionClick={function (): void {
        throw new Error('Function not implemented.');
      } } />
      
      {/* --- YOUR "PERFECT" TWO-ROW LAYOUT --- */}
      <div className="p-4 md:p-8">
        
        {/* --- ROW 1: THE COMMAND CENTER --- */}
        <CommandCenter
          question={question}
          initialExplanation={liveExplanation}
          // This "perfectly" passes data from Row 1 to Row 2
          onParse={setLiveExplanation} 
        />
        
        {/* --- 💎 ROW 2: "PERFECTLY" RENDERED 💎 --- */}
        <ExplanationWorkspace
          questionId={question.id}
          liveExplanation={liveExplanation}
        />
        
      </div>
    </div>
  );
}