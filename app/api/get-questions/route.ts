// app/api/get-questions/route.ts
// The "Operator" API.
// Fetches filtered lists from Realtime Database (Pillar 2.5) to save costs.

import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

// Force dynamic so we always get fresh data for the filter
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject'); // e.g., 'polity'
    const topic = searchParams.get('topic');     // e.g., 'parliament'
    const year = searchParams.get('year');       // e.g., '2023'

    // 1. Input Validation
    // We require at least one major filter to prevent downloading the whole DB
    if (!subject && !year) {
      return NextResponse.json(
        { error: 'At least "subject" or "year" parameter is required.' },
        { status: 400 }
      );
    }

    const rtdb = admin.database();
    let questionsMap: Record<string, any> = {};
    let source = '';

    // 2. Smart Fetching Strategy (Priority: Year > Subject)
    // We pick the smallest possible "drawer" to open from the RTDB.
    
    if (year) {
      // Strategy A: Fetch by Year (approx 100 questions - Very Fast)
      source = `public_index/by_year/${year}`;
    } else if (subject) {
      // Strategy B: Fetch by Subject (approx 200-500 questions - Fast)
      source = `public_index/by_subject/${subject}`;
    }

    // Execute the fetch
    const snapshot = await rtdb.ref(source).once('value');
    questionsMap = snapshot.val() || {};

    // 3. Convert to Array & Apply Secondary Filters
    // We do this in memory on the server (super fast) so the user gets exact results.
    let questionsList = Object.values(questionsMap);

    if (year) {
        questionsList = questionsList.filter((q: any) => String(q.year) === String(year));
    }
    
    if (subject) {
        questionsList = questionsList.filter((q: any) => q.subject === subject);
    }

    if (topic) {
        questionsList = questionsList.filter((q: any) => q.topic === topic);
    }

    // 4. Return the Lightweight List
    return NextResponse.json({
      count: questionsList.length,
      questions: questionsList
    }, {
      headers: {
        // Cache this response in the browser for 60 seconds to make the app feel instant
        // if the user switches tabs and comes back.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' 
      }
    });

  } catch (error: any) {
    console.error('GET_QUESTIONS_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}