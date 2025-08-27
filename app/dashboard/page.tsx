'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/AuthContext'
import { useEvaluationStore } from '@/lib/store'
import { EvaluationCompletePayload } from '@/lib/types'

import EvaluateCard from '@/components/dashboard/EvaluateCard'
import StudyStreakCalendar from '@/components/dashboard/StudyStreakCalendar'
import MentorsWisdom from '@/components/dashboard/MentorsWisdom'
import PerformanceGauges from '@/components/dashboard/PerformanceGauges'
import RecentEvaluations from '@/components/dashboard/RecentEvaluations'
import LottieAnimation from '@/components/dashboard/LottieAnimation'
import InProgressCard from '@/components/dashboard/InProgressCard'
import ResultModal from '@/components/dashboard/ResultModal'

export default function DashboardHomePage() {
  const { user } = useAuthContext()
  const router = useRouter()

  // 1. We get all the necessary state directly from our central store
  const {
    evaluationStatus,
    processingState,
    isConfirming, // The flag for the confirmation UI is now global
    newEvaluationId,
    startEvaluation,
    completeEvaluation,
    failEvaluation,
    resetEvaluation,
  } = useEvaluationStore()

  const [isResultModalOpen, setIsResultModalOpen] = useState(false)

  useEffect(() => {
    if (evaluationStatus === 'complete' && newEvaluationId) {
      setIsResultModalOpen(true)
    }
  }, [evaluationStatus, newEvaluationId])

  const handleEvaluationComplete = (payload: EvaluationCompletePayload) => {
    completeEvaluation(payload)
  }

  const handleViewResult = () => {
    if (newEvaluationId) {
      router.push(`/result/${newEvaluationId}`)
      setIsResultModalOpen(false)
      resetEvaluation()
    }
  }

  const handleModalClose = () => {
    setIsResultModalOpen(false)
    resetEvaluation()
  }

  // 2. The logic to decide which card to show is now cleaner and more reliable
  // It shows the InProgressCard if the main evaluation is running,
  // OR if OCR is happening AND the confirmation screen is not active.
  const showInProgress =
    evaluationStatus === 'processing' ||
    (processingState === 'ocr' && !isConfirming)

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Let's make today count.
              </p>
            </div>

            {showInProgress ? (
              <InProgressCard />
            ) : (
              // 3. The EvaluateCard no longer needs any props passed down to it
              <EvaluateCard
                onEvaluationStart={startEvaluation}
                onEvaluationComplete={handleEvaluationComplete}
                onEvaluationError={failEvaluation}
              />
            )}
            <MentorsWisdom />
            <PerformanceGauges />
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <LottieAnimation />
            <StudyStreakCalendar />
            <RecentEvaluations />
          </div>
        </div>
      </div>
      <ResultModal
        isOpen={isResultModalOpen}
        onClose={handleModalClose}
        onConfirm={handleViewResult}
        resultText="Your detailed evaluation is complete and ready for review."
      />
    </>
  )
}