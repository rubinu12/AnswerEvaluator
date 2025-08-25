'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationSelector from '@/components/landing/DestinationSelector';
import LottiePlayer from '@/components/landing/LottiePlayer';
import animationData from '@/public/hero.json';
import { ArrowRight } from 'lucide-react';

type Language = 'English' | 'Hindi' | 'Gujarati';

const headlines: { [key in Language]: { part1: string, part2: string } } = {
  English: { part1: 'Transform Your Handwritten Answers into', part2: 'Exam Success' },
  Hindi: { part1: 'अपने हस्तलिखित उत्तरों को में बदलें', part2: 'परीक्षा सफलता' },
  Gujarati: { part1: 'તમારા હસ્તલિખિત જવાબોને માં રૂપાંતરિત કરો', part2: 'પરીક્ષામાં સફળતા' },
};

interface HeroProps {
  onDestinationSelect: () => void;
}

export default function Hero({ onDestinationSelect }: HeroProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [language, setLanguage] = useState<Language>('English');

  const currentHeadline = headlines[language];

  return (
    // FIX: This structure forces perfect centering and prevents overflow.
    <section className="snap-start w-full h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <div className="text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.h1
                key={language}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
              >
                {currentHeadline.part1}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                  {currentHeadline.part2}
                </span>
              </motion.h1>
            </AnimatePresence>
            
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
              Get instant, AI-powered feedback on your exam answer sheets. Identify weaknesses, refine your strategy, and write like a topper.
            </p>
            <div className="mt-10">
              <button
                onClick={() => setShowSelector(true)}
                className="btn inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg"
              >
                Choose Your Destination
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center h-[380px]">
             <AnimatePresence mode="wait">
                {!showSelector ? (
                    <motion.div key="lottie" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                        <LottiePlayer animationData={animationData} />
                    </motion.div>
                ) : (
                    <motion.div key="selector" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full">
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