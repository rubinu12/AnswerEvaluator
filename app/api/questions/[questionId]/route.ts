// app/api/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin'; // "Perfectly" using your exact imports
import {
  UltimateExplanation,
  QuestionType, // "Perfect" import for our new body
} from '@/lib/quizTypes';
import { FieldValue } from 'firebase-admin/firestore'; // "Perfect" import for data hygiene

/**
 * Admin-only API route to update a question's explanation.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { questionId } = params;
    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required.' },
        { status: 400 }
      );
    }

    // 1. Verify Admin Authentication (Your "perfect" logic, "perfectly" kept)
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // This is our Admin check
    if (decodedToken.subscriptionStatus !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden. Admin role required.' },
        { status: 403 }
      );
    }

    // 2. "PERFECT" UPGRADE: Get and validate the new "Master Plan" body
    const body = (await request.json()) as {
      explanation: UltimateExplanation;
      questionType: QuestionType;
    };

    const { explanation, questionType } = body;

    // "Perfectly" upgraded validation logic
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

    // "Perfectly" check for at least one "Master Plan" analysis block
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

    // 3. "PERFECT" UPGRADE: Update Firestore with "Master Plan" schema
    const questionRef = db.collection('questions').doc(questionId);

    // We "perfectly" update all fields granularly for "robust" data saving.
    // This is our new "perfect" update logic.
    await questionRef.update({
      // Update the questionType from the "Command Center"
      questionType: questionType,

      // "Perfect" common fields
      'explanation.howToThink': explanation.howToThink,
      'explanation.adminProTip': explanation.adminProTip,
      'explanation.takeaway': explanation.takeaway,
      'explanation.visualAid': explanation.visualAid || null,
      'explanation.hotspotBank': explanation.hotspotBank || [],

      // "Perfect" new schema-specific fields
      'explanation.singleChoiceAnalysis':
        explanation.singleChoiceAnalysis || null,
      'explanation.howManyAnalysis': explanation.howManyAnalysis || null,
      'explanation.matchTheListAnalysis':
        explanation.matchTheListAnalysis || null,

      // "PERFECT" DATA HYGIENE:
      // We "perfectly" delete the old "cramped" field from Firestore.
      'explanation.coreAnalysis': FieldValue.delete(),
    });

    return NextResponse.json(
      { message: 'Explanation updated successfully.' },
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