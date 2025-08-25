// components/result/QuestionCard.tsx
'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QuestionAnalysis } from '@/lib/types';
import { Bookmark, FileText, MessageSquare, Lightbulb, Target, BookOpen, MinusCircle, ChevronDown, Download, Loader } from 'lucide-react';
import React from 'react';
import { downloadPdf } from '@/lib/pdfGenerator';

export default function QuestionCard({ questionData: q, subject }: { questionData: QuestionAnalysis, subject: string }) {
    const [activeTab, setActiveTab] = useState('detailed-breakdown');
    const [isDownloading, setIsDownloading] = useState(false);

    // Create a ref for the card element
    const cardRef = useRef<HTMLDetailsElement>(null);

    const tabs = [
        { id: 'detailed-breakdown', label: 'Breakdown', icon: FileText, gradient: 'linear-gradient(to right, #60a5fa, #3b82f6)' },
        { id: 'value-addition', label: 'Value+', icon: Lightbulb, gradient: 'linear-gradient(to right, #34d399, #10b981)' },
        { id: 'your-answer', label: 'Your Answer', icon: MessageSquare, gradient: 'linear-gradient(to right, #facc15, #eab308)' },
        { id: 'constructed-answer', label: 'Ideal Answer', icon: BookOpen, gradient: 'linear-gradient(to right, #c084fc, #a855f7)' }
    ];

    const TabButton = ({ id, label, icon: Icon, gradient }: { id: string; label: string; icon: React.ElementType, gradient: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 z-10 ${
                activeTab === id ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            style={{ flex: 1 }}
        >
            {activeTab === id && (
                <motion.div
                    layoutId={`active-tab-pill-q${q.questionNumber}`}
                    className="absolute inset-0 rounded-lg shadow-md"
                    style={{ backgroundImage: gradient }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} />
                {label}
            </span>
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'your-answer':
                return (
                    <div className="p-4 bg-slate-100/50 rounded-b-lg rounded-r-lg border border-slate-200/80">
                         <p className="whitespace-pre-wrap font-sans text-base text-slate-700">{q.userAnswer}</p>
                    </div>
                );
            case 'constructed-answer':
                 return (
                    <div className="p-4 bg-slate-100/50 rounded-b-lg rounded-r-lg border border-slate-200/80 space-y-3 text-base leading-relaxed">
                        {q.constructedAnswer.map((segment, index) => (
                            <span key={index} className={segment.type === 'user' ? "text-slate-800" : "font-semibold text-green-700 bg-green-100/50 p-1 rounded"}>
                                {segment.text}
                            </span>
                        ))}
                    </div>
                );
            case 'value-addition':
                 return (
                    <div className="p-4 bg-blue-100/50 rounded-b-lg rounded-r-lg border border-blue-200/80">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-700 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-serif text-lg font-bold text-blue-900">Value Addition</h4>
                                <ul className="mt-2 ml-4 list-['✨'] space-y-2 pl-2 text-sm text-slate-700">
                                    {q.valueAddition.map((n, i) => <li key={i} className="pl-2">{n}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'detailed-breakdown':
            default:
                return (
                    <div className="space-y-6 p-4 bg-slate-100/50 rounded-b-lg rounded-r-lg border border-slate-200/80">
                        <div>
                            <h4 className="font-serif text-lg font-bold text-slate-800">Score Deduction Analysis</h4>
                            <div className="mt-3 space-y-3">
                                {q.scoreDeductionAnalysis.map((d, i) => (
                                    <div className="flex items-start gap-3" key={i}>
                                        <MinusCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-slate-700">{d.reason}</strong>
                                            <p className="text-sm text-red-800 font-semibold">-{d.points} Points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-green-100/50 rounded-lg border border-green-200/80">
                             <div className="flex items-start gap-3">
                                <Target className="h-5 w-5 text-green-700 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-serif text-lg font-bold text-green-900">Strategic Notes</h4>
                                    <ul className="mt-2 ml-4 list-['🎯'] space-y-2 pl-2 text-sm text-slate-700">
                                        {q.strategicNotes.map((n, i) => <li key={i} className="pl-2">{n}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the details card from toggling
        setIsDownloading(true);
        // Pass the ref's current element to the utility
        await downloadPdf(cardRef.current, `Question-${q.questionNumber}-Analysis`);
        setIsDownloading(false);
    };

    return (
        // Attach the ref to the card's details element
        <details id={`question-card-${q.questionNumber}`} ref={cardRef} className="group rounded-xl border border-white/30 bg-white/60 backdrop-blur-lg shadow-lg" open>
            <summary className="cursor-pointer list-none flex items-start justify-between p-6">
                <div className="flex-1">
                    <p className="text-sm font-semibold uppercase text-red-800 tracking-wider">
                        {subject === 'Essay' ? `Essay Analysis` : `Question ${q.questionNumber}`}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-slate-900">{q.questionText}</h3>
                </div>
                <div className="ml-6 flex items-center gap-4">
                     <div className="text-center font-serif">
                        <span className="text-5xl font-bold text-red-800">{q.score.toFixed(1)}</span>
                        <span className="text-slate-600"> / {q.maxMarks}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200/80 pl-4">
                         <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-red-800" title="Bookmark" onClick={(e) => e.stopPropagation()}>
                            <Bookmark className="h-5 w-5" />
                        </button>
                        <button onClick={handleDownload} className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-blue-800" title="Download Assessment" disabled={isDownloading}>
                            {isDownloading ? <Loader size={18} className="animate-spin" /> : <Download className="h-5 w-5" />}
                        </button>
                    </div>
                    <ChevronDown className="h-6 w-6 text-slate-500 transition-transform duration-300 group-open:rotate-180" />
                </div>
            </summary>
            <div className="border-t border-slate-200/80 px-6 pb-6 pt-4">
                 <div className="p-1 flex items-center bg-slate-200/60 rounded-xl">
                    {tabs.map(tab => (
                        <TabButton key={tab.id} {...tab} />
                    ))}
                </div>
                <div className="mt-4">
                    {renderTabContent()}
                </div>
            </div>
        </details>
    );
}