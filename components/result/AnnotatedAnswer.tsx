// components/result/AnnotatedAnswer.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

// A simple tooltip component for displaying feedback on hover
const Tooltip = ({ text, color }: { text: string, color: 'red' | 'green' }) => {
    const bgColor = color === 'red' ? 'bg-red-600' : 'bg-emerald-600';
    return (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white ${bgColor} rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
            {text}
        </div>
    );
};


export default function AnnotatedAnswer({ userAnswer, mentorsPen }: AnnotatedAnswerProps) {
    // A function to build the annotated answer
    const buildAnnotatedHtml = () => {
        let annotatedAnswer = ` ${userAnswer} `; // Add padding for safer replacement

        // Apply Green Pen suggestions first
        if (mentorsPen?.greenPen) {
            mentorsPen.greenPen.forEach(item => {
                const suggestionHtml = `<span class="relative group cursor-pointer bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-md">${item.locationInAnswer}<span class="font-bold text-emerald-600">${item.suggestion}</span><div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-emerald-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">Value Addition: This is a great place to add more detail.</div></span>`;
                annotatedAnswer = annotatedAnswer.replace(item.locationInAnswer, suggestionHtml);
            });
        }
        
        // Apply Red Pen corrections
        if (mentorsPen?.redPen) {
            mentorsPen.redPen.forEach(item => {
                const correctionHtml = `<span class="relative group cursor-pointer bg-red-100 text-red-800 underline decoration-red-500 decoration-wavy">${item.originalText}<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-red-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">${item.comment}</div></span>`;
                // Use a regex to avoid replacing already highlighted text
                const regex = new RegExp(`(?<!>)${item.originalText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(?!<)`, "g");
                annotatedAnswer = annotatedAnswer.replace(regex, correctionHtml);
            });
        }
        
        return { __html: annotatedAnswer.replace(/\n/g, '<br />') };
    };

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Your Answer with Mentor's Feedback</h4>
            <div
                className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={buildAnnotatedHtml()}
            />
             <div className="mt-4 text-xs text-gray-500">
                <p><span className="inline-block w-3 h-3 bg-red-100 rounded-sm mr-2"></span>Hover over wavy red text for corrections.</p>
                <p className="mt-1"><span className="inline-block w-3 h-3 bg-emerald-100 rounded-sm mr-2"></span>Green text shows suggested value additions.</p>
            </div>
        </div>
    );
}