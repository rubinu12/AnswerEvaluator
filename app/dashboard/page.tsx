'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import { Search, Bell } from 'lucide-react';
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import StudyStreakCalendar from '@/components/dashboard/StudyStreakCalendar';
import MentorsWisdom from '@/components/dashboard/MentorsWisdom';
import PerformanceGauges from '@/components/dashboard/PerformanceGauges';
import RecentEvaluations from '@/components/dashboard/RecentEvaluations';
import LottieAnimation from '@/components/dashboard/LottieAnimation';
import InProgressCard from '@/components/dashboard/InProgressCard';
import ResultModal from '@/components/dashboard/ResultModal';

const DashboardActions = ({ activeLink }: { activeLink: NavLink }) => (
    <>
        <Search className="text-gray-600 cursor-pointer btn" size={22} />
        <div className="relative cursor-pointer">
            <Bell className="text-gray-600 btn" size={22} />
            <span className="absolute flex h-2 w-2 top-0 right-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
        </div>
        <div className="relative cursor-pointer btn">
            <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 transition-colors duration-500"
                style={{ borderColor: activeLink.color }}
            />
        </div>
    </>
);

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

export default function DashboardPage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();

    const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [newEvaluationId, setNewEvaluationId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

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
            <UniversalNavbar
                pageType='dashboard'
                actions={(activeLink) => <DashboardActions activeLink={activeLink} />}
            />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">
                                Welcome back, {user.email?.split('@')[0]}!
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