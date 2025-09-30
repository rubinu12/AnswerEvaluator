// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store';

// Import all necessary components
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import ReviewCard from '@/components/dashboard/ReviewCard';
import StudyStreakCalendar from '@/components/dashboard/StudyStreakCalendar';
import MentorsWisdom from '@/components/dashboard/MentorsWisdom';
import PerformanceGauges from '@/components/dashboard/PerformanceGauges';
import RecentEvaluations from '@/components/dashboard/RecentEvaluations';
import InProgressCard from '@/components/dashboard/InProgressCard';
import ResultModal from '@/components/dashboard/ResultModal';
import { BookOpen, History, BarChart2 } from 'lucide-react';

// New WelcomeHeader component as planned
const WelcomeHeader = ({ username }: { username: string }) => (
    <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg border border-white/30">
        <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {username}!
        </h1>
        <p className="mt-1 text-slate-600">
            Ready to take the next step on your journey?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
            <button className="px-3 py-2 text-sm font-semibold bg-white/70 text-slate-800 hover:bg-white rounded-md transition-colors flex items-center gap-2 backdrop-blur-sm shadow-sm border border-white/20">
                <BookOpen size={16} /> All My Notes
            </button>
            <button className="px-3 py-2 text-sm font-semibold bg-white/70 text-slate-800 hover:bg-white rounded-md transition-colors flex items-center gap-2 backdrop-blur-sm shadow-sm border border-white/20">
                <History size={16} /> Full History
            </button>
            <button className="px-3 py-2 text-sm font-semibold bg-white/70 text-slate-800 hover:bg-white rounded-md transition-colors flex items-center gap-2 backdrop-blur-sm shadow-sm border border-white/20">
                <BarChart2 size={16} /> View Analytics
            </button>
        </div>
    </div>
);


export default function DashboardHomePage() {
    const { user } = useAuthContext();
    const router = useRouter();

    const {
        evaluationStatus,
        newEvaluationId,
        resetEvaluation,
        isReviewing 
    } = useEvaluationStore();

    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    useEffect(() => {
        if (evaluationStatus === 'complete' && newEvaluationId) {
            setIsResultModalOpen(true);
        }
    }, [evaluationStatus, newEvaluationId]);

    const handleViewResult = () => {
        if (newEvaluationId) {
            router.push(`/result/${newEvaluationId}`);
            setIsResultModalOpen(false);
            resetEvaluation();
        }
    };

    const handleModalClose = () => {
        setIsResultModalOpen(false);
        resetEvaluation();
    };
    
    const showInProgress = useEvaluationStore(state => 
        state.evaluationStatus === 'processing' || 
        (state.processingState === 'ocr' && !state.isConfirming)
    );

    const username = user?.email?.split('@')[0] || 'Aspirant';

    return (
        <>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    
                    {/* --- LEFT COLUMN (WIDER) --- */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* 1. Welcome & Quick Actions */}
                        <WelcomeHeader username={username} />

                        {/* CORRECTED LOGIC: Conditionally render the entire block */}
                        {isReviewing ? (
                            // If in review mode, only show the ReviewCard
                            <ReviewCard />
                        ) : (
                            // Otherwise, show the normal layout
                            <>
                                {showInProgress ? (
                                    <InProgressCard />
                                ) : (
                                    <EvaluateCard />
                                )}
                                <PerformanceGauges />
                            </>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN (NARROWER) --- */}
                    <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
                        {/* 1. Mentor's Wisdom */}
                        <MentorsWisdom />

                        {/* 2. Study Streak Calendar */}
                        <StudyStreakCalendar />

                        {/* 3. Recent Evaluations */}
                        <RecentEvaluations />
                    </div>
                </div>
            </main>

            <ResultModal
                isOpen={isResultModalOpen}
                onClose={handleModalClose}
                onConfirm={handleViewResult}
                resultText="Your detailed evaluation is complete and ready for review."
            />
        </>
    );
}