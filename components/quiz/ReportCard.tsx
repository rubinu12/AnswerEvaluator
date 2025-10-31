"use client";

import React from "react";
import { useQuizStore } from "@/lib/quizStore"; // 1. Use the new Zustand store

const ReportCard = () => {
  // 2. Select the necessary state and actions from the store
  const { questions, userAnswers, resetTest, enterReviewMode } = useQuizStore();

  // 3. Calculation logic is now much simpler with `isCorrect`
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const incorrectCount = userAnswers.length - correctCount;
  const totalCount = questions.length;
  const unattemptedCount = totalCount - userAnswers.length;

  // UPSC Scoring Logic (preserved exactly)
  const marksForCorrect = correctCount * 2;
  const marksDeducted = incorrectCount * (2 / 3);
  const finalScore = marksForCorrect - marksDeducted;
  const maxScore = totalCount * 2;

  const scorePercentage = maxScore > 0 ? Math.max(0, Math.round((finalScore / maxScore) * 100)) : 0;

  // Updated color logic to be more compatible with Tailwind JIT
  let scoreColorClass = "text-green-600";
  let strokeColorClass = "stroke-green-600";
  if (scorePercentage < 75) {
    scoreColorClass = "text-yellow-600";
    strokeColorClass = "stroke-yellow-600";
  }
  if (scorePercentage < 40) {
    scoreColorClass = "text-red-600";
    strokeColorClass = "stroke-red-600";
  }

  return (
    // The component is no longer a modal, allowing the parent to control its presentation
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Report</h2>
        <p className="text-gray-500 mb-6">
          Here is your score based on the official marking scheme.
        </p>

        <div className={`relative w-48 h-48 mx-auto mb-6`}>
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="3"
            ></path>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor" // Use currentColor to inherit color
              strokeWidth="3"
              strokeDasharray={`${scorePercentage}, 100`}
              strokeLinecap="round"
              className={`transform-gpu origin-center -rotate-90 transition-all duration-1000 ease-out ${strokeColorClass}`}
            ></path>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColorClass}`}>
              {finalScore.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              Score out of {maxScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-left mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Correct</p>
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">Incorrect</p>
            <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Unattempted</p>
            <p className="text-2xl font-bold text-gray-700">
              {unattemptedCount}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {/* 4. Button actions are now connected to the store */}
          <button
            onClick={enterReviewMode}
            className="btn w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Review Answers
          </button>
          <button
            onClick={resetTest}
            className="btn w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
    </div>
  );
};

export default ReportCard;
