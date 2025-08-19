// app/api/evaluate/route.tsx

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPromptForSubject } from '@/lib/prompts';

// --- Client Initialization ---
function getClients() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  return { geminiModel };
}

// --- Main API Handler ---
export async function POST(request: Request) {
  // ... function body remains the same
  const { geminiModel } = getClients();
  
  try {
    const { preparedData, subject } = await request.json();

    if (!preparedData || !Array.isArray(preparedData) || preparedData.length === 0) {
      return NextResponse.json({ error: 'No prepared evaluation data provided.' }, { status: 400 });
    }

    const evaluationPrompt = getPromptForSubject(subject || 'GS1', preparedData);
    
    const evaluationResult = await geminiModel.generateContent(evaluationPrompt);
    const rawResponseText = evaluationResult.response.text();
    
    const firstBracketIndex = rawResponseText.indexOf('{');
    const lastBracketIndex = rawResponseText.lastIndexOf('}');

    if (firstBracketIndex === -1 || lastBracketIndex === -1) {
        console.error("Invalid JSON response from master prompt:", rawResponseText);
        throw new Error("The AI returned an invalid format for the final evaluation.");
    }

    const jsonString = rawResponseText.substring(firstBracketIndex, lastBracketIndex + 1);
    const evaluationJson = JSON.parse(jsonString);
    
    return NextResponse.json(evaluationJson);

  } catch (error: any) {
    console.error("Error in evaluation pipeline:", error);
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}