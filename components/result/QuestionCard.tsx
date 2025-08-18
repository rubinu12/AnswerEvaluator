// app/components/result/QuestionCard.tsx
'use client';

// A simple component to render the Markdown from the AI
const MarkdownRenderer = ({ text }: { text: string }) => {
    // Split by newlines to process line by line
    const lines = text.split('\n');

    return (
        <div>
            {lines.map((line, index) => {
                line = line.trim();
                // Rule for headings: **Heading:**
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="font-semibold text-slate-800 mt-3 mb-1">{line.replaceAll('**', '')}</p>;
                }
                // Rule for bullet points: - Point or * Point
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <p key={index} className="ml-4 relative before:content-['•'] before:absolute before:left-[-1em]">{line.substring(2)}</p>;
                }
                // Regular paragraph
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

// Reusable Collapsible Section using <details> tag
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    return (
        <details open={defaultOpen} className="mt-6 border-t border-gray-200 pt-6 group">
            <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center list-none">
                <span>{title}</span>
                <svg className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </summary>
            <div className="collapsible-content mt-4 text-slate-600 prose prose-sm max-w-none">
                {children}
            </div>
        </details>
    );
};

interface QuestionCardProps {
  questionData: {
    questionNumber: number;
    questionText: string;
    score: number;
    maxMarks: number;
    userAnswer: string;
    detailedAnalysis: {
        strengths: string[];
        improvements: string[];
    };
    keywords: {
        missed: string[];
        suggestion: string;
    };
  };
}

export default function QuestionCard({ questionData }: QuestionCardProps) {
    // ... (handleBookmark and handleAnalytics functions remain the same)

    return (
    <section id={`question-${questionData.questionNumber}`} className="bg-white p-6 rounded-lg border border-gray-200 scroll-mt-20">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary-accent)' }}>
                    Question {questionData.questionNumber}
                </p>
                <h3 className="text-xl font-serif mt-1">{questionData.questionText}</h3>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Bookmark">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
                <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Performance Analytics">
                     <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </button>
                <div className="font-mono text-lg font-semibold px-3 py-1">
                    {questionData.score.toFixed(1)}
                    <span className="text-sm text-gray-500"> / {questionData.maxMarks}</span>
                </div>
            </div>
        </div>

        <CollapsibleSection title="Your Answer" defaultOpen={true}>
            <MarkdownRenderer text={questionData.userAnswer} />
        </CollapsibleSection>

        <CollapsibleSection title="Detailed Analysis">
            <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center">Key Strengths</h4>
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                        {questionData.detailedAnalysis.strengths.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center">Areas for Improvement</h4>
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                        {questionData.detailedAnalysis.improvements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Keywords & Examples">
             <p className="font-semibold text-slate-800">Keywords Missed:</p>
             <p>{questionData.keywords.missed.join(', ')}.</p>
             <p className="mt-3 font-semibold text-slate-800">Mindblowing Example:</p>
             <p>{questionData.keywords.suggestion}</p>
        </CollapsibleSection>

    </section>
  );
}