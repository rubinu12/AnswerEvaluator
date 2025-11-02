// components/quiz/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/lib/quizStore'; // Our Zustand Store
import { useAuthContext } from '@/lib/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import { useRouter } from 'next/navigation';
// --- 1. IMPORT LUCIDE ICONS ---
import { LogOut, User, Settings } from 'lucide-react';

const Header = () => {
  const router = useRouter();

  const {
    isTestMode,
    showReport,
    quizTitle,
    quizGroupBy,
    isTopBarVisible, // This state is from your store and is now being set correctly
    setIsTopBarVisible,
    startTest,
    resetTest,
    showDetailedSolution,
    // saveTestResult, // We will implement this action later
  } = useQuizStore();

  const { user, userProfile, logout } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getButton = () => {
    if (showDetailedSolution) {
      return (
        <>
          <button
            // onClick={saveTestResult}
            onClick={() => alert('Save Result action not implemented yet.')}
            className="btn px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700"
          >
            Save for Later
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 flex items-center"
          >
            {/* --- 2. REPLACED ICON --- */}
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </button>
        </>
      );
    }
    if (showReport) {
      return (
        <button
          onClick={() => {
            resetTest();
            router.push('/dashboard');
          }}
          className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      );
    }
    if (isTestMode) return null;
    return (
      <button
        onClick={startTest}
        className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm"
      >
        Start Test
      </button>
    );
  };

  const userName = userProfile?.name || user?.displayName || 'User';
  const userEmail = user?.email || 'No Email';
  const userRole = userProfile?.subscriptionStatus || 'Member';

  return (
    <>
      {/* --- *** THIS IS THE "PIXEL-PERFECT" FIX *** ---
        1. Set a fixed height (h-16 or 64px).
        2. Set `sticky top-0 z-30` to make it stick.
        3. Use `transform` and `transition-transform` for smooth animation.
        4. Use `isTopBarVisible` to toggle `translate-y-0` (visible) and `-translate-y-full` (hidden).
        5. This replaces the old `h-0 opacity-0 -mb-[69px]` logic.
      */}
      <header
        className={`sticky top-0 z-30 flex-shrink-0 bg-white border-b border-gray-200 h-16
          transition-transform duration-300 ease-in-out
          ${isTopBarVisible && !isTestMode ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="p-4 flex items-center justify-between mx-auto h-full px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" title="Go to Dashboard">
              {/* This is a placeholder icon, you can change it */}
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25278C12 6.25278 15.5228 3 20 3C23.7279 3 24 8.27208 24 10C24 16 12 21 12 21C12 21 0 16 0 10C0 8.27208 0.272124 3 4 3C8.47715 3 12 6.25278 12 6.25278Z" />
              </svg>
            </Link>
            <div>
              <h1 className="text-md font-bold text-gray-800">{quizTitle}</h1>
              <p className="text-xs text-gray-500 capitalize">
                {quizGroupBy === 'topic' // Match logic from your store
                  ? 'Subject Practice'
                  : 'PYQ Practice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">{getButton()}</div>
            {getButton() && <div className="h-6 w-px bg-gray-300"></div>}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 btn"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm text-gray-800">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userRole}
                  </p>
                </div>
                <img
                  src={userProfile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userName
                  )}&background=e8e8e8&color=333`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                    <p className="font-bold text-sm truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  {/* --- 3. REPLACED ICONS --- */}
                  <Link
                    href="/dashboard" // Changed to /dashboard
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* This toggle button is no longer needed, it was part of the old logic */}
      {/* <button onClick={() => setIsTopBarVisible(!isTopBarVisible)} ... /> */}

      {isModalOpen && (
        <ConfirmationModal
          onClose={() => setIsModalOpen(false)}
          onConfirmErase={() => {
            resetTest();
            router.push('/dashboard');
          }}
          onConfirmSave={() => alert('Save Result action not implemented yet.')}
        />
      )}
    </>
  );
};

export default Header;

