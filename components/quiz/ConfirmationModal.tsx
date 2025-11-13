// components/quiz/ConfirmationModal.tsx
'use client';

import React, { useState } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import { useAuthContext } from '@/lib/AuthContext'; // <-- 1. Import Auth
import { db } from '@/lib/firebase'; // <-- 2. Import Firestore DB
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'; // <-- 3. Import Firestore functions
import { useRouter } from 'next/navigation'; // <-- 4. Import Router

// 5. Update props: It only needs onClose
interface ConfirmationModalProps {
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose }) => {
    const router = useRouter();
    const { user } = useAuthContext(); // Get the logged-in user
    const [isLoading, setIsLoading] = useState(false);

    const { 
        questions, 
        userAnswers, 
        bookmarkedQuestions, 
        performanceStats, 
        quizTitle,
        clearQuizSession // <-- Get the wipe function
    } = useQuizStore();

    // (This local calculation logic is fine)
    const { 
      correctCount = 0, 
      incorrectCount = 0, 
      unattemptedCount = questions.length 
    } = performanceStats || {}; 
    
    const getBookmarkedInUnattemptedOrIncorrect = () => {
        let count = 0;
        questions.forEach(q => {
            if (bookmarkedQuestions.has(q.id)) {
                const userAnswer = userAnswers.find(ua => ua.questionId === q.id);
                if (!userAnswer || userAnswer.answer !== q.correctAnswer) {
                    count++;
                }
            }
        });
        return count;
    };
    const bookmarkedCount = getBookmarkedInUnattemptedOrIncorrect();

    // --- 💎 --- NEW FIRESTORE LOGIC --- 💎 ---

    // 1. "Review Later"
    const handleSaveReview = async () => {
        if (!user) {
            alert("You must be logged in to save a review.");
            return;
        }
        setIsLoading(true);

        try {
            const reviewData = {
                userId: user.uid,
                quizTitle,
                performanceStats,
                userAnswers,
                questions: questions.map(q => q.id), // Just save IDs to link back
                bookmarkedQuestions: Array.from(bookmarkedQuestions),
                createdAt: serverTimestamp(),
            };
            // Create a new document in a 'user_reviews' collection
            const reviewRef = doc(collection(db, 'users', user.uid, 'user_reviews'));
            await setDoc(reviewRef, reviewData);
            
            // Wipe state and navigate
            clearQuizSession();
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving review:", error);
            alert("Could not save review. Please try again.");
            setIsLoading(false);
        }
    };

    // 2. "Save Bookmarks"
    const handleSaveBookmarks = async () => {
        if (!user) {
            alert("You must be logged in to save bookmarks.");
            return;
        }
        setIsLoading(true);

         try {
            const bookmarkData = {
                userId: user.uid,
                quizTitle,
                bookmarkedQuestions: Array.from(bookmarkedQuestions),
                createdAt: serverTimestamp(),
            };
            const bookmarkRef = doc(collection(db, 'users', user.uid, 'user_bookmarks'));
            await setDoc(bookmarkRef, bookmarkData);

            // Wipe state and navigate
            clearQuizSession();
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving bookmarks:", error);
            alert("Could not save bookmarks. Please try again.");
            setIsLoading(false);
        }
    };

    // 3. "Erase and Exit"
    const handleErase = () => {
        // This just wipes state and navigates
        clearQuizSession();
        router.push('/dashboard');
    };
    
    // --- 💎 --- END OF NEW LOGIC --- 💎 ---

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Leave Review?</h2>
                <p className="text-gray-600 mb-6 text-center">
                    How would you like to save this session before returning to the dashboard?
                </p>

                {/* (The stats display is unchanged) */}
                <div className="grid grid-cols-2 gap-4 text-left mb-8 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <p className="font-semibold text-gray-800">Test Stats:</p>
                        <ul className="list-disc list-inside text-gray-600 mt-2">
                            <li><span className="font-medium">{correctCount}</span> Correct</li>
                            <li><span className="font-medium">{incorrectCount}</span> Incorrect</li>
                            <li><span className="font-medium">{unattemptedCount}</span> Unattempted</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Review Stats:</p>
                         <ul className="list-disc list-inside text-gray-600 mt-2">
                            <li><span className="font-medium">{bookmarkedCount}</span> Bookmarked</li>
                            <li className="text-xs text-gray-500">(Incorrect or Unattempted)</li>
                        </ul>
                    </div>
                </div>

                {/* --- 💎 --- NEW BUTTONS --- 💎 --- */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleSaveReview}
                        disabled={isLoading}
                        className="btn w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? "Saving..." : "Save Review & Exit"}
                    </button>
                    <button
                        onClick={handleSaveBookmarks}
                        disabled={isLoading}
                        className="btn w-full py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 disabled:bg-gray-400"
                    >
                        {isLoading ? "Saving..." : "Save Bookmarks & Exit"}
                    </button>
                    <button
                        onClick={handleErase}
                        disabled={isLoading}
                        className="btn w-full py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
                    >
                        Exit Without Saving
                    </button>
                </div>
                <button 
                    onClick={onClose} 
                    disabled={isLoading}
                    className="mt-4 text-sm text-gray-500 hover:underline w-full"
                >
                    Cancel
                </button>
                {/* --- 💎 --- END OF NEW BUTTONS --- 💎 --- */}
            </div>
        </div>
    );
};

export default ConfirmationModal;