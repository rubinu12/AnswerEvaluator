// app/components/result/MainContent.tsx
'use client';

import OverallFeedback from './OverallFeedback';
import QuestionCard from './QuestionCard';

interface MainContentProps {
  overallFeedback: any; // Replace 'any' with a specific type later
  questionAnalyses: Array<any>; // Replace 'any' with a specific type later
}

export default function MainContent({ overallFeedback, questionAnalyses }: MainContentProps) {
  return (
    <div className="lg:col-span-3 space-y-8">
      <OverallFeedback feedback={overallFeedback} />
      
      {questionAnalyses.map((q) => (
        <QuestionCard key={q.questionNumber} questionData={q} />
      ))}
    </div>
  );
}