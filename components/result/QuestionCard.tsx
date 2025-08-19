// app/components/result/QuestionCard.tsx
'use client';

// Reusable Collapsible Section
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    return (
        <details open={defaultOpen} className="mt-6 border-t border-gray-200 pt-6 group">
            <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center list-none">
                <span className="font-serif">{title}</span>
                <svg className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </summary>
            <div className="mt-4">
                {children}
            </div>
        </details>
    );
};

// Final interface including writingStrategyNotes
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
    answerFramework: {
        introduction: string;
        body: string[];
        conclusion: string;
    };
    writingStrategyNotes: string[];
  };
}

export default function QuestionCard({ questionData }: QuestionCardProps) {
    const wordCount = questionData.userAnswer.split(/\s+/).filter(Boolean).length;

    return (
    <section id={`question-${questionData.questionNumber}`} className="bg-white p-6 rounded-lg border border-gray-200 scroll-mt-24">
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
                <span className="text-xs text-slate-500 font-medium">{wordCount} words</span>
                <div className="font-mono text-lg font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-center">
                    {questionData.score.toFixed(1)}
                    <span className="text-xs text-amber-700"> / {questionData.maxMarks}</span>
                </div>
            </div>
        </div>

        <div className="mt-4">
             <CollapsibleSection title="Your Original Answer">
                <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">{questionData.userAnswer}</div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Detailed Analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800">Key Strengths</h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                            {questionData.detailedAnalysis.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-semibold text-amber-800">Areas for Improvement</h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                            {questionData.detailedAnalysis.improvements.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Model Answer & Strategy" defaultOpen={true}>
                <div className="space-y-4 prose prose-sm max-w-none text-slate-700">
                    <div>
                        <h4 className="font-semibold text-slate-800 !mb-1">Ideal Framework</h4>
                        <div className="mt-2 text-sm text-slate-600 space-y-2 border-l-2 border-slate-300 pl-4">
                            <p><strong>Introduction:</strong> {questionData.answerFramework.introduction}</p>
                            <div>
                                <p className="font-semibold">Body:</p>
                                <ul className="list-decimal list-inside ml-4">
                                    {questionData.answerFramework.body.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <p><strong>Conclusion:</strong> {questionData.answerFramework.conclusion}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg !mt-6">
                        <h4 className="font-bold text-blue-900 !m-0">Strategic Notes</h4>
                         <ul className="!mt-2 !list-none !p-0">
                            {questionData.writingStrategyNotes.map((item, index) => <li key={index} className="!before:content-['✓'] !before:mr-2 !before:text-blue-500">{item}</li>)}
                        </ul>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    </section>
  );
}