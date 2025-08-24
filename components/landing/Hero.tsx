'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const contentData: { [key: string]: { [key: string]: { headline: string; subheadline: string } } } = {
    'GPSC': {
        'Gujarati': { headline: `તમારા GPSC લક્ષ્ય માટે ચોકસાઈ સાધનો`, subheadline: `GPSC મેન્સ પર વિજય મેળવવા માટે વિશિષ્ટ પ્રતિસાદ મેળવો.` }
    },
    'UPSC': {
        'English': { headline: `Precision Tools for Your UPSC Ascent`, subheadline: `Unlock your potential with AI-driven insights.` }
    }
};
const examLanguageMap: { [key: string]: string[] } = {
    'UPSC': ['English', 'Hindi'],
    'UPPCS': ['English', 'Hindi'],
    'GPSC': ['English', 'Gujarati'],
    'BPSC': ['English', 'Hindi']
};

export default function Hero() {
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    const handleExamSelect = (exam: string) => {
        setSelectedExam(exam);
        setSelectedLanguage(null);
    };

    const announcement = selectedExam && selectedLanguage && contentData[selectedExam]?.[selectedLanguage]
        ? contentData[selectedExam][selectedLanguage]
        : { headline: 'ACE Your Preparation', subheadline: 'The ultimate AI-powered platform for UPSC, State PCS, and other competitive exam aspirants.' };

    return (
        <section className="relative flex items-center justify-center w-full min-h-screen px-4 py-16 overflow-hidden">
            
            {/* --- THIS IS THE KEY --- */}
            {/* This div layers your specific hero image ON TOP of the universal background */}
            <div 
                className="absolute inset-0 z-[-5] bg-cover bg-center"
                style={{ backgroundImage: `url('/hero(1).png')` }} // Make sure your image is named hero.jpg in /public
            >
                {/* This overlay adds the subtle dark tint for readability */}
                <div className="absolute inset-0 bg-slate-900/20"></div>
            </div>

            <div className="relative grid w-full max-w-6xl grid-cols-1 gap-16 lg:grid-cols-2 items-center">
                
                {/* --- LEFT COLUMN: CONTENT --- */}
                <div className="flex flex-col text-center lg:text-left items-center lg:items-start text-white">
                    <motion.h1
                        key={announcement.headline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="font-serif text-5xl font-bold md:text-7xl text-white drop-shadow-lg"
                    >
                        {announcement.headline}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="mt-4 text-lg text-slate-200 max-w-md drop-shadow-md"
                    >
                        {announcement.subheadline}
                    </motion.p>
                </div>
                
                {/* --- RIGHT COLUMN: SELECTOR CARD --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md p-8 bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl mx-auto lg:mx-0"
                >
                    <div className="w-full">
                        <h3 className="text-lg font-semibold text-white text-left mb-4 drop-shadow-sm">1. Select your destination</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.keys(examLanguageMap).map(exam => (
                                <button 
                                    key={exam} 
                                    onClick={() => handleExamSelect(exam)}
                                    className={`w-full text-left p-4 text-md font-semibold border rounded-xl transition-all duration-200 flex items-center justify-between ${selectedExam === exam ? 'bg-white/90 text-indigo-700 border-white/80 ring-4 ring-white/50' : 'bg-white/20 hover:bg-white/40 text-white border-white/30'}`}
                                >
                                    {exam}
                                </button>
                            ))}
                        </div>
                    </div>
                    <AnimatePresence>
                        {selectedExam && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="w-full overflow-hidden"
                            >
                                <div className="pt-8 border-t border-white/30">
                                    <h3 className="text-lg font-semibold text-white text-left mb-4 drop-shadow-sm">2. Choose your language</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {examLanguageMap[selectedExam].map(lang => (
                                            <button 
                                                key={lang}
                                                onClick={() => setSelectedLanguage(lang)}
                                                className={`w-full text-left p-4 text-md font-semibold border rounded-xl transition-all duration-200 flex items-center justify-between ${selectedLanguage === lang ? 'bg-white/90 text-indigo-700 border-white/80 ring-4 ring-white/50' : 'bg-white/20 hover:bg-white/40 text-white border-white/30'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}