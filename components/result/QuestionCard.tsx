// components/result/QuestionCard.tsx
'use client';

import { QuestionAnalysis } from '@/lib/types';
import { Bookmark, ChevronDown, Download, Loader } from 'lucide-react';
import { useState } from 'react';
import DemandFulfillment from './DemandFulfillment';
import StrategicDebriefComponent from './StrategicDebrief';

export default function QuestionCard({ questionData: q }: { questionData: QuestionAnalysis }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("Download initiated for question " + q.questionNumber);
    };

    return (
        <details id={`question-${q.questionNumber}`} className="group rounded-xl border border-white/30 bg-white/60 backdrop-blur-lg shadow-lg" open>
            <summary className="cursor-pointer list-none flex items-start justify-between p-6">
                <div className="flex-1">
                    <p className="text-sm font-semibold uppercase text-blue-800 tracking-wider">
                        {q.subject} - Question {q.questionNumber}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">{q.questionText}</h3>
                </div>
                <div className="ml-6 flex items-center gap-4">
                     <div className="text-center font-serif">
                        <span className="text-5xl font-bold text-blue-800">{q.score.toFixed(1)}</span>
                        <span className="text-slate-600"> / {q.maxMarks}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200/80 pl-4">
                         <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-blue-800" title="Bookmark" onClick={(e) => e.stopPropagation()}>
                            <Bookmark className="h-5 w-5" />
                        </button>
                        <button onClick={handleDownload} className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-blue-800" title="Download Assessment" disabled={isDownloading}>
                            {isDownloading ? <Loader size={18} className="animate-spin" /> : <Download className="h-5 w-5" />}
                        </button>
                    </div>
                    <ChevronDown className="h-6 w-6 text-slate-500 transition-transform duration-300 group-open:rotate-180" />
                </div>
            </summary>
            
            <div className="border-t border-slate-200/80 px-6 pb-6 pt-4 space-y-6">
                <DemandFulfillment deconstruction={q.questionDeconstruction} />
                
                <StrategicDebriefComponent 
                    debrief={q.strategicDebrief} 
                    idealAnswer={q.idealAnswer}
                    userAnswer={q.userAnswer}
                    mentorsPen={q.mentorsPen}
                />
            </div>
        </details>
    );
}