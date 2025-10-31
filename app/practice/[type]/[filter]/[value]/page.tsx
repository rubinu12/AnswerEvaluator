// app/practice/[type]/[filter]/[value]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';
import { QuizFilter } from '@/lib/quizTypes';

// --- Polished UI Components ---
import Header from '@/components/quiz/Header';
import DynamicQuizCommandBar from '@/components/quiz/DynamicQuizCommandBar';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import TestStatusBar from '@/components/quiz/TestStatusBar';
import ReportCard from '@/components/quiz/ReportCard';

// --- Placeholders ---
// We'll replace these with real components later
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-2xl">Loading Quiz...</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-2xl text-red-500">{message}</p>
  </div>
);

export default function QuizPage() {
  const params = useParams();

  // 1. Get the state and actions from our Zustand store
  const {
    isLoading,
    quizError,
    loadAndStartQuiz,
    isTestMode,
    showReport,
  } = useQuizStore();

  useEffect(() => {
    // 2. Parse the URL parameters to create a filter
    const filter: QuizFilter = {};
    const type = params.type as string; // 'subject', 'year', 'topic'
    const filterKey = params.filter as string; // 'polity', '2023', etc.
    const value = params.value as string; // 'all' or specific value

    // This logic determines what to fetch from the API
    if (type === 'subject') {
      filter.subject = filterKey;
      if (value !== 'all') filter.topic = value;
    } else if (type === 'year') {
      filter.exam = filterKey;
      if (value !== 'all') filter.year = value;
    } else if (type === 'topic') {
      filter.topic = filterKey;
    }

    // 3. Call the action from our store to load the quiz
    loadAndStartQuiz(filter);
    
    // This is a "practice" page, so we set isTestMode to false.
    // We will handle Test Mode later.
    useQuizStore.setState({ isTestMode: false });

  }, [params, loadAndStartQuiz]); // Dependencies

  // --- Render based on state ---

  // 4. Handle Loading State
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 5. Handle Error State
  if (quizError) {
    return <ErrorDisplay message={quizError.message} />;
  }

  // 6. Render the Full Quiz UI
  return (
    <div className="flex flex-col min-h-screen">
      {/* The main header (Title, Submit Button) */}
      <Header />

      {/* The dynamic polished submenu (Shows Topic, Performance, etc.) */}
      <DynamicQuizCommandBar />

      {/* The blue status bar (Only shows in "Test Mode") */}
      <TestStatusBar />

      {/* The modal that shows final results */}
      {showReport && <ReportCard />}

      <main className="flex-1 w-full max-w-full mx-auto">
        <div className="grid grid-cols-12 h-full">
          
          {/* Column 1: The Question List */}
          <QuestionColumn />

          {/* Column 2: The Answer Palette */}
          <AnswerColumn />
          
        </div>
      </main>
    </div>
  );
}