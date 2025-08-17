// app/components/dashboard/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/AuthContext';

// Define the props the Header will accept
interface HeaderProps {
    evaluationStatus: 'idle' | 'processing' | 'complete';
    onViewResult: () => void;
}

export default function Header({ evaluationStatus, onViewResult }: HeaderProps) {
    const { user } = useAuthContext();
    const router = useRouter();
    const [isSubNavVisible, setIsSubNavVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 50) {
                setIsSubNavVisible(false);
            } else {
                setIsSubNavVisible(true);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/auth');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const renderStatus = () => {
        switch (evaluationStatus) {
            case 'processing':
                return (
                    <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full pulse-dot"></div>
                        <span className="text-sm text-slate-500">Evaluating...</span>
                    </div>
                );
            case 'complete':
                 return (
                    <a href="#" onClick={(e) => { e.preventDefault(); onViewResult(); }} className="text-sm font-semibold text-green-600 underline">
                        Evaluation Complete! View Result
                    </a>
                );
            case 'idle':
            default:
                return (
                     <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <input type="text" placeholder="Search..." className="bg-slate-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"/>
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <div className="w-9 h-9 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">Logout</button>
                    </div>
                );
        }
    }

    return (
        <>
            {/* Main Header (Top Navbar) */}
            <header className="main-header sticky top-0 z-50 border-b border-slate-200" style={{ backgroundColor: 'rgba(253, 252, 249, 0.85)', backdropFilter: 'blur(10px)'}}>
                {/* Progress Bar Container */}
                <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                    {evaluationStatus === 'processing' && <div className="h-full w-full bg-blue-200 progress-bar-indeterminate text-blue-500"></div>}
                    {evaluationStatus === 'complete' && <div className="h-full w-full bg-green-500"></div>}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-2xl font-bold text-slate-900 font-serif">Root & Rise</h1>
                        </div>
                        <div className="flex items-center">
                           {renderStatus()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-Navbar with Dropdowns */}
            <nav className={`sub-nav bg-white sticky top-16 z-40 ${isSubNavVisible ? '' : 'sub-nav-hidden'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 h-12">
                        <a href="#" className="sub-nav-link active flex items-center text-sm font-semibold">Dashboard</a>
                        {/* Other nav links can be added here */}
                    </div>
                </div>
            </nav>
        </>
    );
}