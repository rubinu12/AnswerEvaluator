// components/result/SidebarNav.tsx
'use client'

import { useState, useEffect, useMemo } from 'react';
import { EvaluationData } from '@/lib/types'
import { LayoutDashboard, FileText } from 'lucide-react';

// Array of 10 professional, muted gradient strings
const professionalGradients = [
    'linear-gradient(to top right, #67e8f9, #0891b2)', // Cyan
    'linear-gradient(to top right, #818cf8, #4f46e5)', // Indigo
    'linear-gradient(to top right, #a78bfa, #7c3aed)', // Violet
    'linear-gradient(to top right, #f472b6, #db2777)', // Pink
    'linear-gradient(to top right, #fb923c, #f97316)', // Orange
    'linear-gradient(to top right, #5eead4, #0d9488)', // Teal
    'linear-gradient(to top right, #9ca3af, #4b5563)', // Slate
    'linear-gradient(to top right, #6ee7b7, #059669)', // Emerald
    'linear-gradient(to top right, #a3e635, #65a30d)', // Lime
    'linear-gradient(to top right, #f87171, #dc2626)', // Red
];

// Helper function to shuffle the array
const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

export default function SidebarNav({ data }: { data: EvaluationData }) {
    const [activeId, setActiveId] = useState('overall-feedback');

    // useMemo will shuffle the gradients only once when the component mounts
    const questionGradients = useMemo(() => {
        const shuffled = shuffleArray([...professionalGradients]);
        const gradientMap: { [key: number]: string } = {};
        data.questionAnalysis.forEach((q, index) => {
            gradientMap[q.questionNumber] = shuffled[index % shuffled.length];
        });
        return gradientMap;
    }, [data.questionAnalysis]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-50% 0px -50% 0px' } 
        );

        const sections = ['overall-feedback', ...data.questionAnalysis.map(q => `question-${q.questionNumber}`)];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, [data.questionAnalysis]);

    if (!data.questionAnalysis) {
        return null;
    }

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(id);
        }
    }

    const NavButton = ({ id, text, score, maxMarks, icon: Icon, activeGradient }: { 
        id: string, 
        text: string, 
        score?: number, 
        maxMarks?: number,
        icon: React.ElementType,
        activeGradient: string
    }) => {
        const isActive = activeId === id;
        return (
            <button
                onClick={() => scrollTo(id)}
                className={`w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg flex justify-between items-center transition-all duration-300 transform ${
                    isActive 
                        ? 'text-white shadow-md scale-105' 
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800'
                }`}
                style={{
                    backgroundImage: isActive ? activeGradient : 'none',
                }}
            >
                <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{text}</span>
                </div>
                {score !== undefined && maxMarks !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-red-100 text-red-800'
                    }`}>
                        {score.toFixed(1)}/{maxMarks}
                    </span>
                )}
            </button>
        )
    }

    return (
        <nav className="p-4 rounded-xl border border-white/30 bg-white/60 backdrop-blur-lg shadow-lg">
            <h3 className="px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Navigation</h3>
            <div className="space-y-1">
                <NavButton 
                    id="overall-feedback" 
                    text="Overall Assessment" 
                    icon={LayoutDashboard}
                    activeGradient="linear-gradient(to top right, #64748b, #334155)" // Default slate gradient
                />
                {data.questionAnalysis.map((q) => (
                    <NavButton
                        key={q.questionNumber}
                        id={`question-${q.questionNumber}`}
                        text={data.subject === 'Essay' ? 'Essay Analysis' : `Question ${q.questionNumber}`}
                        score={q.score}
                        maxMarks={q.maxMarks}
                        icon={FileText}
                        activeGradient={questionGradients[q.questionNumber]}
                    />
                ))}
            </div>
        </nav>
    );
}