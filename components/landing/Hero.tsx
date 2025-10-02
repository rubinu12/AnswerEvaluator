// components/landing/Hero.tsx

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic'; // 1. Import dynamic
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Import child components
import DestinationSelector from '@/components/landing/DestinationSelector';

// Import the Lottie animation data directly
import animationData from '@/public/hero.json';

// 2. Dynamically import the LottiePlayer with SSR turned off
const LottiePlayer = dynamic(() => import('@/components/landing/LottiePlayer'), {
    ssr: false,
});


// --- Type Definitions ---
type Language = 'English' | 'Hindi' | 'Gujarati';

interface HeroProps {
  onDestinationSelect: () => void;
}

// --- Constants ---
const HEADLINES: { [key in Language]: { part1: string, part2: string } } = {
  English: { part1: 'Transform Your Handwritten Answers into', part2: 'Exam Success' },
  Hindi: { part1: 'अपने हस्तलिखित उत्तरों को बदलें', part2: 'परीक्षा सफलता में' },
  Gujarati: { part1: 'તમારા હસ્તલિખિત જવાબોને રૂપાંતરિત કરો', part2: 'પરીક્ષામાં સફળતા' },
};

// Centralized animation variants for cleaner code
const motionVariants = {
  textContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  },
  textItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  interactivePanel: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  }
};


// --- The Hero Component ---
export default function Hero({ onDestinationSelect }: HeroProps) {
  // --- State Management ---
  const [showSelector, setShowSelector] = useState(false);
  const [language, setLanguage] = useState<Language>('English');

  const currentHeadline = HEADLINES[language];

  // --- Render Method ---
  return (
    <section className="w-full h-screen flex items-center justify-center overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 items-center">
          
          {/* Column 1: All textual content and the main button */}
          <motion.div 
            className="text-center md:text-left"
            variants={motionVariants.textContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Animated Headline with language switching */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={language}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
              >
                {currentHeadline.part1}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                  {currentHeadline.part2}
                </span>
              </motion.h1>
            </AnimatePresence>
            
            <motion.p 
              variants={motionVariants.textItem}
              className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0"
            >
              Get instant, AI-powered feedback on your exam answer sheets. Identify weaknesses, refine your strategy, and write like a topper.
            </motion.p>
            
            <motion.div variants={motionVariants.textItem} className="mt-10">
              <button
                onClick={() => setShowSelector(true)}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-transform transform hover:scale-105"
              >
                Choose Your Destination
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Column 2: Lottie Animation which transitions to the Destination Selector */}
          <div className="flex items-center justify-center min-h-[380px]">
            <AnimatePresence mode="wait">
              {!showSelector ? (
                <motion.div 
                  key="lottie" 
                  variants={motionVariants.interactivePanel}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full h-full"
                >
                  <LottiePlayer animationData={animationData} />
                </motion.div>
              ) : (
                <motion.div 
                  key="selector" 
                  variants={motionVariants.interactivePanel}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <DestinationSelector 
                    onComplete={onDestinationSelect} 
                    onLanguageSelect={setLanguage} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}