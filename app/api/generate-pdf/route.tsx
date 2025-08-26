// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Puppeteer requires the Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const evaluationData = await req.json();
        
        // Get the origin URL (e.g., http://localhost:3000) to make an internal API call
        const origin = req.nextUrl.origin;

        // Fetch the fully rendered HTML from our new 'view' route
        const htmlResponse = await fetch(`${origin}/api/generate-pdf/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationData),
            cache: 'no-store', // Ensure we get a fresh render every time
        });

        if (!htmlResponse.ok) {
            const errorText = await htmlResponse.text();
            throw new Error(`Failed to fetch rendered HTML: ${errorText}`);
        }

        const html = await htmlResponse.text();

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '40px', left: '20px' }
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Evaluation-Report.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: `Failed to generate PDF: ${error.message}` },
            { status: 500 }
        );
    }
}