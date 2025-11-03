// app/api/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import { UltimateExplanation } from '@/lib/quizTypes';

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
    
    // This is our Admin check
    if (decodedToken.subscriptionStatus !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden. Admin role required.' },
        { status: 403 }
      );
    }

    // 2. Get and validate the request body
    const body = (await request.json()) as UltimateExplanation;
    if (!body.howToThink || !body.coreAnalysis || !body.takeaway) {
      return NextResponse.json(
        { message: 'Invalid explanation JSON structure.' },
        { status: 400 }
      );
    }

    // 3. Update Firestore
    const questionRef = db.collection('questions').doc(questionId);
    
    // We update only the 'explanation' field
    await questionRef.update({
      explanation: body,
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