// app/api/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin'; // "Perfectly" using your exact imports
import {
  UltimateExplanation,
  QuestionType,
} from '@/lib/quizTypes';
import { FieldValue } from 'firebase-admin/firestore';

// This line forces the route to be 100% dynamic,
// which resolves the "params should be awaited" warning.
export const dynamic = 'force-dynamic';

// We define the context type for clarity
type RouteContext = {
  params: {
    questionId: string;
  };
};

/**
 * ==================================================================
 * --- 💎 GET Function (FIXED to read from BOTH collections) 💎 ---
 * ==================================================================
 */
export async function GET(
  request: NextRequest,
  context: RouteContext 
) {
  try {
    const { questionId } = context.params; 
    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required.' },
        { status: 400 }
      );
    }

    // 1. Verify Admin Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized.' },
        { status: 401 }
      );
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDocRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists || userDoc.data()?.subscriptionStatus !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden. Admin role required.' },
        { status: 403 }
      );
    }

    // 2. --- NEW LOGIC: Fetch from BOTH collections ---
    const questionRef = db.collection('questions').doc(questionId);
    const explanationRef = db.collection('explanations').doc(questionId);

    // Fetch in parallel
    const [questionSnap, explanationSnap] = await Promise.all([
      questionRef.get(),
      explanationRef.get(),
    ]);

    if (!questionSnap.exists) {
      return NextResponse.json(
        { message: 'Question not found.' },
        { status: 404 }
      );
    }

    const questionData = questionSnap.data();
    let explanationData = null;

    // Check if the explanation *document* exists
    if (explanationSnap.exists) {
      // The entire document IS the explanation object
      explanationData = explanationSnap.data(); 
    }
    // --- END OF NEW LOGIC ---

    // 3. Return the MERGED data
    // The page.tsx file expects a single object
    return NextResponse.json(
      {
        _id: questionSnap.id,
        ...questionData,
        // We add the explanation object to the response.
        // If it was null, page.tsx will handle it.
        explanation: explanationData, 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API_QUESTIONS_GET_ERROR:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { message: 'Token expired. Please log in again.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
// ==================================================================
// --- 💎 END OF GET Function 💎 ---
// ==================================================================


/**
 * ==================================================================
 * --- 💎 PATCH Function (FIXED to write to BOTH collections) 💎 ---
 * ==================================================================
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { questionId } = context.params;
    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required.' },
        { status: 400 }
      );
    }

    // 1. Verify Admin Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized.' },
        { status: 401 }
      );
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDocRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists || userDoc.data()?.subscriptionStatus !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden. Admin role required.' },
        { status: 403 }
      );
    }

    // 2. Get and validate the new "Master Plan" body
    const body = (await request.json()) as {
      explanation: UltimateExplanation;
      questionType: QuestionType;
    };

    const { explanation, questionType } = body;

    // (Validation logic is unchanged and correct)
    if (
      !explanation.howToThink ||
      !explanation.adminProTip ||
      !explanation.takeaway
    ) {
      return NextResponse.json(
        {
          message:
            'Invalid explanation JSON structure. Missing common fields.',
        },
        { status: 400 }
      );
    }
    if (
      !explanation.singleChoiceAnalysis &&
      !explanation.howManyAnalysis &&
      !explanation.matchTheListAnalysis
    ) {
      return NextResponse.json(
        { message: 'Invalid explanation JSON. Missing analysis block.' },
        { status: 400 }
      );
    }

    // 3. --- NEW LOGIC: Write to BOTH collections ---
    const questionRef = db.collection('questions').doc(questionId);
    const explanationRef = db.collection('explanations').doc(questionId);

    // We run these operations in parallel for speed
    await Promise.all([
      // 1. Update the 'questionType' in the 'questions' collection
      questionRef.update({
        questionType: questionType,
        // We also delete the old legacy field, just in case
        explanationText: FieldValue.delete(),
      }),
      
      // 2. Set the *entire* 'explanation' object as the document
      //    in the 'explanations' collection.
      //    .set() will create the doc if it doesn't exist.
      explanationRef.set(explanation) 
    ]);
    // --- END OF NEW LOGIC ---

    return NextResponse.json(
      { message: 'Explanation saved successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API_QUESTIONS_PATCH_ERROR:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { message: 'Token expired. Please log in again.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}