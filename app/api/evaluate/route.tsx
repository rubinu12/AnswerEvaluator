import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { VertexAI } from '@google-cloud/vertexai';
import { getPromptForSubject } from '@/lib/prompts'; // Ensure this points to your index.ts
import { admin, db } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Force dynamic processing
export const dynamic = 'force-dynamic';

// --- Initialize Vertex AI (Global Scope) ---
const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID!,
    location: 'us-central1',
});

// Configure Model
const geminiModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { 
        responseMimeType: 'application/json',
        temperature: 0.4
    }
});

// --- Helper function ---
function extractJsonFromText(text: string): string | null {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) return text.substring(firstBrace, lastBrace + 1);
    return null;
}

export async function POST(request: Request) {
    console.log("\n--- [START] /api/evaluate request received ---");
    let user: DecodedIdToken;

    // --- 1. Authentication ---
    try {
        const authorization = (await headers()).get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
        }
        const idToken = authorization.split('Bearer ')[1];
        user = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    // --- 2. Request Validation ---
    try {
        const { preparedData, subject } = await request.json();
        
        if (!preparedData || !Array.isArray(preparedData) || preparedData.length === 0) {
            return NextResponse.json({ error: 'No prepared evaluation data provided.' }, { status: 400 });
        }

        // Credit Deduction Logic (Simplified for brevity - keep your existing logic here)
        // ... [Insert your existing Firestore transaction logic here] ...

        // --- 3. Evaluation Loop (The Fix) ---
        const results = [];
        let totalScore = 0;
        let totalMaxMarks = 0;
        let combinedFeedback = { generalAssessment: "", parameters: {} }; // Placeholder aggregation

        console.log(`Processing ${preparedData.length} questions...`);

        for (const question of preparedData) {
            console.log(`Evaluating Q${question.questionNumber}...`);
            
            // Extract Metadata
            const directive = question.directive || 'analyze';
            const subSubject = question.subject || subject || 'GS1'; // Fallback to passed subject
            
            // Generate Prompt
            // Note: Since getPromptForSubject expects an array, we pass [question] to isolate it
            const evaluationPrompt = getPromptForSubject(subSubject, [question]);

            // Call AI
            const result = await geminiModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
            });

            const rawText = result.response.candidates?.[0]?.content.parts[0].text;
            if (!rawText) throw new Error(`Empty response for Q${question.questionNumber}`);

            const jsonString = extractJsonFromText(rawText);
            if (!jsonString) throw new Error(`Invalid JSON for Q${question.questionNumber}`);

            const evalJson = JSON.parse(jsonString);

            // Normalize Result (Handle Array vs Object output from AI)
            // If AI returns { questionAnalysis: [...] }, extract the first item
            const analysisItem = Array.isArray(evalJson.questionAnalysis) 
                ? evalJson.questionAnalysis[0] 
                : evalJson; // Fallback if AI returns single object

            // Accumulate Totals
            totalScore += analysisItem.score || 0;
            totalMaxMarks += question.maxMarks || 0;
            // For Phase 1, just take the last feedback (or improved aggregation later)
            if(evalJson.overallFeedback) combinedFeedback = evalJson.overallFeedback;

            // Add to Results Array
            results.push({
                ...analysisItem,
                questionNumber: question.questionNumber,
                userAnswer: question.userAnswer,
                maxMarks: question.maxMarks,
                subject: subSubject
            });
        }

        // --- 4. Final Payload Construction ---
        const finalPayload = {
            analysis: {
                overallScore: totalScore,
                totalMarks: totalMaxMarks,
                overallFeedback: combinedFeedback,
                questionAnalysis: results
            },
            preparedData: preparedData,
            subject: subject
        };

        console.log("--- [SUCCESS] Evaluation Complete ---");
        return NextResponse.json(finalPayload);

    } catch (error: any) {
        console.error(`Evaluation Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}