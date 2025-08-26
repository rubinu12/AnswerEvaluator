'use client';
import { OverallFeedback } from '@/lib/types';
import { ShieldCheck, Target, Feather, Bot, BrainCircuit, MessageSquareQuote, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

// A small component for the score gauge circle (no changes needed here)
const ScoreGauge = ({ score }: { score: number }) => {
    const percentage = score * 10;
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-green-600';
    if (score < 7) colorClass = 'text-yellow-500';
    if (score < 4) colorClass = 'text-red-600';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${colorClass}`}>{score.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ 10</span>
            </div>
        </div>
    );
};

// A component for each parameter's score bar (no changes needed here)
const ParameterScore = ({ icon, label, score, colorClasses, onMouseEnter, onMouseLeave }: { 
    icon: React.ElementType, 
    label: string, 
    score: number, 
    colorClasses: { bg: string, text: string },
    onMouseEnter: () => void,
    onMouseLeave: () => void
}) => (
    <div 
        className="flex flex-col items-center text-center p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.bg} bg-opacity-30`}>
            {React.createElement(icon, { className: `h-6 w-6 ${colorClasses.text}` })}
        </div>
        <div className="mt-2 text-sm font-bold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500">{score} / 10</div>
        <div className="w-full h-2 mt-2 bg-slate-200 rounded-full">
            <div className={`h-2 rounded-full ${colorClasses.bg}`} style={{ width: `${score * 10}%` }}></div>
        </div>
    </div>
);

// This object maps parameter names from the AI to the icons and colors for the UI.
const PARAMETER_CONFIG: { [key: string]: { icon: React.ElementType, colorClasses: { bg: string, text: string } } } = {
    'Structure': { icon: Feather, colorClasses: { bg: 'bg-blue-300', text: 'text-blue-800' } },
    'Structure & Presentation': { icon: Feather, colorClasses: { bg: 'bg-blue-300', text: 'text-blue-800' } },
    'Content Depth': { icon: BrainCircuit, colorClasses: { bg: 'bg-purple-300', text: 'text-purple-800' } },
    'Analytical Depth': { icon: BrainCircuit, colorClasses: { bg: 'bg-purple-300', text: 'text-purple-800' } },
    'Clarity': { icon: MessageSquareQuote, colorClasses: { bg: 'bg-teal-300', text: 'text-teal-800' } },
    'Use of Examples': { icon: MessageSquareQuote, colorClasses: { bg: 'bg-red-300', text: 'text-red-800' } },
    'Keyword Usage': { icon: Bot, colorClasses: { bg: 'bg-green-300', text: 'text-green-800' } },
    'Use of Keywords & Articles': { icon: Bot, colorClasses: { bg: 'bg-green-300', text: 'text-green-800' } },
    'Overall Coherence': { icon: Target, colorClasses: { bg: 'bg-orange-300', text: 'text-orange-800' } },
    'Interlinking Concepts': { icon: Target, colorClasses: { bg: 'bg-orange-300', text: 'text-orange-800' } },
    'Conclusion & Way Forward': { icon: ShieldCheck, colorClasses: { bg: 'bg-indigo-300', text: 'text-indigo-800' } },
    // Add any other parameter names here
};


export default function OverallAssessmentCard({ feedback }: { feedback: OverallFeedback }) {
    if (!feedback || !feedback.parameters) {
        return null;
    }

    const [hoveredParam, setHoveredParam] = useState<string | null>(null);

    // MODIFICATION: We now map over the parameters object from the feedback prop.
    // This combines the dynamic data (score, suggestion) with the static config (icon, colors).
    const parameterDetails = Object.entries(feedback.parameters).map(([name, data]) => ({
        label: name,
        score: data.score,
        suggestion: data.suggestion,
        icon: PARAMETER_CONFIG[name]?.icon || ShieldCheck, // Fallback icon
        colorClasses: PARAMETER_CONFIG[name]?.colorClasses || { bg: 'bg-gray-300', text: 'text-gray-800' },
    }));
    
    // MODIFICATION: The calculation is now corrected to sum the 'score' property from each parameter object.
    const totalScore = parameterDetails.reduce((sum, param) => sum + (param.score || 0), 0);
    const averageScore = parameterDetails.length > 0 ? totalScore / parameterDetails.length : 0;

    // MODIFICATION: This function now gets the dynamic suggestion from our data.
    const getInsight = () => {
        if (!hoveredParam) {
            return { title: "Parameter Insights", text: "Hover over a parameter to see detailed feedback." };
        }
        const param = parameterDetails.find(p => p.label === hoveredParam);
        if (!param) {
            return { title: "Parameter Insights", text: "Hover over a parameter to see detailed feedback." };
        }
        return {
            title: `${param.label} Insights`,
            text: param.suggestion // This is now the AI-generated suggestion!
        }
    }

    return (
        <details id="overall-feedback" className="group rounded-xl border border-white/30 bg-white/60 backdrop-blur-lg shadow-lg" open>
            <summary className="cursor-pointer list-none p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="text-red-800" size={32} />
                    <h3 className="font-serif text-2xl font-bold text-slate-900">Overall Assessment</h3>
                </div>
                <ChevronDown className="h-6 w-6 text-slate-500 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-200/80 px-6 pb-6">
                <div className="flex flex-col md:flex-row items-center gap-8 pt-6">
                    <div className="flex flex-col items-center text-center md:w-1/3">
                        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Overall Score</h3>
                        <ScoreGauge score={averageScore || 0} />
                        {feedback.generalAssessment && (
                            <p className="mt-4 text-sm text-slate-700">{feedback.generalAssessment}</p>
                        )}
                    </div>

                    <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                            {/* The component now correctly maps over the new parameterDetails array */}
                            {parameterDetails.map((param) => (
                            <ParameterScore 
                                key={param.label} 
                                {...param} 
                                onMouseEnter={() => setHoveredParam(param.label)}
                                onMouseLeave={() => setHoveredParam(null)}
                            />
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-slate-100/70 rounded-lg min-h-[100px] border border-slate-200/80">
                            <h4 className="font-bold text-slate-800">{getInsight().title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{getInsight().text}</p>
                        </div>
                    </div>
                </div>
            </div>
        </details>
    );
}