// app/api/evaluate/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { ocrText } = await request.json();

  if (!ocrText) {
    return NextResponse.json({ error: 'No text provided for evaluation.' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // ** THIS IS THE NEW, MORE DETAILED PROMPT **
  const prompt = `You are an expert editor tasked with cleaning up text from a scanned handwritten exam answer.

  Follow these rules strictly:
  
  1.  **Reconstruct Content:** Re-join broken sentences. Group related sentences into logical paragraphs. Use a single newline character to separate paragraphs for clean formatting.
  2.  **Preserve Core Answer:** Maintain the original headings and list structures (like bullet points) that are part of the actual answer.
  3.  **Remove Boilerplate:** You MUST identify and completely REMOVE all instructional text, headers, footers, and margin notes from the answer sheet template. This includes, but is not limited to, phrases like:
      - "Specimen Answer Booklet - For Practice Purpose Only"
      - "Candidates must not write on this margin"
      - "UPSC"
      - Any text in Hindi (e.g., "न लिखें", "कृप्या इस स्थान में", "अतिरिक्त कुछ").
      - Any standalone page numbers.
  4.  **No Commentary:** Do not add any introductions, summaries, or comments like "Here is the cleaned text:". Output only the student's cleaned-up answer.

  Here is the messy OCR text to be cleaned:
  ---
  ${ocrText}
  ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const formattedText = response.text();

    return NextResponse.json({ formattedText });
    
  } catch (error: any) {
    console.error("Error evaluating text with Gemini:", error);
    return NextResponse.json({ error: `An error occurred during AI evaluation: ${error.message}` }, { status: 500 });
  }
}