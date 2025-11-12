// components/quiz/Header.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useQuizStore } from '@/lib/quizStore'; // <-- The "Data Store"
import { useQuizUIStore } from '@/lib/quizUIStore'; // <-- 💎 NEW "UI Store"
import { useRouter } from 'next/navigation';
import { Timer, X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import DynamicQuizCommandBar from './DynamicQuizCommandBar';
import { useAuthContext } from '@/lib/AuthContext';

// Timer Component
const QuizTimer = () => {
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  // We select each piece of state atomically to prevent
  // the "getSnapshot" infinite loop.
  const timeLeft = useQuizStore((state) => state.timeLeft);
  const setTimeLeft = useQuizStore((state) => state.setTimeLeft);
  const isTestMode = useQuizStore((state) => state.isTestMode);
  // --- 💎 --- END OF FIX --- 💎 ---

  useEffect(() => {
    if (!isTestMode) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, setTimeLeft, isTestMode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
      <Timer className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// --- Main Header Component ---
export default function Header() {
  const router = useRouter();
  
  // --- 💎 --- THIS IS THE FIX (Atomic Selectors) --- 💎 ---
  const quizTitle = useQuizStore((state) => state.quizTitle);
  const resetTest = useQuizStore((state) => state.resetTest);
  const isTopBarVisible = useQuizUIStore((state) => state.isTopBarVisible);
  // --- 💎 --- END OF FIX --- 💎 ---

  const { user } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // These handlers are now correct for *your* modal
  const handleExitAndErase = () => {
    resetTest(); 
    router.push('/dashboard');
  };

  const handleExitAndSave = () => {
    // You'd add save logic here, then push
    router.push('/dashboard');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md transition-all duration-300 ${
          isTopBarVisible
            ? 'h-20 border-b border-gray-200'
            : 'h-0 border-none'
        } overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {quizTitle}
            </h1>
          </div>
          <div className="hidden lg:block">
            <DynamicQuizCommandBar />
          </div>
          <div className="flex items-center gap-4">
            <QuizTimer />
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600"
              title="Exit Quiz"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- 💎 --- MODAL FIX --- 💎 --- */}
      {/* We render conditionally (no `isOpen` prop)
          and pass the correct `onConfirm` handlers */}
      {isModalOpen && (
        <ConfirmationModal
          onClose={() => setIsModalOpen(false)}
          onConfirmErase={handleExitAndErase}
          onConfirmSave={handleExitAndSave}
        />
      )}
      {/* --- 💎 --- END OF MODAL FIX --- 💎 --- */}
    </>
  );
}