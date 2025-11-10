// components/quiz/StudentExplanationView.tsx
'use client';

import React from 'react';
import { Question } from '@/lib/quizTypes';
import UltimateExplanationUI from '@/components/quiz/UltimateExplanationUI';
import { X } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip'; // <-- 1. IMPORT THE PROVIDER

interface StudentExplanationViewProps {
  question: Question;
  onClose: () => void; // Function to close the modal
}

export default function StudentExplanationView({
  question,
  onClose,
}: StudentExplanationViewProps) {
  return (
    // --- 2. WRAP THE ENTIRE UI IN THE PROVIDER ---
    <Tooltip.Provider delayDuration={300}>
      <div className="p-4 sm:p-6">
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Explanation: Q{question.questionNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* "Soulful" Content */}
        <div className="py-6">
          <UltimateExplanationUI
            explanation={question.explanation}
            handwrittenNoteUrl={question.handwrittenNoteUrl}
          />
        </div>
      </div>
    </Tooltip.Provider>
    // --- 3. END OF PROVIDER WRAPPER ---
  );
}