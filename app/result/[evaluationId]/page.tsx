// app/result/[evaluationId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Import useParams hook
import SidebarNav from '@/components/result/SidebarNav';
import OverallFeedback from '@/components/result/OverallFeedback';
import QuestionCard from '@/components/result/QuestionCard';

// Define a type for your evaluation data for better type safety
interface EvaluationData {
    overallScore: number;
    totalMarks: number;
    submittedOn: string;
    paper: string;
    overallFeedback: any;
    questionAnalysis: any[];
}

export default function ResultPage() {
    const params = useParams(); // Use the hook to get params
    const evaluationId = params.evaluationId as string;

    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!evaluationId) return;

        const resultData = sessionStorage.getItem(evaluationId);

        if (resultData) {
            try {
                const parsedData = JSON.parse(resultData);
                setEvaluationData({
                    ...parsedData,
                    submittedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
                    paper: "GS Paper 1"
                });
            } catch (e) {
                setError("Failed to load evaluation data.");
            }
        } else {
            setError("No evaluation data found.");
        }

        // Active sidebar link highlighting
        const navLinks = document.querySelectorAll('.sidebar-link');
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href')?.substring(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });
        
        // Timeout to ensure sections are rendered before observing
        const timer = setTimeout(() => {
            const sections = document.querySelectorAll('section[id]');
            if (sections.length) {
                sections.forEach(sec => observer.observe(sec));
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            sections.forEach(sec => observer.unobserve(sec));
        }

    }, [evaluationId]);

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!evaluationData) return <div className="min-h-screen flex items-center justify-center">Loading Evaluation Report...</div>;

    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-4xl font-bold font-serif">Evaluation Report</h1>
                        <p className="mt-1 text-md text-slate-500">
                           {evaluationData.paper} | Submitted on {evaluationData.submittedOn}
                        </p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        <button className="px-4 py-2 text-sm font-semibold bg-slate-200 hover:bg-slate-300 rounded-md transition-colors">Evaluate New</button>
                        <button className="px-4 py-2 text-sm font-semibold text-white hover:bg-red-900 rounded-md transition-colors" style={{backgroundColor: 'var(--primary-accent)'}}>Download Report</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <SidebarNav 
                    overallScore={evaluationData.overallScore}
                    totalMarks={evaluationData.totalMarks}
                    questionAnalyses={evaluationData.questionAnalysis}
                />
                <div className="lg:col-span-3 space-y-8">
                    <OverallFeedback feedback={evaluationData.overallFeedback} />
                    {evaluationData.questionAnalysis.map((q) => (
                        <QuestionCard key={q.questionNumber} questionData={q} />
                    ))}
                </div>
            </div>
        </main>
    );
}