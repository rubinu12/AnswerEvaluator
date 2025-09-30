// app/api/prepare-evaluation/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { VertexAI, Part } from '@google-cloud/vertexai';
// Correctly import the prompt selector function
import { getTranscriptionPrompt } from '@/lib/prompts/transcription/index';

// --- Initialize Vertex AI ---
const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: 'us-central1',
});

const geminiModel = vertex_ai.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
});

// --- Helper function to extract JSON from the AI's response ---
function extractJsonFromText(text: string): string | null {
    // This regex is robust enough to handle markdown code blocks
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        return markdownMatch[1].trim();
    }
    // Fallback for non-markdown responses
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        return text.substring(firstBracket, lastBracket + 1);
    }
    return null;
}


// --- Main API Handler ---
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subject = formData.get('subject') as string | 'GS1'; // Default to 'GS1' if not provided

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // --- Step 1: Get Images from Python Server ---
    console.log(`Sending PDF for subject "${subject}" to Python for image conversion...`);
    // Consider making the URL an environment variable
    const imageConversionResponse = await fetch('http://127.0.0.1:5001/convert_pdf_to_images', {
      method: 'POST',
      body: formData,
    });

    if (!imageConversionResponse.ok) {
        const errorData = await imageConversionResponse.json();
        console.error("Python server error:", errorData);
        throw new Error(`PDF to Image conversion failed: ${errorData.error}`);
    }
    const { images } = await imageConversionResponse.json();
    console.log(`Received ${images.length} images from Python.`);

    // --- Step 2: Dynamically Select the Expert Prompt ---
    const imageParts: Part[] = images.map((img: string) => ({
        inlineData: { mimeType: 'image/jpeg', data: img }
    }));
    
    // *** THE FIX: Use the imported function to get the correct prompt ***
    const transcriptionPrompt = getTranscriptionPrompt(subject);
    if (!transcriptionPrompt) {
        return NextResponse.json({ error: `Invalid subject provided: ${subject}` }, { status: 400 });
    }

    const requestParts: Part[] = [{text: transcriptionPrompt}, ...imageParts];

    // --- Step 3: Call Gemini API ---
    console.log(`Sending ${images.length} images to Gemini with the "${subject}" expert prompt...`);
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: requestParts }]
    });

    const rawResponseText = result.response.candidates?.[0]?.content.parts[0].text;

    if (!rawResponseText) {
      throw new Error("Received no response text from Gemini.");
    }

    // --- Step 4: Extract and Parse the JSON ---
    const jsonString = extractJsonFromText(rawResponseText);
    if (!jsonString) {
        console.error("AI failed to return valid JSON. Raw Response:", rawResponseText);
        throw new Error("The AI failed to transcribe the document into the required format.");
    }

    const preparedData = JSON.parse(jsonString);

    // --- Step 5: Send Structured JSON to Frontend ---
    return NextResponse.json(preparedData);

  } catch (error: any) {
    console.error('Critical error in prepare-evaluation pipeline:', error);
    // Return a more user-friendly error message
    return NextResponse.json({ error: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}