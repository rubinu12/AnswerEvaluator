// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import InProgressCard from '@/components/dashboard/InProgressCard';
import ResultModal from '@/components/dashboard/ResultModal';

export default function DashboardPage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    
    const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [evaluationResult, setEvaluationResult] = useState('');
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#fdfcf9'}}>Loading...</div>;
    }

    const handleEvaluationStart = () => {
        setEvaluationStatus('processing');
        setIsResultModalOpen(false);
    };

    const handleEvaluationComplete = (result: string) => {
        setEvaluationStatus('complete');
        setEvaluationResult(result);
    };
    
    const handleEvaluationError = (error: string) => {
        setEvaluationStatus('idle');
        // Here you could show an error toast or message
        console.error("Evaluation failed:", error);
        alert(`Evaluation failed: ${error}`); // Simple alert for now
    };

    return (
        <div className="min-h-screen">
            <Header 
                evaluationStatus={evaluationStatus}
                onViewResult={() => setIsResultModalOpen(true)}
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 font-serif">Welcome Back, {user.email?.split('@')[0]}!</h2>
                        <p className="mt-1 text-md text-slate-500">Let's make today productive.</p>
                    </div>
                    <div className="hidden lg:block w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-400 text-xs">Illustration</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {evaluationStatus === 'processing' ? (
                            <InProgressCard />
                        ) : (
                            <EvaluateCard 
                                onEvaluationStart={handleEvaluationStart}
                                onEvaluationComplete={handleEvaluationComplete}
                                onEvaluationError={handleEvaluationError}
                            />
                        )}
                    </div>
                    <div>
                        <StreakCalendar />
                    </div>
                </div>
            </main>
            <ResultModal 
                isOpen={isResultModalOpen}
                onClose={() => {
                    setIsResultModalOpen(false);
                    setEvaluationStatus('idle'); // Reset status after viewing
                }}
                resultText={evaluationResult}
            />
        </div>
    );
}