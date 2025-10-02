'use client';

import { useState, useEffect } from 'react';
import { useEvaluationStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

// A list of motivational quotes for the typewriter
const quotes = [
    "The best way to predict the future is to create it.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "Strive for progress, not perfection.",
    "The secret of getting ahead is getting started.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you’ve ever wanted is on the other side of fear."
];

// Custom hook for the typewriter effect
const useTypewriter = (texts: string[], typingSpeed = 100, deletingSpeed = 50, pause = 2000) => {
    const [text, setText] = useState('');
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[index];
        const timeout = setTimeout(() => {
            if (isDeleting) {
                setText(currentText.substring(0, text.length - 1));
            } else {
                setText(currentText.substring(0, text.length + 1));
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        if (!isDeleting && text === currentText) {
            setTimeout(() => setIsDeleting(true), pause);
        } else if (isDeleting && text === '') {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % texts.length);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, index, texts, typingSpeed, deletingSpeed, pause]);

    return text;
};

// The main PageLoader component
export default function PageLoader() {
    const { isPageLoading } = useEvaluationStore();
    const typedText = useTypewriter(quotes);

    return (
        <AnimatePresence>
            {isPageLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]"
                >
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <p className="text-white text-lg font-medium mt-6 text-center px-4">
                        {typedText}
                        <span className="animate-ping">|</span>
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}