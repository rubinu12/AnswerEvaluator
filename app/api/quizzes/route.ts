// app/api/quizzes/route.ts
// The Admin API for fetching quizzes.
// UPDATED: Now fetches explanations from the separate 'explanations' collection.

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { admin, db } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Question } from '@/lib/quizTypes';

// Define the structure of the question document in Firestore
interface FirestoreQuestion {
    questionText: string;
    options: {
        text: string;
        isCorrect: boolean;
    }[];
    subject: string;
    topic: string;
    year: number;
    type: 'prelims';
    // Legacy field - kept for fallback
    explanation?: {
        type: 'json' | 'image' | 'pdf';
        data: string;
    };
    exam?: string;
    examYear?: string;
}

/**
 * Transforms a question and its separate explanation data into the frontend Question type.
 */
function transformFirestoreDocToQuestion(
    docId: string, 
    docData: FirestoreQuestion, 
    explanationData: any, // The data fetched from 'explanations' collection
    index: number
): Question {
    
    const optionLabels = ['A', 'B', 'C', 'D'];
    let correctAnswer = 'A';
    
    const frontendOptions = docData.options.map((opt, i) => {
        if (opt.isCorrect) {
            correctAnswer = optionLabels[i];
        }
        return {
            label: optionLabels[i],
            text: opt.text,
        };
    });

    // --- EXPLANATION LOGIC ---
    // Priority 1: The separate 'explanations' document (The new standard)
    // Priority 2: The embedded 'explanation' field (Legacy fallback)
    // Priority 3: Default placeholder
    let finalExplanation: any = "No explanation available for this question yet.";

    if (explanationData) {
        // If it's from the separate collection, it's likely the raw JSON object (UltimateExplanation)
        finalExplanation = explanationData;
    } else if (docData.explanation) {
        // Fallback to legacy embedded data
        finalExplanation = JSON.stringify(docData.explanation);
    }
    
    return {
      id: docId,
      questionNumber: index + 1,
      text: docData.questionText,
      questionType: 'SingleChoice',
      options: frontendOptions,
      correctAnswer: correctAnswer,
      explanation: finalExplanation, 
      subject: docData.subject,
      topic: docData.topic,
      exam: docData.exam || 'UPSC',
      year: docData.year,
      examYear: docData.examYear || `${docData.exam || 'UPSC'}-${docData.year}`,
    };
}

// --- Main API Handler ---
export async function GET(request: Request) {
    let user: DecodedIdToken;

    // 1. === Authentication ===
    try {
        const authorization = (await headers()).get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
        }
        const idToken = authorization.split('Bearer ')[1];
        user = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Authentication error:", error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    // 2. === Query Firestore (Questions) ===
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const year = searchParams.get('year');
        const exam = searchParams.get('exam');

        let query: FirebaseFirestore.Query = db.collection('questions');

        if (subject) query = query.where('subject', '==', subject);
        if (topic && topic !== 'all') query = query.where('topic', '==', topic);
        if (year && year !== 'all') query = query.where('year', '==', Number(year));
        if (exam) query = query.where('exam', '==', exam);

        query = query.where('type', '==', 'prelims');

        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            return NextResponse.json({
                questions: [],
                quizTitle: "No Questions Found",
                totalTime: 0
            });
        }

        // 3. === Fetch Explanations (Parallel) ===
        // Now we fetch the corresponding explanations from the 'explanations' collection
        const questionDocs = querySnapshot.docs;
        
        // Create an array of references to the 'explanations' collection
        // matching the IDs of the questions we just found.
        const explanationRefs = questionDocs.map(doc => 
            db.collection('explanations').doc(doc.id)
        );

        // Fetch all explanations in one go (efficient)
        // db.getAll requires at least one reference, which we know we have because snapshot wasn't empty
        const explanationSnapshots = await db.getAll(...explanationRefs);

        // 4. === Transform & Merge Data ===
        const questions: Question[] = questionDocs.map((doc, index) => {
            const qData = doc.data() as FirestoreQuestion;
            const eSnap = explanationSnapshots[index];
            
            // Get explanation data if the document exists
            const eData = eSnap.exists ? eSnap.data() : null;

            return transformFirestoreDocToQuestion(
                doc.id, 
                qData, 
                eData, 
                index
            );
        });

        // 5. === Return Response ===
        const quizTitle = subject ? `${subject} - ${topic || 'All Topics'}` : 'Custom Quiz';
        const totalTime = questions.length * 120;

        return NextResponse.json({
            questions,
            quizTitle,
            totalTime,
        });

    } catch (error: any) {
        console.error(`CRITICAL: Failed to fetch questions for user ${user.uid}:`, error);
        return NextResponse.json({ 
            error: `An error occurred: ${error.message}`,
            message: "The server encountered an error while fetching questions."
        }, { status: 500 });
    }
}