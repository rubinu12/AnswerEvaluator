// app/api/generate-question-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { QuestionAnalysis } from '@/lib/types';
import { marked } from 'marked'; // We will use this to parse markdown

export const runtime = 'nodejs';

// This helper function builds the HTML string manually, avoiding React on the server.
const createQuestionPdfHtml = async (q: QuestionAnalysis): Promise<string> => {
    const parseMarkdown = async (text: string) => {
        try {
            // Ensure we handle undefined or null text
            return await marked.parse(text || '');
        } catch (e) { 
            console.error("Markdown parsing error:", e);
            return text || ''; 
        }
    };

    // MODIFICATION: We now parse the 'idealAnswer' string.
    const idealAnswerHtml = await parseMarkdown(q.idealAnswer);

    return `
        <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap');
                    :root {
                        --font-sans: 'Roboto', sans-serif;
                        --font-user: 'Comic Neue', cursive;
                        --primary-color: #2563eb;
                        --text-color: #1f2937;
                        --border-color: #d1d5db;
                    }
                    body { font-family: var(--font-sans); margin: 40px; font-size: 14px; line-height: 1.6; }
                    .card { border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                    h2 { font-size: 20px; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 8px; margin-bottom: 16px; }
                    h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
                    ul { padding-left: 20px; margin-top: 0; }
                    li { margin-bottom: 6px; }
                    .font-user-answer { font-family: var(--font-user); }
                    .font-ai-answer { font-family: var(--font-sans); }
                    .ideal-answer-container { background-color: #eff6ff; border-left: 4px solid var(--primary-color); padding: 1px 15px; border-radius: 4px;}
                    .ideal-answer-container h1, .ideal-answer-container h2, .ideal-answer-container h3 { margin-top: 1em; margin-bottom: 0.5em; color: var(--text-color); border: none;}
                    .ideal-answer-container ul { margin-top: 1em; }
                </style>
            </head>
            <body>
                <div>
                    <h2>Question ${q.questionNumber} Analysis (Score: ${q.score}/${q.maxMarks})</h2>
                    <p style="font-style: italic; color: #4b5563;">${q.questionText}</p>
                    
                    {/* MODIFICATION: Added Key Points to Cover section */}
                    <div class="card">
                        <h3>Key Points to Cover</h3>
                        <ul>
                            ${(q.keyPointsToCover || []).map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="card">
                        <h3>Value Addition</h3>
                        <ul>
                            ${(q.valueAddition || []).map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="card">
                        <h3>Your Answer</h3>
                        <div class="font-user-answer" style="white-space: pre-wrap;">${q.userAnswer}</div>
                    </div>
                    
                    {/* MODIFICATION: Using the new idealAnswer field */}
                    <div class="card">
                        <h3>Ideal Answer</h3>
                        <div class="font-ai-answer ideal-answer-container">
                            ${idealAnswerHtml}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
};

export async function POST(req: NextRequest) {
    try {
        const questionData: QuestionAnalysis | null = await req.json();
        if (!questionData) {
            return NextResponse.json({ error: 'Question data is required.' }, { status: 400 });
        }

        // Generate the HTML string directly using our updated helper
        const html = await createQuestionPdfHtml(questionData);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Question-${questionData.questionNumber}-Analysis.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: `Failed to generate PDF: ${error.message}` }, { status: 500 });
    }
}
