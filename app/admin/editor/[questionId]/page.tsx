'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Question,
  QuestionType,
  UltimateExplanation,
  isUltimateExplanation,
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

// --- FIXED: This function is now local and safely handles undefined options ---
const transformBackendQuestion = (
  q: BackendQuestion,
  index: number
): Question => {
  return {
    id: q._id,
    questionNumber: index,
    text: q.questionText,
    // Safely fallback to empty string if option is missing
    options: [
      { label: 'A', text: q.optionA || '' },
      { label: 'B', text: q.optionB || '' },
      { label: 'C', text: q.optionC || '' },
      { label: 'D', text: q.optionD || '' },
    ],
    correctAnswer: q.correctOption,
    explanation: q.explanation || q.explanationText || '', // Unify explanation
    questionType: q.questionType || 'SingleChoice',
    year: q.year,
    subject: q.subject,
    topic: q.topic,
    exam: q.exam,
    examYear: q.examYear,
  };
};

export default function AdminEditorPage() {
  const { questionId } = useParams() as { questionId: string };
  const { userProfile, loading: authLoading } = useAuthContext();

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
    if (!questionId) return;

    const fetchQuestion = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'questions', questionId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error('Question not found.');
          notFound();
          return;
        }

        const backendQuestion = {
          _id: docSnap.id,
          ...docSnap.data(),
        } as BackendQuestion;

        // Use the fixed local transformer
        const transformedQuestion = transformBackendQuestion(
          backendQuestion,
          1
        );
        setQuestion(transformedQuestion);

        // Set the initial state for the editor
        if (isUltimateExplanation(transformedQuestion.explanation)) {
          setExplanation(transformedQuestion.explanation);
        } else {
          // If explanation is old string or null, create a blank new object
          setExplanation({
            howToThink: '',
            adminProTip: '',
            takeaway: '',
            hotspotBank: [],
          });
        }
        setQuestionType(transformedQuestion.questionType || 'SingleChoice');
      } catch (error: any) {
        console.error('Error fetching question:', error);
        toast.error('Failed to load question.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Handle Admin Auth
  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (userProfile?.subscriptionStatus !== 'ADMIN') {
    toast.error('Access Denied. Admin role required.');
    return notFound();
  }

  if (!question) {
    return <PageLoader />;
  }

  // This is the main "Two-Row Layout"
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Explanation Editor</h1>
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
          setExplanation={setExplanation} // This sets the explanation for Row 2
        />
      </div>

      {/* --- Row 2: WYSIWYG Workspace ("Playground") --- */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
        <ExplanationWorkspace
          questionId={question.id}
          questionType={questionType}
          explanation={explanation} // Pass the live explanation down
          setExplanation={setExplanation} // Pass the setter down
        />
      </div>
    </div>
  );
}
