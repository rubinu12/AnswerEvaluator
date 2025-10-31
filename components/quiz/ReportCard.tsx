// components/quiz/ReportCard.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useQuizStore } from "@/lib/quizStore"; // 1. Use our Zustand Store
import { useRouter } from "next/navigation"; // 2. Import router

const ReportCard = () => {
  const router = useRouter(); // 3. Get router for navigation
  
  // 4. Get all state and actions from the "Brain"
  const {
    questions,
    userAnswers,
    resetTest,
    handleDetailedSolution,
    totalTime,
    timeLeft,
  } = useQuizStore();

  // 5. This is the core logic: Calculate results
  const results = useMemo(() => {
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach((question) => {
      const userAnswer = userAnswers.find(
        (ua) => ua.questionId === question.id
      );
      if (userAnswer) {
        if (userAnswer.answer === question.correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    });

    const totalCount = questions.length;
    const unattemptedCount = totalCount - (correctCount + incorrectCount);

    // UPSC Scoring Logic
    const marksForCorrect = correctCount * 2;
    const marksDeducted = incorrectCount * (2 / 3);
    const finalScore = marksForCorrect - marksDeducted;
    const maxScore = totalCount * 2;

    // Percentage for the progress bar (score relative to max possible score)
    const scorePercentage =
      maxScore > 0 ? Math.max(0, Math.round((finalScore / maxScore) * 100)) : 0;

    return {
      correctCount,
      incorrectCount,
      unattemptedCount,
      finalScore,
      maxScore,
      scorePercentage,
    };
  }, [questions, userAnswers]);

  // 6. This is the "polish" feature:
  // When the report card mounts, calculate and set the performance stats
  // in the "Brain". This is what feeds the PerformanceAnalyticsBar.
  useEffect(() => {
    const { correctCount, incorrectCount, unattemptedCount, finalScore, maxScore } = results;
    
    const attemptedCount = correctCount + incorrectCount;
    if (attemptedCount === 0) {
      useQuizStore.setState({
        performanceStats: {
          finalScore: 0, accuracy: 0, avgTimePerQuestion: 0, pacing: 'On Pace',
          correctCount: 0, incorrectCount: 0, unattemptedCount: questions.length, maxScore
        }
      });
      return;
    }

    const accuracy = Math.round((correctCount / attemptedCount) * 100);
    const timeTaken = totalTime - timeLeft;
    const avgTimePerQuestion = timeTaken / attemptedCount;
    
    // Determine pacing (e.g., 1.2 minutes or 72 seconds per question)
    let pacing: 'Ahead' | 'On Pace' | 'Behind' = 'On Pace';
    const idealTimePerQuestion = 72;
    if (avgTimePerQuestion > idealTimePerQuestion + 10) {
      pacing = 'Behind';
    } else if (avgTimePerQuestion < idealTimePerQuestion - 10) {
      pacing = 'Ahead';
    }

    // 7. Set the stats in the Zustand store
    useQuizStore.setState({
      performanceStats: {
        finalScore,
        accuracy,
        avgTimePerQuestion,
        pacing,
        correctCount,
        incorrectCount,
        unattemptedCount,
        maxScore,
      }
    });
  }, [results, questions.length, totalTime, timeLeft]);

  // 8. Determine color for the score
  let scoreColorClass = "text-green-600";
  if (results.scorePercentage < 75) scoreColorClass = "text-yellow-600";
  if (results.scorePercentage < 40) scoreColorClass = "text-red-600";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Report</h2>
        <p className="text-gray-500 mb-6">
          Here is your score based on the official marking scheme.
        </p>

        {/* Circular Progress Bar */}
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
              stroke={scoreColorClass.replace("text-", "stroke-")}
              strokeWidth="3"
              strokeDasharray={`${results.scorePercentage}, 100`}
              strokeLinecap="round"
              className="transform-gpu origin-center -rotate-90 transition-all duration-1000 ease-out"
            ></path>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColorClass}`}>
              {results.finalScore.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              Score out of {results.maxScore}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-left mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Correct</p>
            <p className="text-2xl font-bold text-green-600">
              {results.correctCount}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">Incorrect</p>
            <p className="text-2xl font-bold text-red-600">
              {results.incorrectCount}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Unattempted</p>
            <p className="text-2xl font-bold text-gray-700">
              {results.unattemptedCount}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleDetailedSolution}
            className="btn w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Review Answers
          </button>
          <button
            onClick={() => {
              resetTest();
              router.push('/dashboard'); // Go to dashboard after
            }}
            className="btn w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;