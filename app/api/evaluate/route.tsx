// app/api/evaluate/route.tsx

import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { getPromptForSubject } from '@/lib/prompts';

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
    return null;
}

// --- Main API Handler ---
export async function POST(request: Request) {
  try {
    const { preparedData, subject } = await request.json();

    if (!preparedData || !Array.isArray(preparedData) || preparedData.length === 0) {
      return NextResponse.json({ error: 'No prepared evaluation data provided.' }, { status: 400 });
    }

    const evaluationPrompt = getPromptForSubject(subject || 'GS1', preparedData);
    
    const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
    });

    // --- [NEW] Step 3.5: Log Token Usage ---
    const usageMetadata = result.response.usageMetadata;
    if (usageMetadata) {
      console.log("\n--- TOKEN USAGE (Evaluation Stage) ---");
      console.log(`Input Tokens: ${usageMetadata.promptTokenCount}`);
      console.log(`Output Tokens: ${usageMetadata.candidatesTokenCount}`);
      console.log("--------------------------------------\n");
    } else {
      console.log("Token usage metadata was not available for this request.");
    }
    // --- [END NEW] ---

    const rawResponseText = result.response.candidates?.[0]?.content.parts[0].text;

    if (!rawResponseText) {
        throw new Error("Received no response text from Gemini for the final evaluation.");
    }

    const jsonString = extractJsonFromText(rawResponseText);
    
    if (!jsonString) {
        console.error("Invalid JSON response from master prompt:", rawResponseText);
        throw new Error("The AI returned an invalid format for the final evaluation.");
    }

    const evaluationJson = JSON.parse(jsonString);
    
    return NextResponse.json(evaluationJson);

  } catch (error: any) {
    console.error("Error in evaluation pipeline:", error);
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}