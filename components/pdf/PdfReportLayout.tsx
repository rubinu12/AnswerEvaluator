// components/pdf/PdfReportLayout.tsx
import React from 'react';
import { EvaluationData } from '@/lib/types'; // Path should be correct from the component's location

// This version is now correctly synced with your lib/types.ts file
export const PdfReportLayout = ({ data }: { data: EvaluationData }) => (
    <html>
        <head>
            <style>{`
                :root {
                    --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                }
                body { 
                    font-family: var(--font-sans); 
                    margin: 0;
                    padding: 40px; 
                    background-color: #fff;
                    color: #1a202c;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .card { 
                    border: 1px solid #e2e8f0; 
                    border-radius: 12px; 
                    padding: 24px; 
                    margin-bottom: 24px; 
                    page-break-inside: avoid;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                }
                h1, h2, h3 { 
                    margin-top: 0;
                    font-weight: 700;
                    color: #2d3748;
                }
                h1 { font-size: 2.25rem; }
                h2 { font-size: 1.5rem; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 16px; }
                h3 { font-size: 1.25rem; }
                p { margin-top: 0; margin-bottom: 1rem; }
                strong { font-weight: 600; }
                ul { padding-left: 20px; }
                li { margin-bottom: 8px; }
                .meta-info { color: #718096; font-size: 0.875rem; }
            `}</style>
        </head>
        <body>
            <div className="card">
                <h1>Evaluation Report</h1>
                <p className="meta-info">{data.subject} | Submitted on: {data.submittedOn}</p>
            </div>

            <div className="card">
                <h2>Overall Assessment</h2>
                {/* CORRECTED: Using overallScore and generalAssessment */}
                <p><strong>Overall Score:</strong> {data.overallScore}/{data.totalMarks}</p>
                <p>{data.overallFeedback.generalAssessment}</p>
            </div>

            {data.questionAnalysis.map((q, index) => (
                <div className="card" key={index}>
                    <h2>Question {q.questionNumber}</h2>
                    <h3>Your Answer:</h3>
                    {/* CORRECTED: Using userAnswer */}
                    <p>{q.userAnswer}</p>
                    
                    <h3>Feedback & Analysis:</h3>
                    {/* CORRECTED: Displaying scoreDeductionAnalysis */}
                    {q.scoreDeductionAnalysis.length > 0 ? (
                        <ul>
                            {q.scoreDeductionAnalysis.map((deduction, i) => (
                                <li key={i}>
                                    <strong>{deduction.points}:</strong> {deduction.reason}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No specific points were deducted.</p>
                    )}
                    
                    <p><strong>Score for this question:</strong> {q.score}/{q.maxMarks}</p>
                </div>
            ))}
        </body>
    </html>
);