// app/api/get-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const year = searchParams.get('year');

    if (!subject && !year) {
      return NextResponse.json(
        { error: 'Missing parameters. Provide "subject" or "year".' },
        { status: 400 }
      );
    }

    const rtdb = admin.database();
    let sourcePath = '';

    if (year && year !== 'all') {
      sourcePath = `public_index/by_year/${year}`;
    } else if (subject) {
      sourcePath = `public_index/by_subject/${subject}`;
    }

    const snapshot = await rtdb.ref(sourcePath).once('value');
    const questionsMap = snapshot.val();

    if (!questionsMap) {
      return NextResponse.json({ count: 0, questions: [] });
    }

    let questionsList = Object.values(questionsMap);

    if (topic && topic !== 'all') {
        questionsList = questionsList.filter((q: any) => q.topic === topic);
    }
    if (year && subject && subject !== 'all') {
        questionsList = questionsList.filter((q: any) => q.subject === subject);
    }

    return NextResponse.json({
      count: questionsList.length,
      questions: questionsList
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}