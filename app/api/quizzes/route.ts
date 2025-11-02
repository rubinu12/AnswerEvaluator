// app/api/quizzes/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { admin, db } from '@/lib/firebase-admin'; // Using your existing admin setup
import { DecodedIdToken } from 'firebase-admin/auth';
import { Question } from '@/lib/quizTypes'; // Import the frontend type

// Define the structure of the question document in Firestore
// Based on app/admin/components/BulkAddModal.tsx
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
    // --- This is the new flexible explanation field ---
    // We will build the system to save data here in Phase 2
    explanation?: {
        type: 'json' | 'image' | 'pdf';
        data: string; // This will be the JSON blob or the public URL
    };
    // Add other fields like 'exam' if they exist
    exam?: string;
    examYear?: string;
}

/**
 * Transforms a question from its Firestore data structure to the 
 * frontend 'Question' type defined in lib/quizTypes.ts.
 */
function transformFirestoreDocToQuestion(
    docId: string, 
    docData: FirestoreQuestion, 
    index: number
): Question {
    
    const optionLabels = ['A', 'B', 'C', 'D'];
    let correctAnswer = 'A'; // Default
    
    // Find the correct answer and map options to the frontend structure
    const frontendOptions = docData.options.map((opt, i) => {
        if (opt.isCorrect) {
            correctAnswer = optionLabels[i];
        }
        return {
            label: optionLabels[i],
            text: opt.text,
        };
    });

    // --- This is the key logic ---
    // If the 'explanation' field exists and is valid, pass it to the frontend.
    // Otherwise, pass a placeholder. This is how we'll load the solution.
    let explanationData = "No explanation available for this question yet.";
    if (docData.explanation) {
        // For now, we'll just pass the raw data.
        // In the future, the frontend will parse this.
        explanationData = JSON.stringify(docData.explanation);
    }
    
    return {
        id: docId,
        questionNumber: index + 1,
        text: docData.questionText,
        options: frontendOptions,
        correctAnswer: correctAnswer,
        explanation: explanationData, // Pass the explanation data
        subject: docData.subject,
        topic: docData.topic,
        exam: docData.exam || 'UPSC', // Default
        year: docData.year,
        examYear: docData.examYear || `${docData.exam || 'UPSC'}-${docData.year}`,
    };
}


// --- Main API Handler ---
export async function GET(request: Request) {
    let user: DecodedIdToken;

    // 1. === Authentication ===
    // Using the exact pattern from your /api/evaluate route
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

    // 2. === Query Firestore ===
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const year = searchParams.get('year');
        const exam = searchParams.get('exam');

        // Start building the query on the 'questions' collection
        let query: FirebaseFirestore.Query = db.collection('questions');

        // Apply filters based on search parameters
        if (subject) {
            query = query.where('subject', '==', subject);
        }
        if (topic && topic !== 'all') {
            query = query.where('topic', '==', topic);
        }
        if (year && year !== 'all') {
            query = query.where('year', '==', Number(year));
        }
        if (exam) {
            query = query.where('exam', '==', exam);
        }

        // We only want 'prelims' questions
        query = query.where('type', '==', 'prelims');

        // --- Execute the query ---
        const querySnapshot = await query.get();

        if (querySnapshot.empty) {
            console.warn(`No questions found for filter:`, { subject, topic, year, exam });
            return NextResponse.json({
                error: "No questions found for your selection.",
                message: "No questions were found for this filter."
            }, { status: 404 });
        }

        // 3. === Transform Data for Frontend ===
        const questions: Question[] = [];
        let index = 0;
        querySnapshot.forEach((doc) => {
            questions.push(
                transformFirestoreDocToQuestion(
                    doc.id, 
                    doc.data() as FirestoreQuestion, 
                    index++
                )
            );
        });

        // 4. === Return Successful Response ===
        const quizTitle = subject ? `${subject} - ${topic || 'All Topics'}` : 'Custom Quiz';
        const totalTime = questions.length * 120; // 2 minutes per question

        return NextResponse.json({
            questions,
            quizTitle,
            totalTime,
        });

    } catch (error: any) {
        console.error(`CRITICAL: Failed to fetch questions for user ${user.uid}:`, error);
        return NextResponse.json({ 
            error: `An error occurred: ${error.message}`,
            message: "The server encountered an error while fetching questions. Please try again."
        }, { status: 500 });
    }
}