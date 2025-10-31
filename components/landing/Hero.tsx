'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCheck, FileQuestion } from 'lucide-react';
import Link from 'next/link';

// Import child components
import DestinationSelector from '@/components/landing/DestinationSelector';

// Import the Lottie animation data directly
import animationData from '@/public/hero.json';

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
    English: { part1: 'The Complete Ecosystem for Your', part2: 'UPSC Success' },
    Hindi: { part1: 'आपकी UPSC सफलता के लिए संपूर्ण', part2: 'इकोसिस्टम' },
    Gujarati: { part1: 'તમારી UPSC સફળતા માટે સંપૂર્ણ', part2: 'ઇકોસિસ્ટમ' },
};

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
    const [showSelector, setShowSelector] = useState(false);
    const [language, setLanguage] = useState<Language>('English');
    const [selectionComplete, setSelectionComplete] = useState(false);

    const currentHeadline = HEADLINES[language];

    const handleSelectionComplete = () => {
        setSelectionComplete(true);
        onDestinationSelect();
    };

    return (
        <section className="w-full h-screen flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-x-16 gap-y-10 items-center">
                
                {/* Column 1: Textual content */}
                <motion.div 
                    className="text-center md:text-left"
                    variants={motionVariants.textContainer}
                    initial="hidden"
                    animate="visible"
                >
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
                        One unified platform for Mains answer evaluation and Prelims PYQ practice. Start your journey to a top rank today.
                    </motion.p>
                    
                    <motion.div variants={motionVariants.textItem} className="mt-10">
                        <AnimatePresence mode="wait">
                            {selectionComplete ? (
                                    <motion.div
                                    key="cta-buttons"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 justify-center md:justify-start"
                                >
                                    {/* [FIX] Added 'btn' class */}
                                    <Link href="/auth" className="btn block w-full sm:w-auto px-6 py-3 text-center font-semibold text-white bg-emerald-600 rounded-lg shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-center gap-2">
                                            <BookCheck size={20} />
                                            <span>Get 2 Free Evaluations</span>
                                        </div>
                                    </Link>
                                    {/* [FIX] Added 'btn' class */}
                                    <Link href="/auth" className="btn block w-full sm:w-auto px-6 py-3 text-center font-semibold text-slate-800 bg-slate-200 rounded-lg shadow-lg hover:bg-slate-300 transition-transform hover:scale-105">
                                        <div className="flex items-center justify-center gap-2">
                                            <FileQuestion size={20} />
                                            <span>Start a Free PYQ Test</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="choose-destination"
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setShowSelector(true)}
                                    // [FIX] Added 'btn' class
                                    className="btn inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-transform transform hover:scale-105"
                                >
                                    Start Your Journey
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Column 2: Lottie Animation / Selector */}
                <div className="flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!showSelector ? (
                            <motion.div key="lottie" variants={motionVariants.interactivePanel} initial="initial" animate="animate" exit="exit" className="w-full h-full">
                                <LottiePlayer animationData={animationData} />
                            </motion.div>
                        ) : (
                            <motion.div key="selector" variants={motionVariants.interactivePanel} initial="initial" animate="animate" exit="exit" className="w-full">
                                <DestinationSelector 
                                    onComplete={handleSelectionComplete} 
                                    onLanguageSelect={setLanguage} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}