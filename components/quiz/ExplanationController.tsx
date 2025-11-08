// components/quiz/ExplanationController.tsx
'use client';

import React from 'react';
import { Question, UltimateExplanation } from '@/lib/quizTypes';
import { useAuthContext } from '@/lib/AuthContext';
import dynamic from 'next/dynamic';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Make sure 'db' is exported from your firebase config
import { useQuizStore } from '@/lib/quizStore'; // To update state locally

// --- Dynamic Imports ---
// We dynamically load the Admin editor because it's heavy and client-side only
const AdminExplanationEditor = dynamic(
  () => import('@/components/admin/AdminExplanationEditor'),
  {
    ssr: false,
    loading: () => <div className="p-8">Loading Editor...</div>,
  }
);

// We dynamically load the Student view as well
const StudentExplanationView = dynamic(
  () => import('@/components/quiz/StudentExplanationView'),
  {
    ssr: false,
    loading: () => <div className="p-8">Loading Explanation...</div>,
  }
);

interface ExplanationControllerProps {
  question: Question;
  onClose: () => void; // Function to close the modal
}

export default function ExplanationController({
  question,
  onClose,
}: ExplanationControllerProps) {
  const { user, userProfile } = useAuthContext();
  const isAdmin = userProfile?.subscriptionStatus === 'ADMIN';

  // This is the function we pass to the Admin Editor
  // It handles the actual Firestore save operation.
  const handleSave = async (newExplanation: UltimateExplanation) => {
    if (!user || !isAdmin) {
      throw new Error('Authentication required.');
    }
    if (!question.id) {
      throw new Error('Question ID is missing.');
    }

    // This is the path to your question document.
    // Ensure 'questions' is your correct collection name.
    const questionRef = doc(db, 'questions', question.id);

    try {
      // 1. Update Firestore
      await updateDoc(questionRef, {
        explanation: newExplanation,
      });
      
      // 2. Update the local Zustand store so the change
      // is reflected instantly without a page reload.
      useQuizStore.getState().updateQuestionExplanation(question.id, newExplanation);
      
    } catch (error: any) {
      console.error('Error saving explanation:', error);
      throw new Error(error.message || 'Failed to save to Firestore.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      {isAdmin ? (
        // --- ADMIN VIEW ---
        <AdminExplanationEditor
          question={question}
          onSave={handleSave}
          onClose={onClose}
        />
      ) : (
        // --- STUDENT VIEW ---
        <StudentExplanationView
          explanation={question.explanation}
          handwrittenNoteUrl={question.handwrittenNoteUrl}
        />
      )}
    </div>
  );
}