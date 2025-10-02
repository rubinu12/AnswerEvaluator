// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react'; // 1. Import useEffect
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

    const {
        isProcessingInBackground,
        isReviewing,
        processingState,
        setPageLoading, // 2. Get the action from the store
    } = useEvaluationStore();
    
    // 3. Add the useEffect to control the loader
    useEffect(() => {
        setPageLoading(true);
        // Hide the loader after a short delay to ensure content is ready
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1500); // 1.5 seconds

        return () => clearTimeout(timer); // Cleanup the timer
    }, [setPageLoading]);

    const showInProgressCard = processingState === 'ocr' || isProcessingInBackground;

    const username = user?.email?.split('@')[0] || 'Aspirant';

    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                <div className="lg:col-span-3 space-y-8">
                    <WelcomeHeader username={username} />

                    {isReviewing ? (
                        <ReviewCard />
                    ) : (
                        <>
                            {showInProgressCard ? (
                                <InProgressCard />
                            ) : (
                                <EvaluateCard />
                            )}
                            <PerformanceGauges />
                        </>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
                    <MentorsWisdom />
                    <StudyStreakCalendar />
                    <RecentEvaluations />
                </div>
            </div>
        </main>
    );
}