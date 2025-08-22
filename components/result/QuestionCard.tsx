// components/result/QuestionCard.tsx
'use client';
import { useState } from 'react';
import { QuestionAnalysis } from '@/lib/types';

export default function QuestionCard({ questionData: q, subject }: { questionData: QuestionAnalysis, subject: string }) {
    const [activeTab, setActiveTab] = useState('detailed-breakdown');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'your-answer':
                return <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 font-['Comic_Sans_MS'] text-lg">{q.userAnswer}</p>;
            case 'constructed-answer':
                return (
                    <div className="space-y-3 text-base leading-relaxed">
                        {q.constructedAnswer.map((segment, index) => (
                            <span key={index} className={segment.type === 'user' ? "font-['Comic_Sans_MS'] text-lg text-slate-700" : "font-semibold text-green-700"}>
                                {segment.text.replace(/\n/g, '\n')}
                            </span>
                        ))}
                    </div>
                );
            case 'value-addition':
                 return (
                    <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                        <h4 className="font-serif text-lg font-bold text-blue-900">Value Addition</h4>
                        <ul className="mt-2 ml-4 list-['✓_'] space-y-1 pl-2 text-sm text-slate-700">
                            {q.valueAddition.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                    </div>
                );
            case 'detailed-breakdown':
            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-serif text-lg font-bold text-slate-800">Score Deduction Analysis</h4>
                            <div className="mt-2 space-y-3">
                                {q.scoreDeductionAnalysis.map((d, i) => (
                                    <div className="flex items-start gap-4" key={i}>
                                        <div className="text-2xl font-bold text-[--primary-accent]">{d.points}</div>
                                        <div><strong className="text-slate-700">{d.reason}</strong></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                            <h4 className="font-serif text-lg font-bold text-blue-900">Strategic Notes</h4>
                            <ul className="mt-2 ml-4 list-['✓_'] space-y-1 pl-2 text-sm text-slate-700">
                                {q.strategicNotes.map((n, i) => <li key={i}>{n}</li>)}
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    const TabButton = ({ id, label }: { id: string; label: string }) => (
        <button 
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${activeTab === id ? 'border-[--primary-accent] text-[--primary-accent]' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            onClick={() => setActiveTab(id)}
        >
            {label}
        </button>
    );

    return (
        <details id={`question-${q.questionNumber}`} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" open>
            <summary className="flex cursor-pointer list-none items-start justify-between p-6">
                <div className="flex-1">
                    <p className="text-sm font-semibold uppercase text-[--primary-accent]">
                        {subject === 'Essay' ? `Essay ${q.questionNumber}` : `Question ${q.questionNumber}`}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">{q.questionText}</h3>
                </div>
                <div className="ml-6 flex items-center space-x-2">
                    <div className="text-center font-serif">
                        <span className="text-4xl font-bold text-[--primary-accent]">{q.score.toFixed(1)}</span>
                        <span className="text-slate-500"> / {q.maxMarks}</span>
                    </div>
                    <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-gray-100 hover:text-[--primary-accent]" title="Bookmark">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                </div>
            </summary>
            <div className="border-t border-gray-200 px-6 pb-6">
                <div className="mb-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4">
                        <TabButton id="detailed-breakdown" label="Detailed Breakdown" />
                        <TabButton id="value-addition" label="Value Addition" />
                        <TabButton id="your-answer" label="Your Answer" />
                        <TabButton id="constructed-answer" label="Constructed Answer" />
                    </nav>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </details>
    );
}