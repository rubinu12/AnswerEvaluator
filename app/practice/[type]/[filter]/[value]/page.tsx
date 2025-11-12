// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore'; // <-- The "Data Store"
import { useQuizUIStore } from '@/lib/quizUIStore'; // <-- 💎 NEW "UI Store"
import { QuizFilter } from '@/lib/quizTypes';
import { X } from 'lucide-react';

import { useAuthContext } from '@/lib/AuthContext'; 

import Header from '@/components/quiz/Header';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import TestStatusBar from '@/components/quiz/TestStatusBar';
import ReportCard from '@/components/quiz/ReportCard';
import ExplanationController from '@/components/quiz/ExplanationController'; 

const LoadingScreen = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-2xl">{message || 'Loading Quiz...'}</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-2xl text-red-500">{message}</p>
  </div>
);

export default function QuizPage() {
  const params = useParams();
  
  const { user, loading: authLoading } = useAuthContext();

  // --- 💎 --- STATE IS NOW SPLIT --- 💎 ---
  // 1. Get "Data" from the main store
  const {
    isLoading: quizLoading,
    quizError,
    loadAndStartQuiz,
    isTestMode,
    showReport,
    questions,
  } = useQuizStore();

  // 2. Get "UI" state from the new UI store
  const {
    explanationModalQuestionId,
    closeExplanationModal,
  } = useQuizUIStore();
  // --- 💎 --- END OF STATE SPLIT --- 💎 ---

  // This is your original, correct logic
  useEffect(() => {
    if (authLoading) {
      return; 
    }

    const filter: QuizFilter = {};
    const type = params.type as string;
    const filterKey = params.filter as string;
    const value = params.value as string;

    if (type === 'subject') {
      filter.subject = filterKey;
      if (value !== 'all') filter.topic = value;
    } else if (type === 'year') {
      filter.exam = filterKey;
      if (value !== 'all') filter.year = value;
    } else if (type === 'topic') {
      filter.topic = filterKey;
    }

    loadAndStartQuiz(filter);
    useQuizStore.setState({ isTestMode: false });
    
  }, [params, loadAndStartQuiz, authLoading, user]); 

  // This is your original, correct logic
  const questionForModal = useMemo(() => {
    if (!explanationModalQuestionId) return null;
    return questions.find((q) => q.id === explanationModalQuestionId) || null;
  }, [explanationModalQuestionId, questions]);

  
  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }
  
  if (quizLoading) {
    return <LoadingScreen />;
  }

  if (quizError) {
    return <ErrorDisplay message={quizError.message} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Header />
      <TestStatusBar />

      {showReport && <ReportCard />}

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        
        <div className="flex-1 min-w-0 h-full">
          <QuestionColumn />
        </div>

        <div className="hidden lg:block w-full lg:w-72 xl:w-80 h-full flex-shrink-0">
          <AnswerColumn />
        </div>

      </main>

      {/* This `if` check prevents the crash */ }
      {questionForModal && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
          onMouseDown={closeExplanationModal} // <-- This is now from useQuizUIStore
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* --- 💎 --- THIS IS THE FIX --- 💎 --- */}
              {/* We pass the full `question` object, not a string */}
              <ExplanationController 
                question={questionForModal} 
                onClose={closeExplanationModal} 
              />
              {/* --- 💎 --- END OF FIX --- 💎 --- */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}