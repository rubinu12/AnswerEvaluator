// components/result/AnnotatedAnswer.tsx
'use client';

import React, { useMemo } from 'react';

// Define the types for the Red and Green Pen feedback
interface RedPenFeedback {
    originalText: string;
    comment: string;
}

interface GreenPenFeedback {
    locationInAnswer: string;
    suggestion: string;
}

interface MentorsPenData {
    redPen: RedPenFeedback[];
    greenPen: GreenPenFeedback[];
}

interface AnnotatedAnswerProps {
    userAnswer: string;
    mentorsPen: MentorsPenData;
}

// A reusable Tooltip component for hover feedback
const Tooltip = ({ text, color }: { text: string, color: 'red' | 'green' }) => {
    const bgColor = color === 'red' ? 'bg-red-600' : 'bg-emerald-600';
    return (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white ${bgColor} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none`}>
            {text}
        </div>
    );
};

export default function AnnotatedAnswer({ userAnswer, mentorsPen }: AnnotatedAnswerProps) {

    // useMemo ensures this complex parsing logic only runs when the input changes
    const annotatedNodes = useMemo(() => {
        // A helper function to escape special characters for use in a RegExp
        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        // 1. Combine all feedback items into a single list with types
        const allFeedback = [
            ...(mentorsPen?.redPen?.map(item => ({ ...item, type: 'red', text: item.originalText })) || []),
            ...(mentorsPen?.greenPen?.map(item => ({ ...item, type: 'green', text: item.locationInAnswer })) || [])
        ];

        if (allFeedback.length === 0) {
            return userAnswer.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>);
        }

        // 2. Create a single, powerful regular expression to find all feedback terms
        const regex = new RegExp(
            allFeedback.map(item => `(${escapeRegExp(item.text)})`).join('|'),
            'g'
        );

        // 3. Split the original answer string by all the feedback terms
        const parts = userAnswer.split(regex).filter(part => part);

        // 4. Map over the parts and create either plain text or a styled component
        return parts.map((part, index) => {
            const feedbackItem = allFeedback.find(item => item.text === part);

            if (feedbackItem) {
                if (feedbackItem.type === 'red') {
                    return (
                        <span key={index} className="relative group cursor-pointer bg-red-100 text-red-800 underline decoration-red-500 decoration-wavy">
                            {part}
                            <Tooltip text={(feedbackItem as RedPenFeedback).comment} color="red" />
                        </span>
                    );
                }
                if (feedbackItem.type === 'green') {
                    return (
                        <span key={index} className="relative group cursor-pointer bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-md">
                            {part}
                            <span className="font-bold text-emerald-600">{(feedbackItem as GreenPenFeedback).suggestion}</span>
                            <Tooltip text="Value Addition Suggestion" color="green" />
                        </span>
                    );
                }
            }

            // For plain text, we need to handle newlines correctly
            return part.split('\n').map((line, i, arr) => (
                <React.Fragment key={`${index}-${i}`}>
                    {line}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            ));
        });
    }, [userAnswer, mentorsPen]);

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Your Answer with Mentor's Feedback</h4>
            <div className="text-base text-gray-700 leading-relaxed">
                {annotatedNodes}
            </div>
            <div className="mt-4 text-xs text-gray-500">
                <p><span className="inline-block w-3 h-3 bg-red-100 rounded-sm mr-2 align-middle"></span> Hover over wavy red text for corrections.</p>
                <p className="mt-1"><span className="inline-block w-3 h-3 bg-emerald-100 rounded-sm mr-2 align-middle"></span> Green text shows suggested value additions.</p>
            </div>
        </div>
    );
}