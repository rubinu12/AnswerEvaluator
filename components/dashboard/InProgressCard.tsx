// app/components/dashboard/InProgressCard.tsx
'use client';

import { useEvaluationStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function InProgressCard() {
    const router = useRouter();
    const { 
        evaluationStatus, 
        newEvaluationId, 
        acknowledgeCompletion,
        resetEvaluation,
        processingState,
        cancelTranscription,
        setPageLoading, // 1. Get the action from the store
    } = useEvaluationStore();

    const isComplete = evaluationStatus === 'complete';
    const isTranscribing = processingState === 'ocr';

    const handleViewResult = () => {
        if (newEvaluationId) {
            // 2. Show the loader before navigating
            setPageLoading(true); 
            router.push(`/result/${newEvaluationId}`);
            acknowledgeCompletion();
            resetEvaluation();
        }
    };

    const handleDismiss = () => {
        acknowledgeCompletion();
        resetEvaluation();
    };

    const handleCancel = () => {
        cancelTranscription();
    };

    // --- MAIN RENDER LOGIC ---
    const renderCardContent = () => {
        // 1. Transcription State
        if (isTranscribing) {
            return (
                <>
                    <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-slate-900 font-serif">Transcribing Your Answer</h3>
                        <div className="flex items-center ml-2">
                           <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></span>
                           <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-75 ml-1"></span>
                           <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-150 ml-1"></span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">The AI is reading your handwriting. This should only take a moment...</p>
                    <button
                        onClick={handleCancel}
                        className="w-full rounded-lg px-6 py-3 text-md font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                </>
            );
        }

        // 2. Completed State
        if (isComplete) {
            return (
                <>
                    <div className="flex items-center mb-2">
                        <CheckCircle2 className="text-emerald-500 mr-2" size={24} />
                        <h3 className="text-xl font-bold text-slate-900 font-serif">Evaluation Complete!</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Your detailed analysis is ready. You can view it now or find it later in your history.</p>
                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={handleDismiss}
                            className="w-full rounded-lg px-6 py-3 text-md font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-all"
                        >
                            Later
                        </button>
                        <button
                            onClick={handleViewResult}
                            className="w-full rounded-lg px-6 py-3 text-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
                        >
                            Check it Now
                        </button>
                    </div>
                </>
            );
        }

        // 3. Evaluation State (Default)
        return (
            <>
                <div className="flex items-center mb-2">
                    <h3 className="text-xl font-bold text-slate-900 font-serif">Evaluation in Progress</h3>
                    <div className="flex items-center ml-2">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-75 ml-1"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-150 ml-1"></span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-6">This usually takes a few minutes. While you wait, here's a tip to improve your answer writing:</p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <h4 className="font-bold text-amber-900">Focus on Structure</h4>
                    <p className="text-slate-600 mt-2 text-sm">
                        "A well-structured answer is half the battle won. Always spend the first 2-3 minutes creating a mental blueprint: Introduction, Body with 3-4 distinct points, and a forward-looking Conclusion. This ensures your answer is coherent and easy for the examiner to follow."
                    </p>
                    <p className="text-right text-xs text-slate-500 mt-3">- Insights from Topper Analysis</p>
                </div>
            </>
        );
    };

    return (
        <div className="card p-6 md:p-8">
            {renderCardContent()}
        </div>
    );
}