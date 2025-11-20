// app/practice/[...slug]/page.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { QuizFilter } from '@/lib/quizTypes';
import { useAuthContext } from '@/lib/AuthContext'; 

import Header from '@/components/quiz/Header';
import QuestionColumn from '@/components/quiz/QuestionColumn';
import AnswerColumn from '@/components/quiz/AnswerColumn';
import TestStatusBar from '@/components/quiz/TestStatusBar';
import DynamicQuizCommandBar from '@/components/quiz/DynamicQuizCommandBar';
import ExplanationController from '@/components/quiz/ExplanationController'; 

const KNOWN_SUBJECTS = new Set([
  'polity', 'history', 'geography', 'economy', 'economics',
  'environment', 'science', 'science-tech', 'current-affairs', 
  'csat', 'essay', 'ethics', 'ir'
]);

const DebugOverlay = ({ data }: { data: any }) => (
  <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs shadow-2xl border border-green-500 max-w-md overflow-auto max-h-96">
    <h3 className="font-bold text-white border-b border-gray-700 pb-2 mb-2">🐛 DEBUGGER</h3>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

const LoadingScreen = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl font-medium text-gray-600">{message || 'Loading Quiz...'}</p>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Quiz</h2>
        <p className="text-gray-600 font-mono text-sm bg-gray-100 p-2 rounded mt-2 mb-4">{message}</p>
        <button onClick={onRetry} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Retry Fetch
        </button>
    </div>
  </div>
);

export default function QuizPage() {
  const params = useParams();
  const { userProfile, loading: authLoading } = useAuthContext();

  const quizLoading = useQuizStore((s) => s.isLoading);
  const quizError = useQuizStore((s) => s.quizError);
  const questions = useQuizStore((s) => s.questions);
  const dataSource = useQuizStore((s) => s.dataSource);
  const loadAndStartQuiz = useQuizStore((s) => s.loadAndStartQuiz);
  const setDataSource = useQuizStore((s) => s.setDataSource);
  const clearQuizSession = useQuizStore((s) => s.clearQuizSession);
  const isTestMode = useQuizStore((s) => s.isTestMode);
  const setIsLoading = useQuizStore((s) => (s as any).setIsLoading);

  const { explanationModalQuestionId, closeExplanationModal, isTopBarVisible } = useQuizUIStore();

  const currentFilter: QuizFilter = useMemo(() => {
    const rawSlug = params.slug as string[]; 
    if (!rawSlug || rawSlug.length === 0) return {};

    const slug = rawSlug.filter(s => s !== 'prelims' && s !== 'mains');
    if (slug.length === 0) return {}; 

    const p1 = decodeURIComponent(slug[0]); 
    const p2 = slug.length > 1 ? decodeURIComponent(slug[1]) : null; 
    
    const f: QuizFilter = {};

    if (p1 === 'year') { f.year = p2 || 'all'; }
    else if (p1 === 'subject') { f.subject = p2 || 'all'; f.topic = 'all'; }
    else if (p1 === 'topic') { f.topic = p2 || 'all'; }
    else {
        if (!p2) {
            if (KNOWN_SUBJECTS.has(p1.toLowerCase())) f.subject = p1; 
            else f.exam = p1; 
        } else {
            const isYear = /^\d{4}$/.test(p2);
            if (isYear) { f.exam = p1; f.year = p2; } 
            else { f.subject = p1; f.topic = p2; }
        }
    }
    return f;
  }, [params]);

  useEffect(() => {
    if (authLoading) return;
    const targetSource = userProfile?.subscriptionStatus === 'ADMIN' ? 'admin' : 'student';
    if (dataSource !== targetSource) setDataSource(targetSource);
  }, [authLoading, userProfile, dataSource, setDataSource]);

  // --- 🚀 THE FIXED FETCH LOGIC ---
  useEffect(() => {
    if (authLoading) return;
    
    if (Object.keys(currentFilter).length === 0) {
        console.warn("⚠️ Invalid URL (Filter Empty). Aborting fetch.");
        if (setIsLoading) setIsLoading(false);
        return;
    }

    // Added 'dataSource' to log and dependency array
    console.log(`🚀 Dispatching Load for [${dataSource.toUpperCase()}] with Filter:`, currentFilter);
    loadAndStartQuiz(currentFilter);
    
  }, [currentFilter, loadAndStartQuiz, authLoading, setIsLoading, dataSource]); // <--- 💎 ADDED dataSource HERE

  const questionForModal = useMemo(() => {
    if (!explanationModalQuestionId) return null;
    return questions.find((q) => q.id === explanationModalQuestionId) || null;
  }, [explanationModalQuestionId, questions]);

  const debugData = {
    rawSlug: params.slug,
    calculatedFilter: currentFilter,
    dataSource,
    store: { isLoading: quizLoading, questions: questions.length, error: quizError }
  };

  if (authLoading) return <LoadingScreen message="Authenticating..." />;
  
  if (quizError) {
      return (
        <>
            <DebugOverlay data={debugData} />
            <ErrorDisplay message={quizError.message} onRetry={() => { clearQuizSession(); window.location.reload(); }} />
        </>
      );
  }
  
  if (quizLoading && questions.length === 0) {
      return (
        <>
            <DebugOverlay data={debugData} />
            <LoadingScreen message={`Fetching from ${dataSource.toUpperCase()}...`} />
        </>
      );
  }

  const mainPadding = isTestMode ? 'pt-[69px]' : 'pt-16';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <DebugOverlay data={debugData} />
      {isTestMode ? <TestStatusBar /> : <><Header /><DynamicQuizCommandBar /></>}
      <main className={`flex-1 flex flex-col lg:flex-row overflow-hidden ${mainPadding}`}>
        <div className="flex-1 min-w-0 h-full"><QuestionColumn /></div>
        <div className="hidden lg:block w-full lg:w-72 xl:w-80 h-full flex-shrink-0"><AnswerColumn /></div>
      </main>
      {questionForModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8" onMouseDown={closeExplanationModal}>
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ExplanationController question={questionForModal} onClose={closeExplanationModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}