'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/AuthContext';
import Link from 'next/link';

// Import the Universal Navbar and its NavLink type
import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';

// Import all landing page sections
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import FreeTrial from '@/components/landing/FreeTrial';
import PricingAndCta from '@/components/landing/PricingAndCta';

// Define the links for the LANDING PAGE
const landingNavLinks: NavLink[] = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
];

const LandingPageActions = () => (
    <>
        <Link href="/auth" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100">
            Login
        </Link>
        <Link href="/auth" className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900">
            Sign Up
        </Link>
    </>
);

export default function MarketingPage() {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    
    // For the landing page, the active link state is simple
    const [activeLink, setActiveLink] = useState<NavLink>(landingNavLinks[0]);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
            return;
        }
        
        if (!loading && !user) {
            document.body.classList.add('marketing-page-body');
            return () => {
                document.body.classList.remove('marketing-page-body');
            };
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <>
             <UniversalNavbar 
                navLinks={landingNavLinks} 
                // --- THIS IS THE FIX ---
                // We now pass the component directly, not a function
                actions={<LandingPageActions />}
                activeLink={activeLink}
                onLinkClick={setActiveLink}
            />
            <main id="page-container" className="page-container">
                <Hero />
                <Features />
                <Testimonials />
                <FreeTrial />
                <PricingAndCta />
            </main>
        </>
    );
}