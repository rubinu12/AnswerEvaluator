// app/result/[evaluationId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/result/Header';
import SidebarNav from '@/components/result/SidebarNav';
import OverallAssessmentCard from '@/components/result/OverallAssessmentCard';
import QuestionCard from '@/components/result/QuestionCard';
import { EvaluationData } from '@/lib/types';

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const evaluationId = params.evaluationId as string;

    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!evaluationId) return;
        const resultDataString = sessionStorage.getItem(evaluationId);

        if (resultDataString) {
            try {
                // CORRECTED LOGIC: The data from sessionStorage is already in the final, correct shape.
                // We no longer need to merge it here.
                const parsedData = JSON.parse(resultDataString);
                
                setEvaluationData({
                    ...parsedData,
                    submittedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                });

            } catch (e) {
                console.error("Parsing error:", e);
                setError("Failed to load and parse evaluation data. The data from the API might be malformed.");
            }
        } else {
            setError("No evaluation data found for this ID. Please try evaluating again.");
        }
    }, [evaluationId]);

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 p-4">{error}</div>;
    if (!evaluationData) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Evaluation Report...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                 <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-slate-900">Evaluation Report</h1>
                        <p className="mt-1 text-md text-slate-500">
                           {evaluationData.subject} | Submitted on {evaluationData.submittedOn}
                        </p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        <button className="px-4 py-2 text-sm font-semibold bg-slate-200 hover:bg-slate-300 rounded-md transition-colors flex items-center gap-2" onClick={() => router.push('/dashboard')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                            Evaluate New
                        </button>
                        <button className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors flex items-center gap-2" style={{backgroundColor: 'var(--primary-accent)'}} onClick={() => window.print()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-1 lg:sticky lg:top-24">
                        <SidebarNav data={evaluationData} />
                    </div>

                    <div className="lg:col-span-3 space-y-8">
                        <OverallAssessmentCard feedback={evaluationData.overallFeedback} />
                        {evaluationData.questionAnalysis.map((q, index) => (
                            <QuestionCard key={index} questionData={q} subject={evaluationData.subject} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}