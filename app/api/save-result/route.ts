// app/api/save-result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. Parse Payload
    const { stats, responses, filter, quizTitle } = await request.json();

    if (!stats || !responses) {
      return NextResponse.json({ error: 'Invalid Payload' }, { status: 400 });
    }

    // 3. Construct the Snapshot Document
    const attemptId = `attempt_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const snapshotData = {
      meta: {
        examId: filter.exam || filter.subject || 'custom',
        title: quizTitle || 'Practice Quiz',
        subject: filter.subject || 'Mixed',
        year: filter.year || new Date().getFullYear(),
        score: stats.finalScore,
        accuracy: stats.accuracy,
        correctCount: stats.correctCount,
        incorrectCount: stats.incorrectCount,
        unattemptedCount: stats.unattemptedCount,
        totalQuestions: stats.maxScore,
        timeTaken: stats.avgTimePerQuestion * stats.maxScore, // Approx total time
        attemptedAt: timestamp,
      },
      responses: responses // The full map of QID -> User Answer
    };

    // 4. Identify Mistakes for the Notebook
    const wrongQuestionIds: string[] = [];
    Object.entries(responses).forEach(([qId, res]: [string, any]) => {
      if (res.status === 'WRONG') {
        wrongQuestionIds.push(qId);
      }
    });

    // 5. EXECUTE WRITES (Batch for safety)
    const batch = db.batch();

    // A. Save the Snapshot
    const attemptRef = db.collection('users').doc(userId).collection('evaluations').doc(attemptId);
    batch.set(attemptRef, snapshotData);

    // B. Update "Mistake Notebook" (Aggregate)
    // We store mistakes in a central index for fast lookup
    if (wrongQuestionIds.length > 0) {
      const statsRef = db.collection('users').doc(userId).collection('stats').doc('mistakes');
      
      // Use arrayUnion to add unique IDs only
      batch.set(statsRef, {
        all_mistakes: FieldValue.arrayUnion(...wrongQuestionIds),
        last_updated: timestamp
      }, { merge: true });
    }

    await batch.commit();

    console.log(`✅ [API] Saved result for user ${userId}: ${attemptId}`);
    return NextResponse.json({ success: true, id: attemptId });

  } catch (error: any) {
    console.error('❌ [API] Save Result Failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}