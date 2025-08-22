// components/result/OverallAssessmentCard.tsx
'use client';
import { OverallFeedback } from '@/lib/types';

export default function OverallAssessmentCard({ feedback }: { feedback: OverallFeedback }) {
    if (!feedback) {
        return null;
    }

    return (
        <details id="overall-feedback" className="rounded-lg border border-gray-200 bg-white shadow-sm" open>
            <summary className="cursor-pointer list-none p-6">
                <h3 className="font-serif text-2xl font-bold text-slate-900">Overall Assessment</h3>
            </summary>
            <div className="border-t border-gray-200 px-6 pb-6">
                {feedback.generalAssessment && <p className="mt-4 text-slate-600">{feedback.generalAssessment}</p>}
                
                {feedback.parameters && typeof feedback.parameters === 'object' && (
                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                        {Object.entries(feedback.parameters).map(([key, value]) => (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center" key={key}>
                                <div className="text-xs font-medium uppercase text-gray-500">{key}</div>
                                <div className="mt-1 text-2xl font-bold text-slate-800">{value} / 10</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </details>
    );
}