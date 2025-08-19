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

// Define the shape of the data coming from EvaluateCard
interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}
interface EvaluationCompletePayload {
    analysis: any; // The JSON from the main evaluation AI
    preparedData: PreparedQuestion[]; // The user-confirmed data
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

    // UPDATED FUNCTION TO MERGE AND SAVE DATA
    const handleEvaluationComplete = (payload: EvaluationCompletePayload) => {
        const { analysis, preparedData } = payload;
        
        // --- THIS IS THE CRITICAL MERGING LOGIC ---
        const finalQuestionAnalysis = preparedData.map(prepItem => {
            // Find the corresponding analysis object from the AI's response
            const analysisItem = analysis.questionAnalysis.find(
                (item: any) => item.questionNumber === prepItem.questionNumber
            );
            // Combine the prepared data (Q&A) with the analysis data (scores, feedback)
            return {
                ...prepItem, // Contains questionNumber, questionText, userAnswer, maxMarks
                ...analysisItem, // Contains score, wordCount, detailedAnalysis, etc.
            };
        });

        // Create the final, complete object to save
        const finalDataForStorage = {
            ...analysis, // Contains overallScore, totalMarks, overallFeedback
            questionAnalysis: finalQuestionAnalysis,
        };
        // --- END OF MERGING LOGIC ---

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
        <div className="min-h-screen">
            <Header 
                evaluationStatus={evaluationStatus}
                onViewResult={handleViewResult}
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-slate-900 font-serif">Welcome Back, {user.email?.split('@')[0]}!</h2>
                    <p className="mt-1 text-md text-slate-500">Let's make today productive.</p>
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