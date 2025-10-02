// app/result/[evaluationId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import SidebarNav from '@/components/result/SidebarNav';
import OverallAssessmentCard from '@/components/result/OverallAssessmentCard';
import QuestionCard from '@/components/result/QuestionCard';
import { EvaluationData } from '@/lib/types';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store'; // 1. Import the store hook
import { LogOut, User, Settings, ArrowLeft, Download, Loader } from 'lucide-react';

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const { user, logout } = useAuthContext();
    const { setPageLoading } = useEvaluationStore(); // 2. Get the action from the store
    const evaluationId = params.evaluationId as string;

    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Hide loader when this page finishes loading
        setPageLoading(false);

        if (!evaluationId) return;
        const resultDataString = sessionStorage.getItem(evaluationId);

        if (resultDataString) {
            try {
                const parsedData = JSON.parse(resultDataString);
                setEvaluationData({
                    ...parsedData,
                    submittedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                });
            } catch (e) {
                console.error("Parsing error:", e);
                setError("Failed to load and parse evaluation data.");
            }
        } else {
            setError("No evaluation data found for this ID.");
        }
    }, [evaluationId, setPageLoading]);
    
    // 3. Create a handler function for navigation
    const handleBackToDashboard = () => {
        setPageLoading(true);
        router.push('/dashboard');
    };

    const handleDownloadReport = async () => {
        if (!evaluationData) {
            alert("Evaluation data is not available to download.");
            return;
        }
        
        setIsDownloading(true);
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evaluationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Evaluation-Report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error("Download Error:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const navLinks: NavLink[] = [
        { label: 'Dashboard', href: '/dashboard', gradient: 'linear-gradient(to right, #ff9966, #ff5e62)' },
        { label: 'History', href: '/history', gradient: 'linear-gradient(to right, #60a5fa, #3b82f6)' },
        { label: 'Analytics', href: '/analytics', gradient: 'linear-gradient(to right, #34d399, #10b981)' },
    ];

    const actions = (activeLink: NavLink) => {
        if (!user) return <></>;
        return (
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setIsDropdownOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                >
                    {user.email?.substring(0, 2).toUpperCase()}
                </button>
                {isDropdownOpen && (
                         <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1" role="none">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-sm text-gray-700">Signed in as</p>
                                    <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                                </div>
                                <a href="#" className="text-gray-700 hover:bg-gray-100 flex items-center gap-3 px-4 py-2 text-sm" role="menuitem">
                                    <User size={16} />
                                    Profile
                                </a>
                                <a href="#" className="text-gray-700 hover:bg-gray-100 flex items-center gap-3 px-4 py-2 text-sm" role="menuitem">
                                    <Settings size={16} />
                                    Settings
                                </a>
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => logout().then(() => router.push('/auth'))}
                                    className="w-full text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 px-4 py-2 text-sm"
                                    role="menuitem"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                )}
            </div>
        );
    };

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 p-4">{error}</div>;
    if (!evaluationData) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Evaluation Report...</div>;

    return (
        <div className="min-h-screen">
            <div className="fixed-background" />
            <UniversalNavbar navLinks={navLinks} actions={actions} />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-slate-900">Evaluation Report</h1>
                        <p className="mt-1 text-md text-slate-500">
                           {evaluationData.subject} | Submitted on {evaluationData.submittedOn}
                        </p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        <button 
                            className="px-4 py-2 text-sm font-semibold bg-white/60 text-slate-800 hover:bg-white rounded-md transition-colors flex items-center gap-2 backdrop-blur-sm shadow-sm border border-white/20 btn" 
                            onClick={handleBackToDashboard} // 4. Use the new handler
                        >
                            <ArrowLeft size={18} />
                            Evaluate New
                        </button>
                        <button 
                            className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-colors flex items-center gap-2 shadow-lg bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 btn" 
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                        >
                            {isDownloading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                            {isDownloading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </div>
                </div>
                
                <div id="report-content">
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
                </div>
            </main>
        </div>
    );
}