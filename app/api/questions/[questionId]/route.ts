// app/api/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import {
  UltimateExplanation,
  QuestionType,
  isUltimateExplanation, // <-- Import our type guard
} from '@/lib/quizTypes';
import { FieldValue } from 'firebase-admin/firestore';

// This line forces the route to be 100% dynamic
export const dynamic = 'force-dynamic';

// We define the context type for clarity
type RouteContext = {
  params: {
    questionId: string;
  };
};

/**
 * ==================================================================
 * --- GET Function (This was already correct, no changes) ---
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

    // 2. Fetch from BOTH collections
    const questionRef = db.collection('questions').doc(questionId);
    const explanationRef = db.collection('explanations').doc(questionId);

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

    if (explanationSnap.exists) {
      explanationData = explanationSnap.data();
    }

    // 3. Return the MERGED data
    return NextResponse.json(
      {
        _id: questionSnap.id,
        ...questionData,
        // Add the explanation object. If it's null, the client handles it.
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

/**
 * ==================================================================
 * --- 💎 PATCH Function (FIXED to validate our "v4" schema) 💎 ---
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

    // 1. Verify Admin Authentication (Unchanged)
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

    // 2. Get and validate the new "v4" body
    const body = (await request.json()) as {
      explanation: UltimateExplanation;
      questionType?: QuestionType; // Make questionType optional
    };

    const { explanation, questionType } = body;

    // --- 💎 NEW "V4" VALIDATION LOGIC 💎 ---
    // We use our type guard to check for the "soulful" keys
    if (!isUltimateExplanation(explanation)) {
      return NextResponse.json(
        {
          message:
            'Invalid explanation JSON structure. Missing "soulful" fields (howToThink, coreAnalysis, adminProTip).',
        },
        { status: 400 }
      );
    }
    // --- 💎 END OF NEW VALIDATION LOGIC 💎 ---

    // 3. Write to BOTH collections
    const questionRef = db.collection('questions').doc(questionId);
    const explanationRef = db.collection('explanations').doc(questionId);

    const questionUpdateData: { [key: string]: any } = {
      // We also delete the old legacy field
      explanationText: FieldValue.delete(),
    };

    // Only update questionType if it was provided
    if (questionType) {
      questionUpdateData.questionType = questionType;
    }

    await Promise.all([
      // 1. Update the 'questions' collection
      questionRef.update(questionUpdateData),

      // 2. Set the *entire* 'explanation' object as the document
      //    in the 'explanations' collection.
      explanationRef.set(explanation),
    ]);
    // --- END OF WRITE LOGIC ---

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