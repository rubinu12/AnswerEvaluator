// components/quiz/Header.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { useQuizStore } from '@/lib/quizStore';
import { useQuizUIStore } from '@/lib/quizUIStore';
import { useAuthContext } from '@/lib/AuthContext';
import { 
  Home, ArrowLeft, X, FileText, CheckSquare, 
  User, LogOut, LayoutDashboard, ChevronDown 
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; 

// --- 🎨 STYLED COMPONENTS ---

const IconButton = ({ onClick, children, className = '' }: { onClick?: () => void; children: React.ReactNode; className?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 ${className}`}
  >
    {children}
  </button>
);

const StyledButton = ({ onClick, children, variant = 'primary', className = '', disabled }: { onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'outline'; className?: string; disabled?: boolean }) => {
  const base = 'px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm';
  const primary = 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95';
  const outline = 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300';
  const disabledStyle = 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? disabledStyle : (variant === 'primary' ? primary : outline)} ${className}`}
    >
      {children}
    </button>
  );
};

// --- MAIN HEADER ---

export default function Header() {
  const router = useRouter(); 
  const { userProfile, logout } = useAuthContext();
  const { isTestMode, showReport, quizTitle, startTest, clearQuizSession } = useQuizStore();
  const isTopBarVisible = useQuizUIStore(s => s.isTopBarVisible);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If in Test Mode, the Header is hidden (handled by TestStatusBar)
  if (isTestMode) return null;

  // --- 🧠 FUNCTIONAL LOGIC ---

  const handleLeaveQuiz = () => {
    clearQuizSession();
    router.push('/dashboard');
  };

  const handleStartTest = () => {
    startTest(); 
    setShowStartModal(false);
  };

  const handleDashboardClick = () => {
    setShowConfirmModal(true);
  };

  const headerClasses = [
    'fixed top-0 left-0 right-0 z-40',
    'h-16 bg-white/90 backdrop-blur-md border-b border-gray-200',
    'transition-transform duration-300 ease-in-out',
    isTopBarVisible ? 'translate-y-0' : '-translate-y-full',
  ].join(' ');

  const displayTitle = showReport ? `${quizTitle} - Report Card` : (quizTitle || 'Practice Session');

  return (
    <>
      <header className={headerClasses}>
        <div className="flex h-full w-full items-center justify-between px-4 lg:px-8">
          
          {/* LEFT: Navigation & Title */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            {/* Exit Button */}
            <IconButton onClick={handleLeaveQuiz} className="shrink-0">
              <ArrowLeft className="h-5 w-5 lg:hidden" />
              <Home className="h-5 w-5 hidden lg:block" />
            </IconButton>

            {/* Logo & Divider (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
               <div className="h-6 w-px bg-gray-300"></div>
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm">R</div>
                 <span className="font-bold text-gray-800">Root&Rise</span>
               </div>
               <div className="h-6 w-px bg-gray-300"></div>
            </div>

            {/* Quiz Title */}
            <h1 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
              {displayTitle}
            </h1>
          </div>

          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            
            {/* ACTION BUTTONS */}
            {!showReport ? (
              <StyledButton onClick={() => setShowStartModal(true)} variant="primary" className="hidden sm:flex">
                Start Test
              </StyledButton>
            ) : (
              <StyledButton onClick={handleDashboardClick} variant="primary" className="hidden sm:flex">
                Dashboard
              </StyledButton>
            )}

            {/* USER MENU */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userProfile?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                  </div>

                  {/* Mobile Only Actions inside Menu */}
                  <div className="sm:hidden px-2 py-2 border-b border-gray-100">
                     {!showReport ? (
                        <button onClick={() => { setShowStartModal(true); setIsMenuOpen(false); }} className="w-full text-left px-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                           Start Test
                        </button>
                     ) : (
                        <button onClick={() => { handleDashboardClick(); setIsMenuOpen(false); }} className="w-full text-left px-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                           Go to Dashboard
                        </button>
                     )}
                  </div>
                  
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-2"></div>
                  
                  <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- START TEST MODAL --- */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl transform transition-all scale-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Mode</h2>
                <p className="text-gray-500 mt-1">Choose how you want to attempt this test.</p>
              </div>
              <IconButton onClick={() => setShowStartModal(false)}>
                <X className="h-6 w-6" />
              </IconButton>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* OMR Option */}
              <div className="group rounded-xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg">COMING SOON</div>
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">OMR Mode</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Download the sheet, fill bubbles physically, and upload a photo for AI grading.
                </p>
                <StyledButton onClick={() => {}} variant="outline" className="mt-6 w-full" disabled>
                  Unavailable
                </StyledButton>
              </div>

              {/* UI Option */}
              <div className="group rounded-xl border-2 border-blue-500 bg-blue-50/30 p-6 ring-4 ring-blue-500/10 transition-all">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Interactive Mode</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Experience the real exam interface with timer, negative marking, and instant analysis.
                </p>
                <StyledButton onClick={handleStartTest} variant="primary" className="mt-6 w-full shadow-lg shadow-blue-500/20">
                  Start Now
                </StyledButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <ConfirmationModal onClose={() => setShowConfirmModal(false)} />
      )}
    </>
  );
}