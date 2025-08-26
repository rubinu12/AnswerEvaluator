// app/api/generate-pdf/view/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { PdfReportLayout } from '@/components/pdf/PdfReportLayout';
import { EvaluationData } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const data: EvaluationData | null = await req.json();
        if (!data) {
            return new Response('Evaluation data is required.', { status: 400 });
        }
        // Render the React component to an HTML string
        const ReactDOMServer = (await import('react-dom/server')).default;
        const html = ReactDOMServer.renderToString(<PdfReportLayout data={data} />);
        return new Response(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error("View Render Error:", error);
        return new Response('Failed to render PDF view', { status: 500 });
    }
}