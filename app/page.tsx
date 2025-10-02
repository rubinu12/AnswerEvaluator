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
import PageLoader from '@/components/shared/PageLoader';

// Dynamically import the Hero component to prevent SSR issues with its children
const Hero = dynamic(() => import('@/components/landing/Hero'), {
    ssr: false,
});

// --- CONSTANTS ---
const LAST_VISIT_KEY = 'lastVisit';
const RECENCY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

const MarketingPageContent = () => {
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

export default function Home() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const { setPageLoading } = useEvaluationStore();
    const [showMarketingPage, setShowMarketingPage] = useState(false);

    useEffect(() => {
        // Show the loader immediately while we make a decision
        setPageLoading(true);

        if (loading) {
            return;
        }

        if (user) {
            router.push('/dashboard');
            // The loader will be turned off by the dashboard page
            return;
        }

        const lastVisit = parseInt(localStorage.getItem(LAST_VISIT_KEY) || '0', 10);
        const now = Date.now();

        if (lastVisit !== 0 && now - lastVisit < RECENCY_THRESHOLD) {
            router.push('/auth');
            // The loader will be turned off by the auth page
        } else {
            localStorage.setItem(LAST_VISIT_KEY, now.toString());
            setShowMarketingPage(true);
            setPageLoading(false); // Hide loader to show marketing page
        }

    }, [user, loading, router, setPageLoading]);
    
    // The PageLoader is now in the root layout, so we don't need to return it here.
    // We simply return the marketing content when it's ready to be shown.
    if (showMarketingPage) {
        return <MarketingPageContent />;
    }

    // Return null while redirects are happening. The global PageLoader will cover the screen.
    return null;
}