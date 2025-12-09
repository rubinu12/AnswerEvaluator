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

// Configure Model
const geminiModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { 
        responseMimeType: 'application/json',
        temperature: 0.3 
    }
});

// --- Helper: Robust JSON Extraction ---
function extractJsonFromText(text: string): string | null {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    return null;
}

export async function POST(request: Request) {
    console.log("\n===============================================");
    console.log("--- [START] /api/evaluate request received ---");
    console.log("===============================================");
    let user: DecodedIdToken;

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

    try {
        const { preparedData, subject } = await request.json();
        
        if (!preparedData || !Array.isArray(preparedData) || preparedData.length === 0) {
            return NextResponse.json({ error: 'No prepared evaluation data provided.' }, { status: 400 });
        }

        const results = [];
        let totalScore = 0;
        let totalMaxMarks = 0;
        let combinedFeedback = { generalAssessment: "", parameters: {} }; 

        console.log(`Processing ${preparedData.length} questions for subject: ${subject}...`);

        for (const question of preparedData) {
            console.log(`\nEvaluating Q${question.questionNumber}...`);
            const routingSubject = subject || 'GS1'; 
            const evaluationPrompt = getPromptForSubject(routingSubject, [question]);

            // Call AI
            const result = await geminiModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
            });

            const rawText = result.response.candidates?.[0]?.content.parts[0].text;
            if (!rawText) throw new Error(`Empty response for Q${question.questionNumber}`);

            // --- 🕵️‍♂️ DEBUG 1: RAW OUTPUT ---
            console.log(`\n--- [DEBUG Q${question.questionNumber}] Raw AI Output Preview (First 500 chars) ---`);
            console.log(rawText.substring(0, 500) + "...");
            // -----------------------------

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
                // Attempt sanitize
                const sanitized = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
                evalJson = JSON.parse(sanitized);
            }

            // Normalize Result
            const analysisItem = Array.isArray(evalJson.questionAnalysis) 
                ? evalJson.questionAnalysis[0] 
                : evalJson; 
            
            // --- 🕵️‍♂️ DEBUG 2: THE 4 PILLARS CHECK ---
            console.log(`\n--- [DEBUG Q${question.questionNumber}] 4 Pillars Data Check ---`);
            console.log(`1. Purple Pen (Vocab): Found ${analysisItem.vocabularySwaps?.length || 0} items`);
            if (analysisItem.vocabularySwaps?.length > 0) console.log("   Sample:", JSON.stringify(analysisItem.vocabularySwaps[0]));

            console.log(`2. Red Pen (Logic):    Found ${analysisItem.logicChecks?.length || 0} items`);
            
            console.log(`3. Green Pen (Data):   Found ${analysisItem.contentInjections?.length || 0} items`);
            if (analysisItem.contentInjections?.length > 0) console.log("   Sample:", JSON.stringify(analysisItem.contentInjections[0]));

            console.log(`4. Blue Pen (Praise):  Found ${analysisItem.strategicPraise?.length || 0} items`);
            // ----------------------------------------

            totalScore += analysisItem.score || 0;
            totalMaxMarks += question.maxMarks || 0;
            if(evalJson.overallFeedback) combinedFeedback = evalJson.overallFeedback;

            results.push({
                ...analysisItem,
                questionNumber: question.questionNumber,
                userAnswer: question.userAnswer,
                maxMarks: question.maxMarks,
                subject: routingSubject
            });
        }

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

        console.log("\n===============================================");
        console.log("--- [SUCCESS] Evaluation Complete ---");
        console.log("===============================================");
        return NextResponse.json(finalPayload);

    } catch (error: any) {
        console.error(`Evaluation Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}