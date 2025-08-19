// app/result/[evaluationId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SidebarNav from '@/components/result/SidebarNav';
import OverallFeedback from '@/components/result/OverallFeedback';
import QuestionCard from '@/components/result/QuestionCard';

// This interface is now fully updated to match all child component requirements
interface FinalQuestionData {
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  maxMarks: number;
  score: number;
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
  };
  // THIS IS THE NEWLY ADDED SECTION TO FIX THE ERROR
  answerFramework: {
    introduction: string;
    body: string[];
    conclusion: string;
  };
  writingStrategyNotes: string[];
}

interface FinalEvaluationData {
  overallScore: number;
  totalMarks: number;
  submittedOn: string;
  paper: string;
  overallFeedback: any;
  questionAnalysis: FinalQuestionData[];
}

export default function ResultPage() {
    const params = useParams();
    const evaluationId = params.evaluationId as string;

    const [evaluationData, setEvaluationData] = useState<FinalEvaluationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    useEffect(() => {
        if (!evaluationId) return;
        const resultDataString = sessionStorage.getItem(evaluationId);
        if (resultDataString) {
            try {
                const parsedData = JSON.parse(resultDataString);
                setEvaluationData({
                    ...parsedData,
                    submittedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
                    paper: parsedData.subject || "GS Paper 1"
                });
            } catch (e) {
                console.error("Parsing error:", e);
                setError("Failed to load and parse evaluation data.");
            }
        } else {
            setError("No evaluation data found for this ID. Please try evaluating again.");
        }
        
        const navLinks = document.querySelectorAll('.sidebar-link');
        const sections = document.querySelectorAll('section[id]');
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
        }, { rootMargin: '-20% 0px -80% 0px' });
        
        const timer = setTimeout(() => {
            const sectionsWithId = document.querySelectorAll('section[id]');
            if (sectionsWithId.length) {
                sectionsWithId.forEach(sec => observer.observe(sec));
            }
        }, 100);
        
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 80) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(timer);
            sections.forEach(sec => observer.unobserve(sec));
            window.removeEventListener('scroll', handleScroll);
        };
    }, [evaluationId]);

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 p-4">{error}</div>;
    if (!evaluationData) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Evaluation Report...</div>;

    return (
        <>
            <header className={`main-header ${isHeaderVisible ? '' : 'header-hidden'}`}>
                <div className="header-content">
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">Root & Rise</h1>
                    <nav className="hidden md:flex items-center space-x-2">
                        <a href="/dashboard" className="sub-nav-link active">Evaluate</a>
                        <a href="#" className="sub-nav-link">Daily Practice</a>
                        <a href="#" className="sub-nav-link">History</a>
                        <a href="#" className="sub-nav-link">Profile</a>
                    </nav>
                </div>
            </header>
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
                        questionAnalyses={evaluationData.questionAnalysis.map(q => ({
                            questionNumber: q.questionNumber,
                            score: q.score,
                            maxMarks: q.maxMarks
                        }))}
                    />
                    <div className="lg:col-span-3 space-y-8">
                        <OverallFeedback feedback={evaluationData.overallFeedback} />
                        {evaluationData.questionAnalysis.map((q) => (
                            <QuestionCard key={q.questionNumber} questionData={q} />
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}