// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';
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

  const {
    isLoading: quizLoading,
    quizError,
    loadAndStartQuiz,
    isTestMode,
    showReport,
    questions,
    
    explanationModalQuestionId,
    closeExplanationModal,
  } = useQuizStore();

  // --- 💎 THIS IS THE FIX 💎 ---
  useEffect(() => {
    // Wait for Firebase auth to be ready
    if (authLoading) {
      return; 
    }

    // --- 💎 REMOVED THE FAULTY CHECK 💎 ---
    // We are *REMOVING* the `if (questions.length > 0)` check.
    // We *WANT* loadAndStartQuiz to run every single time to ensure
    // we clear localStorage (via its own internal call) and fetch fresh data.
    // This is the only way to guarantee we clear out the "broken"
    // student state that is crashing the app.

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
    
  // 💎 We REMOVE `questions.length` from the dependency array
  // to prevent this from re-running when questions are loaded.
  }, [params, loadAndStartQuiz, authLoading, user]); 
  // --- 💎 END OF FIX 💎 ---

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