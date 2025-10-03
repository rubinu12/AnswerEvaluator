// components/result/StrategicDebrief.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, Key, GitBranch, BookOpen, MessageSquare, Target, Zap, AlertTriangle, XCircle } from 'lucide-react';
import type { StrategicDebrief as StrategicDebriefType, MentorsPenData } from '@/lib/types';
import clsx from 'clsx';

// This is the new, combined props interface
interface StrategicDebriefProps {
    debrief: StrategicDebriefType;
    idealAnswer: string;
    userAnswer: string;
    mentorsPen: MentorsPenData;
}

// New tab structure with colorful gradients
const tabs = [
    { id: 'annotated', label: 'Mentor\'s Pen', icon: MessageSquare, gradient: 'linear-gradient(to right, #facc15, #eab308)' },
    { id: 'structure', label: 'Model Structure', icon: GitBranch, gradient: 'linear-gradient(to right, #60a5fa, #3b82f6)' },
    { id: 'gaps', label: 'Content Gaps', icon: Target, gradient: 'linear-gradient(to right, #f87171, #dc2626)' },
    { id: 'keywords', label: 'Topper\'s Keywords', icon: Key, gradient: 'linear-gradient(to right, #34d399, #10b981)' },
    { id: 'ideal', label: 'Ideal Answer', icon: BookOpen, gradient: 'linear-gradient(to right, #c084fc, #a855f7)' },
];

// --- ANNOTATED ANSWER LOGIC (FIXED) ---
const AnnotatedAnswerContent = ({ userAnswer, mentorsPen }: { userAnswer: string; mentorsPen: MentorsPenData; }) => {
    const buildAnnotatedHtml = () => {
        let annotatedAnswer = ` ${userAnswer} `;
        if (mentorsPen?.greenPen) {
            mentorsPen.greenPen.forEach(item => {
                const suggestionHtml = `<span class="relative group cursor-pointer bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-md">${item.locationInAnswer}<span class="font-bold text-emerald-600">${item.suggestion}</span><div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm p-3 text-xs text-white bg-slate-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none prose prose-invert prose-xs"><strong>Value Addition:</strong> ${item.suggestion.replace('[+ Add Mention: ', '').replace(']', '')}</div></span>`;
                annotatedAnswer = annotatedAnswer.replace(item.locationInAnswer, suggestionHtml);
            });
        }
        if (mentorsPen?.redPen) {
            mentorsPen.redPen.forEach(item => {
                const correctionHtml = `<span class="relative group cursor-pointer bg-red-100 text-red-800 underline decoration-red-500 decoration-wavy">${item.originalText}<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 text-xs text-white bg-slate-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">${item.comment}</div></span>`;
                const regex = new RegExp(`(?<![=">/])${item.originalText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(?![<"'/])`, "g");
                annotatedAnswer = annotatedAnswer.replace(regex, correctionHtml);
            });
        }
        return { __html: annotatedAnswer.replace(/\n/g, '<br />') };
    };

    return (
        <div>
            <div className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={buildAnnotatedHtml()} />
            <div className="mt-6 text-xs text-gray-500">
                <p><span className="inline-block w-3 h-3 bg-red-100/70 rounded-sm mr-2 align-middle"></span>Hover over <span className="underline decoration-red-500 decoration-wavy">wavy red text</span> for corrections.</p>
                <p className="mt-1"><span className="inline-block w-3 h-3 bg-emerald-100/70 rounded-sm mr-2 align-middle"></span><span className="bg-emerald-100/70 font-semibold rounded p-0.5">Green text</span> shows suggested value additions.</p>
            </div>
        </div>
    );
};


export default function StrategicDebriefComponent({ debrief, idealAnswer, userAnswer, mentorsPen }: StrategicDebriefProps) {
    const [activeTab, setActiveTab] = useState('annotated');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'annotated':
                return <AnnotatedAnswerContent userAnswer={userAnswer} mentorsPen={mentorsPen} />;
            case 'structure':
                return <div className="prose prose-sm max-w-none prose-h3:font-serif prose-strong:text-slate-800"><ReactMarkdown>{debrief.modelAnswerStructure}</ReactMarkdown></div>;
            case 'gaps':
                return (
                    <div className="space-y-3">
                        {debrief.contentGaps.map((gap, i) => (
                           <div key={i} className="flex items-start gap-4 p-4 bg-red-50/70 border-l-4 border-red-400 rounded-r-lg">
                               <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                               <p className="text-sm text-red-900">{gap}</p>
                           </div>
                        ))}
                    </div>
                );
            case 'keywords':
                return (
                    <div className="flex flex-wrap gap-2">
                        {debrief.toppersKeywords.map((keyword, i) => (
                            <span key={i} className="px-2.5 py-1 bg-sky-100 text-sky-800 text-sm font-semibold rounded-full">
                                {keyword}
                            </span>
                        ))}
                    </div>
                );
            case 'ideal':
                return <div className="prose prose-sm max-w-none prose-h3:font-serif prose-strong:text-slate-800"><ReactMarkdown>{idealAnswer}</ReactMarkdown></div>;
            default:
                return null;
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-md">
            <div className="p-1 flex items-center bg-slate-200/60 rounded-t-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === tab.id ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-debrief-pill-new"
                                className="absolute inset-0 rounded-lg shadow-md"
                                style={{ backgroundImage: tab.gradient }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <tab.icon size={16} />
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
}