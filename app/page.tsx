'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import Features from '@/components/landing/Features';
import TrialEvaluator from '@/components/landing/TrialEvaluator';
import Testimonials from '@/components/landing/Testimonials';
import { useAuthContext } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store';

const Hero = dynamic(() => import('@/components/landing/Hero'), {
    ssr: false,
});

// --- [RENAMED] Desktop-Specific Marketing Page ---
const DesktopMarketingPage = () => {
    const [isDestinationSelected, setIsDestinationSelected] = useState(false);

    const navLinks: NavLink[] = [
        { label: 'Home', href: '/', gradient: 'linear-gradient(135deg, #E1E5F8, #C5CAE9)' },
        { label: 'Features', href: '/features', gradient: 'linear-gradient(135deg, #D4E9E2, #A5D6A7)' },
        { label: 'Pricing', href: '/pricing', gradient: 'linear-gradient(135deg, #B3D8E0, #80DEEA)' },
    ];

    return (
        <>
            <div className="fixed-background"></div>
            <UniversalNavbar
    navLinks={navLinks}
    actions={() => (
        <>
            <Link href="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                Log In
            </Link>
            {/* [FIX] Add the 'btn' class to the Sign Up link */}
            <Link href="/auth" className="btn px-5 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900">
                Sign Up
            </Link>
        </>
    )}
/>
            <main className="relative z-10">
                <Hero onDestinationSelect={() => setIsDestinationSelected(true)} />
                {isDestinationSelected && (
                    <>
                        <Features />
                        <TrialEvaluator />
                        <Testimonials />
                    </>
                )}
            </main>
            {isDestinationSelected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20"
                >
                    <a href="#features" className="p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg block">
                        <ChevronDown className="h-8 w-8 text-gray-600 animate-bounce" />
                    </a>
                </motion.div>
            )}
        </>
    );
};

// --- [NEW] Mobile-Specific Marketing Page (Placeholder) ---
const MobileMarketingPage = () => {
    // We will build the mobile-optimized landing page experience here.
    return (
        <div className="h-full flex flex-col">
             <div className="fixed-background"></div>
             {/* The mobile experience will not use the UniversalNavbar */}
             <main className="p-4 text-center flex-grow flex items-center justify-center relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">Mobile Page Coming Soon</h1>
                    <p className="text-slate-600 mt-2">We will design the mobile experience here.</p>
                </div>
             </main>
        </div>
    );
};


// --- Main Page Component with Switcher Logic ---
export default function Home() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const { setPageLoading } = useEvaluationStore();
    const [showMarketingPage, setShowMarketingPage] = useState(false);

    useEffect(() => {
        setPageLoading(true);
        if (loading) {
            return;
        }
        if (user) {
            router.push('/dashboard');
        } else {
            setShowMarketingPage(true);
            setPageLoading(false);
        }
    }, [user, loading, router, setPageLoading]);
    
    if (showMarketingPage) {
        return (
            <>
                {/* --- Desktop View --- */}
                <div className="hidden md:block h-full">
                    <DesktopMarketingPage />
                </div>
                {/* --- Mobile View --- */}
                <div className="block md:hidden h-full">
                    <MobileMarketingPage />
                </div>
            </>
        );
    }
    
    return null;
}