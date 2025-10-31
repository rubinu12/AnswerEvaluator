'use client';

import { useEffect } from 'react';
import { useEvaluationStore } from '@/lib/store';
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import ReviewCard from '@/components/dashboard/ReviewCard';
import InProgressCard from '@/components/dashboard/InProgressCard';

export default function NewEvaluationPage() {
  const {
    isReviewing,
    processingState,
    isProcessingInBackground,
    setPageTitle,
    resetEvaluation,
  } = useEvaluationStore();

  useEffect(() => {
    // Set the title for the mobile header
    setPageTitle('New Evaluation');
    // Ensure any previous evaluation state is cleared when landing here
    resetEvaluation();
  }, [setPageTitle, resetEvaluation]);

  const showInProgressCard = processingState === 'ocr' || isProcessingInBackground;

  return (
    // [FIX] Added responsive padding. px-4 for sides, pb-16 for bottom, pt-4 for top.
    <div className="p-4 md:p-8 pb-16">
      {isReviewing ? (
        <ReviewCard />
      ) : showInProgressCard ? (
        <InProgressCard />
      ) : (
        <EvaluateCard />
      )}
    </div>
  );
}