// components/quiz/ExplanationController.tsx
'use client';

import React from 'react';
import { Question, UltimateExplanation, isUltimateExplanation } from '@/lib/quizTypes';
import { useAuthContext } from '@/lib/AuthContext';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming 'db' is exported from your firebase config

// --- Dynamic Imports ---
// We dynamically load the Admin editor because it's heavy
const AdminExplanationEditor = dynamic(
  () => import('@/components/admin/AdminExplanationEditor'),
  {
    ssr: false,
    loading: () => <div className="p-6">Loading Editor...</div>,
  }
);

// The student view is just our existing UI component
import UltimateExplanationUI from '@/components/quiz/UltimateExplanationUI';

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
    // Make sure 'questions' is your correct collection name.
    const questionRef = doc(db, 'questions', question.id);

    try {
      // We update the 'explanation' field on the question document
      await updateDoc(questionRef, {
        explanation: newExplanation,
      });
      
      // OPTIONAL: You might want to update your Zustand store here
      // so the change is reflected instantly without a page reload.
      // useQuizStore.getState().updateQuestionExplanation(question.id, newExplanation);
      
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
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Explanation</h2>
          <UltimateExplanationUI
            explanation={question.explanation}
            handwrittenNoteUrl={question.handwrittenNoteUrl}
          />
        </div>
      )}
    </div>
  );
}