'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookCheck, FileQuestion } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- Data for our interactive selectors ---
const exams = ['UPSC Civil Services', 'State PSC', 'Other Exam'];
const languages = ['English', 'Hindi', 'Gujarati'];

export default function MasterpieceHero() {
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    
    // This state controls when the CTA buttons appear
    const selectionMade = selectedExam && selectedLanguage;

    return (
        <section className="relative w-full h-screen min-h-[700px] xs:min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* 1. Background Image: Indian Flag */}
            <Image
                src="/path/to/your/indian-flag-bg.jpg" // **ACTION**: Replace with your actual flag image path
                alt="Indian flag background"
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 z-0 opacity-10" // Subtle opacity
            />
            {/* A soft gradient overlay to improve text readability */}
            <div className="absolute inset-0 z-1 bg-gradient-to-t from-white via-white/80 to-transparent"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 2. Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* --- Left Column: Content & Interactivity --- */}
                    <div className="text-center lg:text-left">
                        <motion.h1 
                            className="text-4xl xs:text-5xl md:text-6xl font-extrabold text-slate-900 font-serif"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            The Complete Arsenal for Your UPSC Journey.
                        </motion.h1>
                        
                        <motion.p 
                            className="mt-6 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            One unified platform for Mains answer evaluation and Prelims PYQ practice. Start your journey to a top rank today.
                        </motion.p>
                        
                        {/* 3. Interactive Selector Section */}
                        <motion.div 
                            className="mt-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <AnimatePresence mode="wait">
                                {selectionMade ? (
                                    // CTA Buttons State
                                    <motion.div
                                        key="cta-buttons"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 justify-center lg:justify-start"
                                    >
                                        <Link href="/auth" className="block w-full sm:w-auto px-8 py-4 text-center font-semibold text-white bg-emerald-600 rounded-lg shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105">
                                            <div className="flex items-center justify-center gap-2">
                                                <BookCheck size={20} />
                                                <span>Get 2 Free Evaluations</span>
                                            </div>
                                        </Link>
                                        <Link href="/auth" className="block w-full sm:w-auto px-8 py-4 text-center font-semibold text-slate-800 bg-slate-200 rounded-lg shadow-lg hover:bg-slate-300 transition-transform hover:scale-105">
                                            <div className="flex items-center justify-center gap-2">
                                                <FileQuestion size={20} />
                                                <span>Start a Free PYQ Test</span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ) : (
                                    // Initial Selection State
                                    <motion.div
                                        key="selectors"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="p-6 bg-white/60 backdrop-blur-lg rounded-xl shadow-2xl border border-white/50 max-w-md mx-auto lg:mx-0"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Custom Dropdown for Exam */}
                                            <CustomDropdown options={exams} selected={selectedExam} onSelect={setSelectedExam} placeholder="Select Your Exam" />
                                            {/* Custom Dropdown for Language */}
                                            <CustomDropdown options={languages} selected={selectedLanguage} onSelect={setSelectedLanguage} placeholder="Select Language" />
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500">Select your goal to unlock your free trials.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* --- Right Column: AI Tree Image --- */}
                    <motion.div 
                        className="relative h-64 lg:h-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3, type: 'spring' }}
                    >
                         <Image
                            src="/treeAI.jpeg" // Your AI Tree image from the public folder
                            alt="AI knowledge tree"
                            layout="fill"
                            objectFit="contain"
                            className="drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// --- A Helper Component for our styled dropdowns ---
function CustomDropdown({ options, selected, onSelect, placeholder }: { options: string[], selected: string | null, onSelect: (value: string) => void, placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-800 font-semibold rounded-md shadow-sm border border-slate-200">
                <span>{selected || placeholder}</span>
                <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full mt-2 bg-white rounded-md shadow-lg border border-slate-200 z-20 overflow-hidden"
                    >
                        {options.map(option => (
                            <li
                                key={option}
                                onClick={() => { onSelect(option); setIsOpen(false); }}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                {option}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}