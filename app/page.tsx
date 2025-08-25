'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import UniversalNavbar from '@/components/shared/UniversalNavbar'; 
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import TrialEvaluator from '@/components/landing/TrialEvaluator';
import Testimonials from '@/components/landing/Testimonials';
import PricingAndCta from '@/components/landing/PricingAndCta';

export default function Home() {
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.style.overflowY = isDestinationSelected ? 'scroll' : 'hidden';
    }
  }, [isDestinationSelected]);

  return (
    <>
      <div className="fixed-background"></div>
      
      <UniversalNavbar 
        pageType="landing"
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

      <div
        id="scroll-container"
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        <main className="relative z-10">
          
          {/* Hero is now a direct snap point */}
          <Hero onDestinationSelect={() => setIsDestinationSelected(true)} />

          {isDestinationSelected && (
            <>
              <section id="features" className="snap-start h-screen">
                <Features />
              </section>
              <section className="snap-start h-screen">
                <TrialEvaluator />
              </section>
              <section className="snap-start h-screen">
                <Testimonials />
              </section>
              <section className="snap-start h-screen">
                <PricingAndCta />
              </section>
            </>
          )}
        </main>
      </div>

      {isDestinationSelected && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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