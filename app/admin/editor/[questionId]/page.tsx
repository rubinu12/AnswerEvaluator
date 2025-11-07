'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { notFound, useParams } from 'next/navigation';
import {
  Question,
  QuestionType,
  UltimateExplanation,
  isUltimateExplanation, // This is our correct, refactored type guard
  BackendQuestion,
} from '@/lib/quizTypes';
import { useAuthContext } from '@/lib/AuthContext';
import PageLoader from '@/components/shared/PageLoader';
import { toast } from 'sonner';

// --- We will dynamically load our heavy editor components ---
const CommandCenter = dynamic(
  () => import('./CommandCenter'),
  { ssr: false, loading: () => <p>Loading Command Center...</p> }
);

const ExplanationWorkspace = dynamic(
  () => import('./ExplanationWorkspace'),
  { ssr: false, loading: () => <p>Loading Editor Playground...</p> }
);

// --- THIS IS THE PERMANENT FIX ---
// The transformer is now "smart".
const transformBackendQuestion = (
  q: BackendQuestion,
  index: number
): Question => {
  
  let optionsArray: { label: string; text: string }[] = [];
  if (Array.isArray(q.options) && q.options.length > 0) {
    optionsArray = q.options;
  } else {
    optionsArray = [
      { label: 'A', text: q.optionA || '' },
      { label: 'B', text: q.optionB || '' },
      { label: 'C', text: q.optionC || '' },
      { label: 'D', text: q.optionD || '' },
    ];
  }

  return {
    id: q._id,
    questionNumber: index,
    text: q.questionText,
    options: optionsArray,
    correctAnswer: q.correctOption,
    explanation: (q.explanation || q.explanationText || '') as string | UltimateExplanation,
    questionType: q.questionType || 'SingleChoice',
    year: q.year,
    subject: q.subject,
    topic: q.topic,
    exam: q.exam,
    examYear: q.examYear,
    // --- 💎 FIXED 💎 ---
    // We were forgetting to pass the handwritten note URL
    handwrittenNoteUrl: q.handwrittenNoteUrl || undefined,
  };
};
// --- END OF PERMANENT FIX ---

export default function AdminEditorPage() {
  const { questionId } = useParams() as { questionId: string };
  const { user, userProfile, loading: authLoading } = useAuthContext();

  // --- Core State ---
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Editor State ---
  const [explanation, setExplanation] = useState<UltimateExplanation | null>(
    null
  );
  const [questionType, setQuestionType] = useState<QuestionType>('SingleChoice');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [rawAiResponse, setRawAiResponse] = useState<string>('');

  // Fetch question data on load
  useEffect(() => {
    if (authLoading || !questionId || !user) {
      return;
    }

    const fetchQuestion = async () => {
      setIsLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/questions/${questionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}`);
        }

        const backendQuestion = (await response.json()) as BackendQuestion;
        
        console.log('--- RAW API DATA (Admin) ---', backendQuestion);

        const transformedQuestion = transformBackendQuestion(
          backendQuestion,
          1
        );
        setQuestion(transformedQuestion);

        // --- 💎 FIXED 💎 ---
        // This is the critical fix.
        // We now check for the *correct* "soulful" explanation.
        if (isUltimateExplanation(transformedQuestion.explanation)) {
          setExplanation(transformedQuestion.explanation);
        } else {
          // If no explanation exists, we initialize our NEW
          // "soulful" object with all its required keys.
          setExplanation({
            howToThink: '',
            coreAnalysis: '', // <-- This was the missing, crashing piece
            adminProTip: '',
            hotspotBank: [],
            // 'takeaway' is no longer required for a new explanation
          });
        }
        // --- End of Fix ---

        setQuestionType(transformedQuestion.questionType || 'SingleChoice');

      } catch (error: any) {
        console.error('Error fetching question via API:', error);
        toast.error(`Failed to load question: ${error.message}`);
        if (error.message.includes('Forbidden')) {
          notFound();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, user, authLoading]); // Runs when auth is ready

  // Handle Admin Auth and initial loading
  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (userProfile?.subscriptionStatus !== 'ADMIN') {
    toast.error('Access Denied. Admin role required.');
    return notFound();
  }

  // --- THIS IS THE CRITICAL GUARD ---
  if (!question) {
    return <PageLoader />;
  }
  // --- END OF GUARD ---

  // This is the main "Two-Row Layout"
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Explanation Editor</h1>
      <p className="text-gray-600">
        Editing Question ID: <code className="bg-gray-100 p-1 rounded">{question.id}</code>
      </p>
      <p className="text-gray-600">
        Editing Question ID: <code className="bg-gray-100 p-1 rounded">{question.id}</code>
      </p>

      {/* --- Row 1: Command Center --- */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
        <CommandCenter
          question={question} 
          questionType={questionType}
          setQuestionType={setQuestionType}
          rawAiResponse={rawAiResponse}
          setRawAiResponse={setRawAiResponse}
          currentPrompt={currentPrompt}
          setCurrentPrompt={setCurrentPrompt}
          setExplanation={setExplanation}
        />
      </div>

      {/* --- Row 2: WYSIWYG Workspace ("Playground") --- */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
        <ExplanationWorkspace
          questionId={question.id}
          questionType={questionType}
          explanation={explanation}
          setExplanation={setExplanation}
          // We pass the note URL so the workspace can *display* it.
          // We will add the "upload" button to the workspace next.
          handwrittenNoteUrl={question.handwrittenNoteUrl}
        />
      </div>
    </div>
  );
}