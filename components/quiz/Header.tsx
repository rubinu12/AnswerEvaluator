// components/quiz/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/lib/quizStore'; // Our Zustand Store
import { useAuthContext } from '@/lib/AuthContext'; // <-- 1. CORRECTED: Use useAuthContext
import ConfirmationModal from './ConfirmationModal';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  const {
    isTestMode,
    showReport,
    quizTitle,
    quizGroupBy,
    isTopBarVisible,
    setIsTopBarVisible,
    startTest,
    resetTest,
    showDetailedSolution,
    // saveTestResult, // We will implement this action later
  } = useQuizStore();

  const { user, logout } = useAuthContext(); // <-- 2. CORRECTED: Use useAuthContext
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
            <i className="ri-home-4-line mr-2"></i>
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

  // 3. CORRECTED: Use 'displayName' instead of 'name'
  const userName = user?.displayName || 'User';

  return (
    <>
      <header
        className={`relative z-30 flex-shrink-0 bg-white border-b border-gray-200 transition-all duration-300 ${
          !isTopBarVisible || isTestMode ? 'h-0 opacity-0 -mb-[69px]' : 'h-[69px] opacity-100'
        }`}
      >
        <div className="p-4 flex items-center justify-between mx-auto h-full px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" title="Go to Dashboard">
              <i className="ri-home-4-line text-xl text-gray-600"></i>
            </Link>
            <div>
              <h1 className="text-md font-bold text-gray-800">{quizTitle}</h1>
              <p className="text-xs text-gray-500 capitalize">
                {quizGroupBy === 'examYear'
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
                  {/* 4. CORRECTED: Hardcode 'Member' for now, as 'role' does not exist */}
                  <p className="text-xs text-gray-500 capitalize">
                    Member
                  </p>
                </div>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
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
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dark Mode
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* The show/hide toggle button */}
      {!isTestMode && (
         <button
          onClick={() => setIsTopBarVisible(!isTopBarVisible)}
          className="fixed top-3.5 right-6 z-[60] text-gray-500 hover:text-gray-800 flex-shrink-0 bg-white rounded-full p-1 border shadow-sm"
          title={isTopBarVisible ? "Hide header" : "Show header"}
        >
          <i
            className={`ri-arrow-up-s-line text-2xl transition-transform duration-300 ${
              !isTopBarVisible ? "rotate-180" : ""
            }`}
          ></i>
        </button>
      )}

      {isModalOpen && (
        <ConfirmationModal
          onClose={() => setIsModalOpen(false)}
          onConfirmErase={() => {
            resetTest();
            router.push('/dashboard');
          }}
          // onConfirmSave={saveTestResult}
          onConfirmSave={() => alert('Save Result action not implemented yet.')}
        />
      )}
    </>
  );
};

export default Header;