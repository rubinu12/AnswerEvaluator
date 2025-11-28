'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, Download, Loader } from 'lucide-react';

// --- SHARED COMPONENTS ---
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store';
import { EvaluationData } from '@/lib/types';

// --- NEW RESULT COMPONENTS ---
import SidebarNav from '@/components/result/SidebarNav';
import QuestionCard from '@/components/result/QuestionCard';

// --- MOBILE VIEW ---
const MobileView = ({ evaluationData }: { evaluationData: EvaluationData }) => {
    return (
        <div className="bg-slate-100 min-h-screen pb-20">
            <div className="p-4">
                <h1 className="text-xl font-bold text-slate-800">Mobile Report</h1>
                <p className="text-sm text-slate-600 mb-4">{evaluationData.subject}</p>
                
                <div className="space-y-6">
                    {/* Only render Question Cards. No old AssessmentCard. */}
                    {evaluationData.questionAnalysis.map((q, index) => (
                        <QuestionCard key={index} data={q} />
                    ))}
                </div>
            </div>
            {/* Simple Bottom Nav Placeholder */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs text-gray-400">
                Tap to Navigate
            </div>
        </div>
    );
};

// --- DESKTOP VIEW ---
const DesktopView = ({ 
    evaluationData, 
    handleBackToDashboard, 
    handleDownloadReport,
    isDownloading,
    navLinks,
    actions
}: { 
    evaluationData: EvaluationData;
    handleBackToDashboard: () => void;
    handleDownloadReport: () => void;
    isDownloading: boolean;
    navLinks: NavLink[];
    actions: (activeLink: NavLink) => React.ReactNode;
}) => {
    // State for Sidebar Navigation
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const scrollToQuestion = (index: number) => {
        setActiveQuestionIndex(index);
        questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-40" style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            <UniversalNavbar navLinks={navLinks} actions={actions} />
            
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-3xl font-black font-serif text-slate-900 tracking-tight">Evaluation Report</h1>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">{evaluationData.subject}</span>
                            <span>•</span>
                            <span>{evaluationData.submittedOn}</span>
                        </div>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button 
                            className="px-4 py-2 text-sm font-semibold bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg shadow-sm transition-all flex items-center gap-2" 
                            onClick={handleBackToDashboard}
                        >
                            <ArrowLeft size={16} />
                            Evaluate New
                        </button>
                        <button 
                            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md transition-all flex items-center gap-2" 
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                        >
                            {isDownloading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                            {isDownloading ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar: Sticky Navigation */}
                    <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">
                        <SidebarNav 
                            data={evaluationData} 
                            activeQuestionIndex={activeQuestionIndex}
                            onSelectQuestion={scrollToQuestion}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-12">
                        {/* REMOVED: <OverallAssessmentCard /> 
                           REASON: Verdict & Action Plan are now inside QuestionCard
                        */}
                        
                        {evaluationData.questionAnalysis.map((q, index) => (
                            <div key={index} ref={el => { questionRefs.current[index] = el }}>
                                <QuestionCard data={q} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- PAGE COMPONENT ---
export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const { user, logout } = useAuthContext();
    const { setPageLoading } = useEvaluationStore();
    const evaluationId = params.evaluationId as string;

    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        setPageLoading(false);

        if (!evaluationId) return;
        
        const resultDataString = sessionStorage.getItem(evaluationId);

        if (resultDataString) {
            try {
                const parsedData = JSON.parse(resultDataString);
                // Safety check for new data structure
                if (!parsedData.questionAnalysis?.[0]?.blindSpotAnalysis) {
                    console.warn("Legacy data detected. Some features might be missing.");
                }

                setEvaluationData({
                    ...parsedData,
                    submittedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                });
            } catch (e) {
                console.error("Parsing error:", e);
                setError("Failed to load evaluation data.");
            }
        } else {
            setError("Evaluation not found. Please try submitting again.");
        }
    }, [evaluationId, setPageLoading]);
    
    const handleBackToDashboard = () => {
        setPageLoading(true);
        router.push('/dashboard');
    };

    const handleDownloadReport = async () => {
        if (!evaluationData) return;
        setIsDownloading(true);
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evaluationData),
            });
            if (!response.ok) throw new Error('Failed to generate PDF');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RootRise-Report-${evaluationData.subject}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    const navLinks: NavLink[] = [
        { label: 'Dashboard', href: '/dashboard', gradient: 'linear-gradient(to right, #6366f1, #8b5cf6)' },
        { label: 'History', href: '/history', gradient: 'linear-gradient(to right, #3b82f6, #06b6d4)' },
        { label: 'Analytics', href: '/analytics', gradient: 'linear-gradient(to right, #10b981, #34d399)' },
    ];

    const actions = (activeLink: NavLink) => {
        if (!user) return <></>;
        return (
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white hover:bg-slate-800 transition-colors"
                >
                    {user.email?.substring(0, 2).toUpperCase()}
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden py-1">
                        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Signed in as</p>
                            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                        <button onClick={() => logout().then(() => router.push('/auth'))} className="w-full text-left text-red-600 hover:bg-red-50 flex items-center gap-2 px-4 py-2.5 text-sm transition-colors">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100 font-medium">{error}</div>
            <button onClick={handleBackToDashboard} className="mt-4 text-sm text-slate-500 hover:text-slate-900 underline">Return to Dashboard</button>
        </div>
    );
    
    if (!evaluationData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
            <Loader className="animate-spin text-slate-400" size={32} />
            <p className="text-sm text-slate-500 font-medium animate-pulse">Loading Analysis...</p>
        </div>
    );

    return (
        <>
            <div className="hidden md:block">
                <DesktopView 
                    evaluationData={evaluationData}
                    handleBackToDashboard={handleBackToDashboard}
                    handleDownloadReport={handleDownloadReport}
                    isDownloading={isDownloading}
                    navLinks={navLinks}
                    actions={actions}
                />
            </div>
            <div className="block md:hidden">
                <MobileView evaluationData={evaluationData} />
            </div>
        </>
    );
}