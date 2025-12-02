import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { VertexAI } from '@google-cloud/vertexai';
import { getPromptForSubject } from '@/lib/prompts'; 
import { admin } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Force dynamic processing
export const dynamic = 'force-dynamic';

// --- Initialize Vertex AI ---
const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID!,
    location: 'us-central1',
});

// Configure Model - Using Flash Lite for speed
const geminiModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { 
        responseMimeType: 'application/json',
        temperature: 0.3 
    }
});

// --- Helper: Robust JSON Extraction ---
function extractJsonFromText(text: string): string | null {
    // 1. Try Markdown block
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
    
    // 2. Try raw object detection (Find first '{' and last '}')
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    
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

        // --- 3. Evaluation Loop ---
        const results = [];
        let totalScore = 0;
        let totalMaxMarks = 0;
        let combinedFeedback = { generalAssessment: "", parameters: {} }; 

        console.log(`Processing ${preparedData.length} questions for subject: ${subject}...`);

        for (const question of preparedData) {
            console.log(`Evaluating Q${question.questionNumber}...`);
            
            // [FIXED ROUTING LOGIC]
            // We use the 'subject' (e.g., GS2) to select the Prompt Engine.
            const routingSubject = subject || 'GS1'; 
            
            // Generate Prompt
            const evaluationPrompt = getPromptForSubject(routingSubject, [question]);

            // [DEBUG: PRINT PROMPT]
            console.log("\n--- [DEBUG] FINAL PROMPT SENT TO GEMINI ---");
            console.log(evaluationPrompt);
            console.log("-------------------------------------------\n");

            // Call AI
            const result = await geminiModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
            });

            const rawText = result.response.candidates?.[0]?.content.parts[0].text;
            
            // [DEBUG: PRINT RAW RESPONSE]
            console.log("\n--- [DEBUG] RAW RESPONSE FROM GEMINI ---");
            console.log(rawText);
            console.log("----------------------------------------\n");

            if (!rawText) throw new Error(`Empty response for Q${question.questionNumber}`);

            const jsonString = extractJsonFromText(rawText);
            if (!jsonString) {
                console.error("Failed JSON extraction.");
                throw new Error(`Invalid JSON format for Q${question.questionNumber}`);
            }

            let evalJson;
            try {
                evalJson = JSON.parse(jsonString);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Attempt to sanitize control characters if simple parse fails
                const sanitized = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
                evalJson = JSON.parse(sanitized);
            }

            // Normalize Result
            const analysisItem = Array.isArray(evalJson.questionAnalysis) 
                ? evalJson.questionAnalysis[0] 
                : evalJson; 

            // Accumulate Totals
            totalScore += analysisItem.score || 0;
            totalMaxMarks += question.maxMarks || 0;
            if(evalJson.overallFeedback) combinedFeedback = evalJson.overallFeedback;

            // Add to Results
            results.push({
                ...analysisItem,
                questionNumber: question.questionNumber,
                userAnswer: question.userAnswer,
                maxMarks: question.maxMarks,
                subject: routingSubject
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