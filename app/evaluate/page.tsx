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
    <div className="p-4 md:p-8">
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