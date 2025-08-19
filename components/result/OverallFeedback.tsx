// app/components/result/OverallFeedback.tsx
'use client';

// Define the new types for the feedback structure for better type safety
interface Deduction {
  pointsDeducted: string;
  reason: string;
  explanation: string;
}

interface FeedbackData {
  generalAssessment: string;
  scoreDeductionAnalysis: Deduction[];
}

// Main component props
interface OverallFeedbackProps {
  feedback: FeedbackData;
}

export default function OverallFeedback({ feedback }: OverallFeedbackProps) {
  // Guard against missing or incomplete feedback data
  if (!feedback || !feedback.generalAssessment || !feedback.scoreDeductionAnalysis) {
    return (
        <section id="overall-feedback" className="bg-white p-6 rounded-lg border border-gray-200 scroll-mt-20">
            <h2 className="text-2xl font-bold font-serif">Overall Feedback</h2>
            <p className="mt-4 text-slate-500">Overall feedback is not available for this evaluation.</p>
        </section>
    );
  }

  return (
    <section id="overall-feedback" className="bg-white p-6 rounded-lg border border-gray-200 scroll-mt-20">
      <details open className="group">
        <summary className="list-none flex justify-between items-center cursor-pointer">
          <h2 className="text-2xl font-bold font-serif text-slate-900">Overall Feedback</h2>
          <div className="flex items-center">
            {/* You can pass the overall score here if you want to display it */}
            <svg className="w-6 h-6 text-gray-500 transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </summary>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-serif font-semibold text-lg text-slate-800">General Assessment</h3>
            <p className="mt-2 text-slate-600 prose prose-sm max-w-none">
                {feedback.generalAssessment}
            </p>
            
            <h3 className="font-serif font-semibold text-lg text-slate-800 mt-8">Score Deduction Analysis</h3>
            <ul className="mt-4 space-y-4">
                {feedback.scoreDeductionAnalysis.map((deduction, index) => (
                    <li key={index} className="flex items-start">
                        <div className="font-bold text-lg text-red-700 mr-4 w-20 text-right">
                            {deduction.pointsDeducted}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{deduction.reason}</h4>
                            <p className="text-sm text-slate-500 mt-1">{deduction.explanation}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </details>
    </section>
  );
}