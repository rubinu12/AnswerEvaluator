'use client';

import { useState, useEffect } from 'react';
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
import MobileSubNav from '@/components/dashboard/MobileSubNav';
import { BookOpen, History, BarChart2 } from 'lucide-react';

// --- [CORRECTED] WelcomeHeader with readable text and no card background ---
const WelcomeHeader = ({ username }: { username: string }) => (
    // The container now has no background or borders, just padding.
    <div className="p-4 md:p-0"> 
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            Welcome back, {username}!
        </h1>
        <p className="mt-1 text-slate-600">
            Ready to take the next step on your journey?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
            {/* Buttons are restored to their original readable style */}
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


// --- [RESTORED] Mobile-Specific View Component with "Full-Height" Layout ---
const MobileDashboard = ({ username, isReviewing, showInProgressCard }: { username: string, isReviewing: boolean, showInProgressCard: boolean }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="flex flex-col flex-grow gap-4 p-4">
                        <WelcomeHeader username={username} />
                        <div className="flex-grow flex flex-col">
                            <StudyStreakCalendar />
                        </div>
                    </div>
                );
            case 'performance':
                return <div className="p-4 flex-grow"><PerformanceGauges /></div>;
            case 'activity':
                return (
                    <div className="p-4 space-y-4 overflow-y-auto">
                        <RecentEvaluations />
                        <MentorsWisdom />
                    </div>
                );
            default:
                return null;
        }
    };
    
    if (isReviewing) return <div className="p-4"><ReviewCard /></div>;
    if (showInProgressCard) return <div className="p-4"><InProgressCard /></div>;

    return (
        <div className="flex flex-col h-full">
            <MobileSubNav activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-grow flex flex-col overflow-y-hidden">
                 {renderTabContent()}
            </div>
        </div>
    );
};

// --- Desktop-Specific View Component (Corrected) ---
const DesktopDashboard = ({ username, isReviewing, showInProgressCard }: { username: string, isReviewing: boolean, showInProgressCard: boolean }) => {
    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-8">
                    {/* Now uses the single, corrected WelcomeHeader */}
                    <WelcomeHeader username={username} />
                    {isReviewing ? (
                        <ReviewCard />
                    ) : (
                        <>
                            {showInProgressCard ? <InProgressCard /> : <EvaluateCard />}
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
};


// --- Main Page Component with Switcher Logic ---
export default function DashboardHomePage() {
    const { user } = useAuthContext();
    const {
        isProcessingInBackground,
        isReviewing,
        processingState,
        setPageLoading,
        setPageTitle,
    } = useEvaluationStore();
    
    useEffect(() => {
        setPageTitle('Dashboard');
        setPageLoading(true);
        const timer = setTimeout(() => setPageLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [setPageLoading, setPageTitle]);

    const showInProgressCard = processingState === 'ocr' || isProcessingInBackground;
    const username = user?.email?.split('@')[0] || 'Aspirant';

    return (
        <>
            <div className="block md:hidden h-full">
                <MobileDashboard 
                    username={username}
                    isReviewing={isReviewing}
                    showInProgressCard={showInProgressCard}
                />
            </div>
            <div className="hidden md:block">
                <DesktopDashboard 
                    username={username}
                    isReviewing={isReviewing}
                    showInProgressCard={showInProgressCard}
                />
            </div>
        </>
    );
}