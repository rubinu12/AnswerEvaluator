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

    // 🖨️ TERMINAL LOG: Incoming Request
    console.log(`\n🔵 [API] Incoming Request: /api/get-questions`);
    console.log(`   👉 Params: { year: "${year}", subject: "${subject}", topic: "${topic}" }`);

    if (!subject && !year) {
      console.log(`   ❌ [API] Error: Missing required parameters.`);
      return NextResponse.json(
        { error: 'Missing parameters. Provide "subject" or "year".' },
        { status: 400 }
      );
    }

    const rtdb = admin.database();
    let sourcePath = '';

    // Routing Logic
    if (year && year !== 'all') {
      sourcePath = `public_index/by_year/${year}`;
    } else if (subject) {
      sourcePath = `public_index/by_subject/${subject}`;
    }

    console.log(`   📂 [API] RTDB Path: "${sourcePath}"`);

    // Fetch from RTDB
    const snapshot = await rtdb.ref(sourcePath).once('value');
    const questionsMap = snapshot.val();

    if (!questionsMap) {
      console.log(`   ⚠️ [API] Result: NULL (No data found at this path)`);
      // Debug: Check if the root exists?
      const rootSnapshot = await rtdb.ref('public_index').get();
      const rootKeys = rootSnapshot.exists() ? Object.keys(rootSnapshot.val() as Record<string, any>) : [];
      console.log(`   🔍 [API] Debug: Existing keys in public_index:`, rootKeys);
      
      return NextResponse.json({ count: 0, questions: [] });
    }

    let questionsList = Object.values(questionsMap);
    const initialCount = questionsList.length;

    // Filtering
    if (topic && topic !== 'all') {
        questionsList = questionsList.filter((q: any) => q.topic === topic);
    }
    if (year && subject && subject !== 'all') {
        questionsList = questionsList.filter((q: any) => q.subject === subject);
    }

    console.log(`   ✅ [API] Success: Found ${initialCount} items, Returning ${questionsList.length} after filters.`);

    return NextResponse.json({
      count: questionsList.length,
      questions: questionsList
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });

  } catch (error: any) {
    console.error('   🔥 [API] CRITICAL ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}