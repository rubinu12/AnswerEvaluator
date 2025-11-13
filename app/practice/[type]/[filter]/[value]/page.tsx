// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation'; // This import is correct for Next.js
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
  // (This is YOUR original, correct state logic)
  const {
    isLoading: quizLoading,
    quizError,
    loadAndStartQuiz,
    isTestMode, // <-- We use this for the layout fix
    showReport,
    questions,
  } = useQuizStore();

  // (This is YOUR original, correct state logic)
  const {
    explanationModalQuestionId,
    closeExplanationModal,
  } = useQuizUIStore();
  // --- 💎 --- END OF STATE SPLIT --- 💎 ---

  // (This is YOUR original, correct useEffect)
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

  // (This is YOUR original, correct useMemo)
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
    // (This is YOUR original, correct error handling)
    return <ErrorDisplay message={quizError.message} />;
  }

  // --- THIS IS THE CORRECTED LAYOUT ---
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      
      {/* 1. Header controller is unchanged */}
      <Header />
      
      {/* 2. <TestStatusBar /> is REMOVED (Correct) */}
      {/* 3. {showReport && <ReportCard />} is REMOVED (Correct) */}

      {/* --- 💎 --- FIX --- 💎 --- */}
      {/* The <main> tag now dynamically sets its padding-top */}
      <main className={`flex-1 flex flex-col lg:flex-row overflow-hidden ${
        isTestMode ? 'pt-[69px]' : 'pt-40'
      }`}>
        
        <div className="flex-1 min-w-0 h-full">
          <QuestionColumn />
        </div>

        <div className="hidden lg:block w-full lg:w-72 xl:w-80 h-full flex-shrink-0">
          <AnswerColumn />
        </div>

      </main>
      {/* --- 💎 --- END OF FIX --- 💎 --- */}


      {/* (This is YOUR original, correct modal logic) */}
      {questionForModal && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
          onMouseDown={closeExplanationModal} 
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* (This is YOUR original, correct component call) */}
              <ExplanationController 
                question={questionForModal} 
                onClose={closeExplanationModal} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}