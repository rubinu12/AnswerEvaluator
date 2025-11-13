// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { QuizFilter } from '@/lib/quizTypes';
import { X } from 'lucide-react';

import { useAuthContext } from '@/lib/AuthContext'; 

import Header from '@/components/quiz/Header';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import TestStatusBar from '@/components/quiz/TestStatusBar';
import DynamicQuizCommandBar from '@/components/quiz/DynamicQuizCommandBar';
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
    questions,
    // We no longer need clearQuizSession here
  } = useQuizStore();

  const {
    explanationModalQuestionId,
    closeExplanationModal,
    isTopBarVisible,
  } = useQuizUIStore();

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    // --- 💎 --- THIS IS THE FIX --- 💎 ---
    // We are no longer clearing the session here.
    // We just create the filter and load the quiz.
    // The store's "smart" loadAndStartQuiz will handle the rest.
    // --- 💎 --- END OF FIX --- 💎 ---

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
    
  }, [params, loadAndStartQuiz, authLoading, user]); // Removed clearQuizSession

  const questionForModal = useMemo(() => {
    if (!explanationModalQuestionId) return null;
    return questions.find((q) => q.id === explanationModalQuestionId) || null;
  }, [explanationModalQuestionId, questions]);

  
  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }
  
  // This loading logic is correct
  if (quizLoading && questions.length === 0) {
    return <LoadingScreen />;
  }

  if (quizError) {
    return <ErrorDisplay message={quizError.message} />;
  }

  const mainPadding = isTestMode
    ? 'pt-[69px]' 
    : isTopBarVisible
      ? 'pt-32'
      : 'pt-16';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      
      {isTestMode ? (
        <TestStatusBar />
      ) : (
        <>
          <Header />
          <DynamicQuizCommandBar />
        </>
      )}

      <main className={`flex-1 flex flex-col lg:flex-row overflow-hidden ${mainPadding}`}>
        
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