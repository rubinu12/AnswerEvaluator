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

  const {
    isLoading,
    quizError,
    loadAndStartQuiz,
    isTestMode,
    showReport,
  } = useQuizStore();

  useEffect(() => {
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
  }, [params, loadAndStartQuiz]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (quizError) {
    return <ErrorDisplay message={quizError.message} />;
  }

  // --- *** THE "PIXEL-PERFECT" LAYOUT FIX IS HERE *** ---
  // This layout matches the original rootrise/app/quiz/page.tsx
  // It uses flex-col and overflow-hidden to constrain the height.

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Header />
      <DynamicQuizCommandBar />
      <TestStatusBar />

      {showReport && <ReportCard />}

      {/* This <main> tag is the key.
        - flex-1: takes up all remaining vertical space
        - overflow-hidden: STOPS its children from growing past it
        - flex-col lg:flex-row: sets the layout for the two columns
      */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        
        {/* Column 1: Question List Wrapper */}
        <div className="flex-1 min-w-0 h-full">
          <QuestionColumn />
        </div>

        {/* Column 2: Answer Palette Wrapper */}
        <div className="hidden lg:block w-full lg:w-80 xl:w-96 h-full flex-shrink-0">
          <AnswerColumn />
        </div>

      </main>
    </div>
  );
}