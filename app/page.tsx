'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import UniversalNavbar, { NavLink } from '@/components/shared/UniversalNavbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import TrialEvaluator from '@/components/landing/TrialEvaluator';
import Testimonials from '@/components/landing/Testimonials';

export default function Home() {
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);

  // ADDED: "Home" link and updated other links
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
        actions={(activeLink) => (
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
}