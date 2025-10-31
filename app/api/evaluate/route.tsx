// app/api/evaluate/route.tsx

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { VertexAI } from '@google-cloud/vertexai';
import { getPromptForSubject } from '@/lib/prompts';
import { admin, db } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// --- Initialize Vertex AI ---
const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID!,
    location: 'us-central1',
});

const geminiModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
});

// --- Helper function (no changes) ---
function extractJsonFromText(text: string): string | null {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) return markdownMatch[1].trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) return text.substring(firstBrace, lastBrace + 1);
    return null;
}

// --- Main API Handler with Diagnostic Logging ---
export async function POST(request: Request) {
    console.log("\n--- [START] /api/evaluate request received ---");
    let user: DecodedIdToken;

    try {
        console.log("[1/7] Authenticating user...");
        const authorization = (await headers()).get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            console.error("Authentication failed: No token provided.");
            return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
        }
        const idToken = authorization.split('Bearer ')[1];
        user = await admin.auth().verifyIdToken(idToken);
        console.log(`[2/7] User authenticated successfully: ${user.uid}`);

    } catch (error) {
        console.error("CRITICAL: Authentication error:", error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    try {
        const { preparedData, subject } = await request.json();
        const evaluationCost = preparedData.length;

        if (!preparedData || !Array.isArray(preparedData) || evaluationCost === 0) {
            console.error("Validation failed: No prepared data.");
            return NextResponse.json({ error: 'No prepared evaluation data provided.' }, { status: 400 });
        }
        console.log(`[3/7] Request validated. Evaluation cost: ${evaluationCost}`);

        const userDocRef = db.collection('users').doc(user.uid);

        console.log("[4/7] Starting Firestore transaction...");
        await db.runTransaction(async (transaction) => {
            console.log("  -> Inside transaction: getting user document...");
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists) {
                throw new Error('User profile not found in database.');
            }

            const profile = userDoc.data();
            console.log(`  -> User profile found: Status=${profile?.subscriptionStatus}, Remaining=${profile?.remainingEvaluations}`);
            
            if (profile?.subscriptionStatus !== 'PREMIUM' && profile?.subscriptionStatus !== 'ADMIN') {
                if (profile?.remainingEvaluations < evaluationCost) {
                    throw new Error(`Insufficient evaluations. Required: ${evaluationCost}, Available: ${profile?.remainingEvaluations}`);
                }
                console.log(`  -> Decrementing evaluations for user ${user.uid} by ${evaluationCost}`);
                transaction.update(userDocRef, {
                    remainingEvaluations: admin.firestore.FieldValue.increment(-evaluationCost)
                });
            } else {
                 console.log(`  -> User is ${profile?.subscriptionStatus}. Skipping decrement.`);
            }
        });
        console.log("[5/7] Firestore transaction successful.");

        const evaluationPrompt = getPromptForSubject(subject || 'GS1', preparedData);
        
        console.log("[6/7] Sending request to Gemini AI...");
        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
        });
        console.log("[7/7] Received response from Gemini AI.");

        const rawResponseText = result.response.candidates?.[0]?.content.parts[0].text;

        if (!rawResponseText) {
            throw new Error("AI returned an empty response.");
        }

        const jsonString = extractJsonFromText(rawResponseText);
        
        if (!jsonString) {
            console.error("CRITICAL: Failed to extract JSON from AI response:", rawResponseText);
            throw new Error("The AI returned an invalid format.");
        }

        const evaluationJson = JSON.parse(jsonString);
        
        console.log("--- [SUCCESS] Returning final evaluation JSON ---");
        return NextResponse.json(evaluationJson);

    } catch (error: any) {
        console.error(`--- [CRITICAL FAILURE] Error in evaluation pipeline for user ${user.uid}:`, error);
        return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
    }
}