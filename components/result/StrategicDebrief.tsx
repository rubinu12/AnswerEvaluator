'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Key, GitBranch, BookOpen, MessageSquare, Target, AlertTriangle, XCircle, Search } from 'lucide-react';
// Make sure BluePenFeedback is imported from your types
import type { StrategicDebrief as StrategicDebriefType, MentorsPenData, RedPenFeedback, GreenPenFeedback, BluePenFeedback } from '@/lib/types';

// This is the combined props interface
interface StrategicDebriefProps {
    debrief: StrategicDebriefType;
    idealAnswer: string;
    userAnswer: string;
    mentorsPen: MentorsPenData;
}

// Tab structure remains the same
const tabs = [
    { id: 'annotated', label: "Mentor's Pen", icon: MessageSquare, gradient: 'linear-gradient(to right, #facc15, #eab308)' },
    { id: 'structure', label: 'Model Structure', icon: GitBranch, gradient: 'linear-gradient(to right, #60a5fa, #3b82f6)' },
    { id: 'gaps', label: 'Content Gaps', icon: Target, gradient: 'linear-gradient(to right, #f87171, #dc2626)' },
    { id: 'keywords', label: "Topper's Keywords", icon: Key, gradient: 'linear-gradient(to right, #34d399, #10b981)' },
    { id: 'ideal', label: 'Ideal Answer', icon: BookOpen, gradient: 'linear-gradient(to right, #c084fc, #a855f7)' },
];

// --- The Corrected and Enhanced Parser ---
const AnnotatedAnswerContent = ({ userAnswer, mentorsPen }: { userAnswer: string; mentorsPen: MentorsPenData; }) => {
    
    // The Tooltip now supports a 'blue' color
    const Tooltip = ({ text, color }: { text: string, color: 'red' | 'green' | 'blue' }) => {
        const colorClasses = {
            red: 'bg-red-600',
            green: 'bg-emerald-600',
            blue: 'bg-sky-600',
        };
        return (
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white ${colorClasses[color]} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none`}>
                {text}
            </div>
        );
    };

    const annotatedNodes = useMemo(() => {
        const escapeRegExp = (string: string) => {
            if (!string) return '';
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        // 1. [FIX] Combine all feedback types, including the new 'bluePen'
        const allFeedback = [
            ...(mentorsPen?.redPen?.map(item => ({ ...item, type: 'red', text: item.originalText })) || []),
            ...(mentorsPen?.greenPen?.map(item => ({ ...item, type: 'green', text: item.locationInAnswer })) || []),
            ...(mentorsPen?.bluePen?.map(item => ({ ...item, type: 'blue', text: item.appreciatedText })) || [])
        ].filter(item => item.text && item.text.trim() !== ''); // Ensure items have valid text

        if (allFeedback.length === 0) {
            return userAnswer.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>);
        }

        const regex = new RegExp(
            allFeedback.map(item => `(${escapeRegExp(item.text)})`).join('|'),
            'g'
        );

        const parts = userAnswer.split(regex).filter(part => part);

        return parts.map((part, index) => {
            const feedbackItem = allFeedback.find(item => item.text === part);

            if (feedbackItem) {
                // Red Pen (Correction)
                if (feedbackItem.type === 'red') {
                    return (
                        <span key={index} className="relative group cursor-pointer bg-red-100 text-red-800 underline decoration-red-500 decoration-wavy">
                            {part}
                            <Tooltip text={(feedbackItem as RedPenFeedback).comment} color="red" />
                        </span>
                    );
                }
                // 2. [FIX] Green Pen (Suggestion) - now correctly uses a tooltip
                if (feedbackItem.type === 'green') {
                    return (
                        <span key={index} className="relative group cursor-pointer bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-md">
                            {part}
                            <Tooltip text={(feedbackItem as GreenPenFeedback).suggestion} color="green" />
                        </span>
                    );
                }
                // 3. [NEW] Blue Pen (Appreciation)
                if (feedbackItem.type === 'blue') {
                    return (
                        <span key={index} className="relative group cursor-pointer bg-sky-100 text-sky-800 font-semibold ring-1 ring-sky-300 rounded p-0.5">
                            {part}
                            <Tooltip text={(feedbackItem as BluePenFeedback).comment} color="blue" />
                        </span>
                    );
                }
            }
            
            return part.split('\n').map((line, i, arr) => (
                <React.Fragment key={`${index}-${i}`}>
                    {line}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            ));
        });
    }, [userAnswer, mentorsPen]);

    return (
        <div>
            <div className="text-base text-slate-800 leading-relaxed">
                {annotatedNodes}
            </div>
            {/* 4. [NEW] Updated legend to include the Blue Pen */}
            <div className="mt-6 text-xs text-gray-500 space-y-1">
                <p><span className="inline-block w-3 h-3 bg-red-100/70 rounded-sm mr-2 align-middle"></span>Hover over <span className="underline decoration-red-500 decoration-wavy">wavy red text</span> for corrections.</p>
                <p><span className="inline-block w-3 h-3 bg-emerald-100/70 rounded-sm mr-2 align-middle"></span>Hover over <span className="bg-emerald-100/70 font-semibold rounded p-0.5">green text</span> for value-add suggestions.</p>
                <p><span className="inline-block w-3 h-3 bg-sky-100/70 rounded-sm mr-2 align-middle"></span>Hover over <span className="bg-sky-100/70 font-semibold ring-1 ring-sky-300 rounded p-0.5">blue text</span> for appreciated points & linkages.</p>
            </div>
        </div>
    );
};


// The main StrategicDebriefComponent remains the same, but is included in full
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
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                            <h3 className="text-lg font-semibold font-serif text-amber-900">
                                Identified Content Gaps
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {debrief.contentGaps.map((gap, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white border-l-4 border-amber-400 rounded-r-md shadow-sm">
                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-700">{gap}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'keywords':
                return (
                    <div className="rounded-lg bg-sky-50 border border-sky-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Key className="h-6 w-6 text-sky-500" />
                            <h3 className="text-lg font-semibold font-serif text-sky-900">
                                Topper's Keywords
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            These are high-impact keywords and phrases. Click on any keyword to learn more about it.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {debrief.toppersKeywords.map((keyword, i) => (
                                <a
                                    key={i}
                                    href={`https://www.google.com/search?q=${encodeURIComponent(`give brief info about ${keyword}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 px-3 py-1.5 bg-white text-sky-800 text-sm font-semibold rounded-full border border-sky-200 hover:bg-sky-100 hover:border-sky-300 transition-all duration-200 shadow-sm"
                                >
                                    {keyword}
                                    <Search className="h-3.5 w-3.5 text-sky-400 group-hover:text-sky-600 transition-colors" />
                                </a>
                            ))}
                        </div>
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
            <div className="p-1 flex items-center bg-slate-200/60 rounded-t-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
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