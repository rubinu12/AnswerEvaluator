'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import StudyStreakCalendar from '@/components/dashboard/StudyStreakCalendar';
import MentorsWisdom from '@/components/dashboard/MentorsWisdom';
import PerformanceGauges from '@/components/dashboard/PerformanceGauges';
import RecentEvaluations from '@/components/dashboard/RecentEvaluations';
import LottieAnimation from '@/components/dashboard/LottieAnimation';
import InProgressCard from '@/components/dashboard/InProgressCard';
import ResultModal from '@/components/dashboard/ResultModal';
import { useAuthContext } from '@/lib/AuthContext';


// Define these interfaces here or import them from a types file
interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}
interface EvaluationCompletePayload {
    analysis: any;
    preparedData: PreparedQuestion[];
    subject: string;
}

export default function DashboardHomePage() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [newEvaluationId, setNewEvaluationId] = useState<string | null>(null);

    const handleEvaluationStart = () => {
        setEvaluationStatus('processing');
        setIsResultModalOpen(false);
    };

    const handleEvaluationComplete = (payload: EvaluationCompletePayload) => {
        const { analysis, preparedData, subject } = payload;

        const finalQuestionAnalysis = preparedData.map(prepItem => {
            const analysisItem = analysis.questionAnalysis?.find(
                (item: any) => item.questionNumber === prepItem.questionNumber
            );
            return { ...prepItem, ...analysisItem };
        });

        const finalDataForStorage = {
            ...analysis,
            questionAnalysis: subject === 'Essay' ? analysis.questionAnalysis : finalQuestionAnalysis,
            subject: subject
        };

        const uniqueId = `eval_${Date.now()}`;
        setNewEvaluationId(uniqueId);
        setEvaluationStatus('complete');
        sessionStorage.setItem(uniqueId, JSON.stringify(finalDataForStorage));
        setIsResultModalOpen(true);
    };

    const handleEvaluationError = (error: string) => {
        setEvaluationStatus('idle');
        alert(`Evaluation failed: ${error}`);
    };

    const handleViewResult = () => {
        if (newEvaluationId) {
            router.push(`/result/${newEvaluationId}`);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
                                {/* Check for user before accessing email */}
                                Welcome back, {user?.email?.split('@')[0]}!
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Let's make today count.
                            </p>
                        </div>

                        {evaluationStatus === 'processing' ? (
                            <InProgressCard />
                        ) : (
                            <EvaluateCard
                                onEvaluationStart={handleEvaluationStart}
                                onEvaluationComplete={handleEvaluationComplete}
                                onEvaluationError={handleEvaluationError}
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
                onClose={() => setIsResultModalOpen(false)}
                onConfirm={handleViewResult}
                resultText="Your detailed evaluation is complete and ready for review."
            />
        </>
    );
}