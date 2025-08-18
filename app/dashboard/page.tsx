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

interface EvaluationResult {
  overallScore?: number;
  // Define a more specific type based on your JSON structure later
}

export default function DashboardPage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    
    const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [newEvaluationId, setNewEvaluationId] = useState<string | null>(null);

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

    const handleEvaluationComplete = (result: any) => {
        const uniqueId = `eval_${Date.now()}`;
        setNewEvaluationId(uniqueId);
        setEvaluationResult(result);
        setEvaluationStatus('complete');

        // **THE FIX IS HERE: Save the result before navigating**
        // In a real app, we'd save this to Firestore. For now, sessionStorage is perfect.
        sessionStorage.setItem(uniqueId, JSON.stringify(result));

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
        <div className="min-h-screen">
            <Header 
                evaluationStatus={evaluationStatus}
                onViewResult={handleViewResult}
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 font-serif">Welcome Back, {user.email?.split('@')[0]}!</h2>
                        <p className="mt-1 text-md text-slate-500">Let's make today productive.</p>
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
                onClose={() => setIsResultModalOpen(false)}
                onConfirm={handleViewResult}
                resultText="Your detailed evaluation is complete and ready for review."
            />
        </div>
    );
}