'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle } from 'lucide-react';

// Define the type for the props, including the new onLanguageSelect function
interface DestinationSelectorProps {
  onComplete: () => void;
  onLanguageSelect: (language: 'English' | 'Hindi' | 'Gujarati') => void;
}

const exams = [
  { id: 'upsc', name: 'UPSC' },
  { id: 'gpsc', name: 'GPSC' },
];

const languages: { [key: string]: ('English' | 'Hindi' | 'Gujarati')[] } = {
  upsc: ['English', 'Hindi'],
  gpsc: ['English', 'Gujarati'],
};

// Accept onComplete and onLanguageSelect as props
export default function DestinationSelector({ onComplete, onLanguageSelect }: DestinationSelectorProps) {
  const [step, setStep] = useState<'exam' | 'language'>('exam');
  const [selectedExam, setSelectedExam] = useState<(typeof exams[0]) | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleExamSelect = (exam: typeof exams[0]) => {
    setSelectedExam(exam);
    setStep('language');
  };
  
  // This function now handles everything automatically
  const handleLanguageSelect = (lang: 'English' | 'Hindi' | 'Gujarati') => {
    setSelectedLanguage(lang); // Set for local styling
    onLanguageSelect(lang);     // Update the headline in the parent
    onComplete();               // Unlock scrolling in the grandparent
  }

  const containerVariants = {
    exam: { height: '380px' },
    language: { height: '380px' },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="exam"
      animate={step}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-md p-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50"
    >
      <AnimatePresence mode="wait">
        {step === 'exam' && (
          <motion.div
            key="exam"
            variants={contentVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-col h-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Which exam are you preparing for?</h3>
            <div className="grid grid-cols-2 gap-4">
              {exams.map(exam => (
                <button key={exam.id} onClick={() => handleExamSelect(exam)} className="p-4 border rounded-xl text-center hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200">
                  <span className="font-semibold">{exam.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-500 mt-auto">Your journey begins here. Choose an exam to proceed.</p>
          </motion.div>
        )}
        
        {step === 'language' && selectedExam && (
          <motion.div
            key="language"
            variants={contentVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-col h-full"
          >
            <button onClick={() => setStep('exam')} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4">
                <ChevronLeft size={16} className="mr-1" /> Back to Exam Selection
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Select Language for {selectedExam.name}</h3>
            <div className="flex flex-col space-y-3">
              {languages[selectedExam.id].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`p-4 border rounded-xl text-left font-semibold flex items-center justify-between transition-all duration-200 ${selectedLanguage === lang ? 'bg-emerald-500 text-white border-emerald-500' : 'hover:bg-emerald-50 hover:border-emerald-400'}`}
                >
                  {lang}
                  {selectedLanguage === lang && <CheckCircle />}
                </button>
              ))}
            </div>
            {/* The Continue button has been removed */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}