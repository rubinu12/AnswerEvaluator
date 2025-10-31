"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useQuizStore } from "@/lib/quizStore";
import { useAuthContext } from "@/lib/AuthContext";
import ConfirmationModal from './ConfirmationModal';
import DynamicQuizCommandBar from './DynamicQuizCommandBar';
import TestStatusBar from "./TestStatusBar";

const Header = () => {
    const { mode, startTest, resetTest } = useQuizStore();
    const { userProfile, logout } = useAuthContext();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const getButton = () => {
        if (mode === 'review') {
            return (
                <button onClick={() => setIsModalOpen(true)} className="btn px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700">
                    Dashboard
                </button>
            );
        }
        if (mode === 'practice') {
            return (
                <button onClick={startTest} className="btn px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">
                    Start Test
                </button>
            );
        }
        return null;
    };

    if (mode === 'test') {
        return <TestStatusBar />;
    }

    // Since we return early for 'test' mode, the rest of this component only runs for 'practice' or 'review'
    return (
        <>
            <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-30 transition-transform duration-300" style={{ transform: isTopBarVisible ? 'translateY(0%)' : 'translateY(-100%)' }}>
                <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between max-w-full mx-auto px-6 h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="font-bold text-xl text-gray-800">
                                Root & Rise
                            </Link>
                            {getButton()}
                        </div>
                        <div className="flex items-center gap-4">
                            {userProfile && (
                                <div ref={dropdownRef} className="relative">
                                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
                                        <img src={userProfile.profilePicture || `https://i.pravatar.cc/150?u=${userProfile.email}`} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-gray-300" />
                                        <span className="text-sm font-medium text-gray-700 hidden md:block">{userProfile.name}</span>
                                        <i className={`ri-arrow-down-s-line text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                                            <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Sub-header restored to its correct position --- */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                     <div className="flex items-center justify-between max-w-full mx-auto px-6 h-[52px] gap-4">
                        <DynamicQuizCommandBar />
                        <button onClick={() => setIsTopBarVisible(prev => !prev)} className="text-gray-500 hover:text-gray-800 flex-shrink-0" title={isTopBarVisible ? "Hide header" : "Show header"}>
                           <i className={`ri-arrow-up-s-line text-2xl transition-transform duration-300 ${!isTopBarVisible ? 'rotate-180' : ''}`}></i>
                       </button>
                    </div>
                </div>
            </header>

            {isModalOpen && <ConfirmationModal onClose={() => setIsModalOpen(false)} onConfirmErase={resetTest} onConfirmSave={() => { /* Logic to be added */ }} />}
        </>
    );
};

export default Header;