// components/quiz/Header.tsx
'use client';

import React, { useState } from 'react';
// We remove 'Link' as we will navigate manually
import { useRouter } from 'next/navigation'; 
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { Home, User, ArrowLeft, X, FileText, CheckSquare } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; 

// --- INLINE STYLED COMPONENTS ---

// 💎 --- MODIFIED IconButton --- 💎
// It no longer uses `href`. It will use `onClick` to ensure we can
// call clearQuizSession() before navigating.
const IconButton = ({ onClick, children, className = '' }: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </button>
  );
};

// (StyledButton is unchanged)
const StyledButton = ({ onClick, children, variant = 'primary', className = '', href, disabled }: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  className?: string;
  href?: string;
  disabled?: boolean;
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm';
  const primaryClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  const outlineClasses = 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500';
  const disabledClasses = 'bg-gray-300 text-gray-500 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${
        disabled ? disabledClasses : (variant === 'primary' ? primaryClasses : outlineClasses)
      } ${className}`}
    >
      {children}
    </button>
  );
};

// --- MAIN HEADER COMPONENT ---

export default function Header() {
  const router = useRouter(); 

  const [showStartModal, setShowStartModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    isTestMode,
    showReport,
    quizTitle,
    startTest,
    clearQuizSession // <-- We need this for the "leave" buttons
  } = useQuizStore();
  
  const isTopBarVisible = useQuizUIStore(s => s.isTopBarVisible);

  if (isTestMode) {
    return null;
  }

  const headerClasses = [
    'fixed top-0 left-0 right-0 z-20',
    'h-16 bg-white border-b border-gray-200',
    'transition-transform duration-300 ease-in-out',
    isTopBarVisible ? 'translate-y-0' : '-translate-y-full',
  ].join(' ');

  const title = showReport ? `${quizTitle} - Report` : quizTitle;

  // --- 💎 --- THIS IS THE FIX --- 💎 ---
  // This is your "Wipe on Leave" logic
  const handleLeaveQuiz = () => {
    // 1. Wipe the state from localStorage
    clearQuizSession();
    // 2. Navigate to the dashboard
    router.push('/dashboard');
  };
  // --- 💎 --- END OF FIX --- 💎 ---

  const handleStartTest = () => {
    startTest(); // This function now correctly wipes state
    setShowStartModal(false);
  };

  // The ConfirmationModal now handles its own logic,
  // so this button just opens it.
  const handleDashboardClick = () => {
    setShowConfirmModal(true);
  };

  return (
    <>
      <header className={headerClasses}>
        <div className="flex h-full w-full items-center justify-between px-6">
          
          {/* --- 💎 --- MODIFIED TO USE ONCLICK --- 💎 --- */}
          {/* This now correctly clears state before leaving */}
          <IconButton onClick={handleLeaveQuiz} className="hidden lg:flex">
            <Home className="h-5 w-5" />
          </IconButton>
          
          <IconButton onClick={handleLeaveQuiz} className="flex lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
          {/* --- 💎 --- END OF MODIFICATION --- 💎 --- */}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="truncate text-lg font-semibold text-gray-800">
              {title || 'Loading Quiz...'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!showReport ? (
              // --- Practice Mode Content ---
              <StyledButton 
                onClick={() => setShowStartModal(true)}
                variant="primary"
              >
                Start Test
              </StyledButton>
            ) : (
              // --- Review Mode Content ---
              <>
                <StyledButton 
                  onClick={handleDashboardClick} // <-- Just opens the modal
                  variant="primary"
                >
                  Dashboard
                </StyledButton>
                <IconButton>
                  <User className="h-5 w-5" />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- "START TEST" MODAL (Unchanged) --- */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold">Select Test Mode</h2>
              <IconButton onClick={() => setShowStartModal(false)}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border-2 border-gray-300 p-6">
                <FileText className="h-10 w-10 text-blue-600" />
                <h3 className="mt-4 text-lg font-semibold">OMR Test</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Download our OMR sheet, fill it, and upload a photo to get your results.
                </p>
                <StyledButton onClick={() => {}} variant="outline" className="mt-6 w-full" disabled>
                  Coming Soon
                </StyledButton>
              </div>

              <div className="rounded-lg border-2 border-blue-500 p-6 ring-2 ring-blue-200">
                <CheckSquare className="h-10 w-10 text-green-600" />
                <h3 className="mt-4 text-lg font-semibold">UI Test</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Take the test directly in the browser using our interactive quiz engine.
                </p>
                <StyledButton onClick={handleStartTest} variant="primary" className="mt-6 w-full">
                  Start UI Test
                </StyledButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- "CONFIRMATION" MODAL (MODIFIED) --- */}
      {/* We no longer pass the broken onConfirm props. 
          The modal will get its own logic in the next file. */}
      {showConfirmModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
}