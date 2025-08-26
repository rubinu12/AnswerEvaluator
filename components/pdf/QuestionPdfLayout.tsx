// components/pdf/PdfReportLayout.tsx
import React from 'react';
import { EvaluationData } from '@/lib/types';
import { marked } from 'marked';

// The component is now async to handle markdown parsing
export const PdfReportLayout = async ({ data }: { data: EvaluationData }) => {
    
    const parseMarkdown = async (text: string) => {
        try {
            return await marked.parse(text || '');
        } catch (e) { return text || ''; }
    };

    return (
        <html>
            <head>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap');
                    :root {
                        --font-sans: 'Roboto', sans-serif;
                        --font-user: 'Comic Neue', cursive;
                        --primary-color: #2563eb;
                        --text-color: #1f2937;
                        --border-color: #d1d5db;
                        --background-light: #f9fafb;
                    }
                    body { font-family: var(--font-sans); margin: 0; font-size: 14px; line-height: 1.6; }
                    .page { padding: 40px; page-break-after: always; }
                    .page:last-child { page-break-after: avoid; }
                    .header, .footer { width: 100%; text-align: center; position: fixed; left: 0; color: #6b7280; font-size: 12px; }
                    .header { top: 15px; }
                    .footer { bottom: 15px; }
                    .card { border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                    h1 { font-size: 28px; color: var(--primary-color); text-align: center; margin-bottom: 10px; }
                    h2 { font-size: 20px; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 8px; margin-top: 30px; margin-bottom: 16px; }
                    h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
                    ul { padding-left: 20px; margin-top: 0; }
                    li { margin-bottom: 6px; }
                    .meta-info { text-align: center; color: #6b7280; margin-bottom: 40px; }
                    .feedback-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .feedback-table th, .feedback-table td { border: 1px solid var(--border-color); padding: 10px; text-align: left; }
                    .feedback-table th { background-color: var(--background-light); font-weight: 700; }
                    .font-user-answer { font-family: var(--font-user); }
                    .font-ai-answer { font-family: var(--font-sans); }
                    .ideal-answer-container { background-color: #eff6ff; border-left: 4px solid var(--primary-color); padding: 1px 15px; border-radius: 4px; }
                    .ideal-answer-container h1, .ideal-answer-container h2, .ideal-answer-container h3 { margin-top: 1em; margin-bottom: 0.5em; color: var(--text-color); border: none;}
                    .ideal-answer-container ul { margin-top: 1em; }
                `}</style>
            </head>
            <body>
                <div className="header">Root & Rise - Confidential Evaluation Report</div>
                <div className="footer">Page <span className="pageNumber"></span> of <span className="totalPages"></span></div>

                <div className="page">
                    <h1>Evaluation Report</h1>
                    <p className="meta-info">{data.subject} | Submitted on: {data.submittedOn}</p>
                    <div className="card">
                        <h2>Overall Assessment</h2>
                        <p>{data.overallFeedback.generalAssessment}</p>
                        <table className="feedback-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '25%' }}>Parameter</th>
                                    <th style={{ width: '15%' }}>Score</th>
                                    <th>Suggestion for Improvement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.overallFeedback.parameters).map(([name, details]) => (
                                    <tr key={name}>
                                        <td>{name}</td>
                                        <td style={{ textAlign: 'center' }}>{details.score}/10</td>
                                        <td>{details.suggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {await Promise.all(data.questionAnalysis.map(async (q, index) => {
                    const idealAnswerHtml = await parseMarkdown(q.idealAnswer);
                    return (
                        <div className="page" key={index}>
                            <h2>Question {q.questionNumber} Analysis (Score: {q.score}/{q.maxMarks})</h2>
                            <p style={{ fontStyle: 'italic', color: '#4b5563' }}>{q.questionText}</p>

                            <div className="card">
                                <h3>Key Points to Cover</h3>
                                <ul>
                                    {(q.keyPointsToCover || []).map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="card">
                                <h3>Value Addition</h3>
                                <ul>
                                    {(q.valueAddition || []).map((note, i) => <li key={i}>{note}</li>)}
                                </ul>
                            </div>

                            <div className="card">
                                <h3>Your Answer</h3>
                                <div className="font-user-answer" style={{ whiteSpace: 'pre-wrap' }}>{q.userAnswer}</div>
                            </div>
                            
                            <div className="card">
                                <h3>Ideal Answer</h3>
                                <div className="font-ai-answer ideal-answer-container" dangerouslySetInnerHTML={{ __html: idealAnswerHtml }} />
                            </div>
                        </div>
                    );
                }))}
            </body>
        </html>
    );
};
