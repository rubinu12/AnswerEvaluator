// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect, useMemo } from 'react'; // <-- Added useMemo
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';
import { QuizFilter } from '@/lib/quizTypes';
import { X } from 'lucide-react'; // <-- Added X for close button

// --- 1. IMPORT AuthContext ---
import { useAuthContext } from '@/lib/AuthContext'; 

// --- Polished UI Components ---
import Header from '@/components/quiz/Header';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import TestStatusBar from '@/components/quiz/TestStatusBar';
import ReportCard from '@/components/quiz/ReportCard';

// --- 💎 NEW "MODAL SHEET" COMPONENT 💎 ---
import ExplanationController from '@/components/quiz/ExplanationController'; 

// --- Placeholders ---
// (Modified to accept a message)
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
  
  // --- 2. GET AUTH STATE ---
  // Renamed `loading` to `authLoading` to avoid conflicts
  const { user, loading: authLoading } = useAuthContext();

  const {
    isLoading: quizLoading, // Renamed `isLoading` to `quizLoading`
    quizError,
    loadAndStartQuiz,
    isTestMode,
    showReport,
    questions, // Get questions to check if we are rehydrating
    
    // --- 💎 NEW STATE FOR MODAL (AS REQUESTED) 💎 ---
    explanationModalQuestionId,
    closeExplanationModal,
  } = useQuizStore();

  // --- 3. MODIFY useEffect TO WAIT FOR AUTH ---
  useEffect(() => {
    // Wait for Firebase auth to be ready
    if (authLoading) {
      return; 
    }

    // If auth is done and there's no user, loadAndStartQuiz will handle the error
    if (!user) {
      // return; // Let loadAndStartQuiz throw the "not authenticated" error
    }

    // If we reload a page and the state is rehydrated,
    // we don't need to fetch the quiz again.
    if (questions.length > 0) {
      useQuizStore.setState({ isLoading: false }); // Ensure loading is false
      return;
    }

    // Auth is ready, user exists, and we have no questions.
    // This is a fresh load, so fetch the quiz.
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
    
  }, [params, loadAndStartQuiz, authLoading, user, questions.length]); // Add auth dependencies

  // --- 💎 NEW: FIND THE QUESTION FOR THE MODAL 💎 ---
  const questionForModal = useMemo(() => {
    if (!explanationModalQuestionId) return null;
    return questions.find((q) => q.id === explanationModalQuestionId) || null;
  }, [explanationModalQuestionId, questions]);

  // --- 4. ADD RENDER LOGIC FOR AUTH LOADING ---
  
  // Show auth loading first
  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }
  
  // Then show quiz loading
  if (quizLoading) {
    return <LoadingScreen />;
  }

  // Then show errors
  if (quizError) {
    return <ErrorDisplay message={quizError.message} />;
  }

  // Finally, show the app
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

      {/* --- 💎 NEW "MODAL SHEET" (AS REQUESTED) 💎 --- */}
      {questionForModal && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
          onMouseDown={closeExplanationModal} // Click outside to close
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()} // Prevent content clicks from closing modal
          >
            {/* Note: The "Smart" Controller (ExplanationController)
              is now responsible for its own internal header/close button
              if the design requires it. This outer shell is just the dialog.
              
              Based on our earlier fix, ExplanationController needs an `onClose`
              prop, so we provide it.
            */}
            
            {/* The "Smart" Controller */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ExplanationController 
                question={questionForModal} 
                onClose={closeExplanationModal} 
              />
            </div>
          </div>
        </div>
      )}
      {/* --- 💎 END OF MODAL SHEET 💎 --- */}
    </div>
  );
}