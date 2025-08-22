// components/result/SidebarNav.tsx
'use client';
import { EvaluationData } from '@/lib/types';

interface SidebarNavProps {
  data: EvaluationData;
}

export default function SidebarNav({ data }: SidebarNavProps) {
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    return (
        <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold">{data.subject} Report</h3>
            <nav className="mt-4 space-y-1">
                <a href="#overall-feedback" className="group flex items-center justify-between rounded-md border-l-4 border-[--primary-accent] bg-red-50 px-3 py-2 text-sm font-semibold text-[--primary-accent]" onClick={(e) => handleLinkClick(e, 'overall-feedback')}>
                    <span>Overall Feedback</span>
                    <span className="font-mono text-xs font-bold text-white bg-[--primary-accent-hover] rounded-full px-2 py-0.5">
                        {data.overallScore}/{data.totalMarks}
                    </span>
                </a>
                {data.questionAnalysis.map(q => (
                    <a key={q.questionNumber} href={`#question-${q.questionNumber}`} className="group flex items-center justify-between rounded-md border-l-4 border-transparent px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100" onClick={(e) => handleLinkClick(e, `question-${q.questionNumber}`)}>
                        <span>{data.subject === 'Essay' ? `Essay ${q.questionNumber}` : `Question ${q.questionNumber}`}</span>
                        <span className="font-mono text-xs font-bold text-gray-700 bg-gray-200 rounded-full px-2 py-0.5 transition-colors group-hover:bg-gray-300">
                            {q.score}/{q.maxMarks}
                        </span>
                    </a>
                ))}
            </nav>
        </aside>
    );
}