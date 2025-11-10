// components/quiz/StudentExplanationView.tsx
'use client';

import React from 'react';
// 1. --- IMPORT THE TYPE GUARD ---
import { Question, isUltimateExplanation } from '@/lib/quizTypes';
import UltimateExplanationUI from '@/components/quiz/UltimateExplanationUI';
import { X } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip'; // 2. --- IMPORT THE PROVIDER ---

interface StudentExplanationViewProps {
  question: Question;
  onClose: () => void; // Function to close the modal
}

export default function StudentExplanationView({
  question,
  onClose,
}: StudentExplanationViewProps) {
  
  // --- 3. --- THIS IS THE FIX for the Student Parser Bug ---
  // We mirror the logic from the admin editor. We check if
  // the explanation is a string, and if so, we parse it.
  let parsedExplanation: any = question.explanation; // Start with the prop

  if (typeof question.explanation === 'string') {
    try {
      const parsed = JSON.parse(question.explanation);
      // We only use the parsed version if it's a valid "soulful" object
      if (isUltimateExplanation(parsed)) {
        parsedExplanation = parsed;
      }
    } catch (e) {
      // It was a string, but not JSON (e.g., "No explanation yet").
      // We leave `parsedExplanation` as the original string.
    }
  }
  // --- 4. --- END OF FIX ---

  return (
    // 5. --- THIS IS THE FIX for the Tooltip Bug ---
    // We wrap the entire component in the Tooltip.Provider
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
            // 6. --- We pass the PARSED explanation ---
            explanation={parsedExplanation}
            handwrittenNoteUrl={question.handwrittenNoteUrl}
          />
        </div>
      </div>
    </Tooltip.Provider>
  );
}