'use client';

// [FIX] Import 'use' from React to handle the new params object correctly
import React, { useEffect, use } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { motion, AnimatePresence } from 'framer-motion';

// Import all our refactored components
import Header from '@/components/quiz/Header';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import ReportCard from '@/components/quiz/ReportCard';
import TestStatusBar from '@/components/quiz/TestStatusBar';

interface PracticePageProps {
  // [FIX] The 'params' prop is now correctly typed as a Promise-like object
  params: Promise<{
    type: string;
    filter: string;
    value: string;
  }>;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-700">Preparing Your Quiz...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
        </div>
        <style jsx>{`
            .loader { border-top-color: #3498db; animation: spinner 1.5s linear infinite; }
            @keyframes spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

const PracticePage: React.FC<PracticePageProps> = ({ params }) => {
  // [FIX] Use the 'use' hook to unwrap the params promise
  const resolvedParams = use(params);
  const { fetchQuestions, resetTest, isLoading, questions, showReportCard, mode } = useQuizStore();

  useEffect(() => {
    // Now we can safely use the resolved params
    fetchQuestions(resolvedParams);
    
    return () => {
      resetTest();
    };
  // [FIX] The dependency array now uses the resolved params object
  }, [resolvedParams, fetchQuestions, resetTest]);

  if (isLoading || (questions.length === 0 && !showReportCard)) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gray-50 ${mode === 'test' ? 'pt-16' : ''}`}>
        {mode === 'test' ? <TestStatusBar /> : <Header />}
      
        <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
            {/* Question column takes up all available space */}
            <div className="flex-1 min-w-0 h-full">
                <QuestionColumn />
            </div>
            {/* Answer column has a responsive, non-shrinking width */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 h-full">
                <AnswerColumn />
            </div>
        </main>

        <AnimatePresence>
            {showReportCard && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                >
                    <ReportCard />
                </motion.div>
            )}
      </AnimatePresence>
    </div>
  );
};

export default PracticePage;