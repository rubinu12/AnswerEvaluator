// app/api/get-questions/route.ts
// The "Operator" API for the Student App.
// Fetches lightweight question lists from the Realtime Database (Pillar 2.5).

import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin'; // Uses the configured Admin SDK

// Force dynamic execution so we always check the latest data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject'); // e.g., 'polity'
    const topic = searchParams.get('topic');     // e.g., 'parliament'
    const year = searchParams.get('year');       // e.g., '2023'

    // 1. Input Validation: We need at least a Subject or Year to fetch a list
    if (!subject && !year) {
      return NextResponse.json(
        { error: 'At least "subject" or "year" parameter is required.' },
        { status: 400 }
      );
    }

    const rtdb = admin.database();
    let sourcePath = '';

    // 2. Smart Routing (The "Filing Cabinet" Strategy)
    // We choose the smallest possible index to query.
    if (year) {
      // If filtering by year, go to the Year cabinet
      sourcePath = `public_index/by_year/${year}`;
    } else if (subject) {
      // If filtering by subject, go to the Subject cabinet
      sourcePath = `public_index/by_subject/${subject}`;
    }

    // 3. Fetch from Realtime Database
    // This is extremely fast because it's just reading one node
    const snapshot = await rtdb.ref(sourcePath).once('value');
    const questionsMap = snapshot.val();

    if (!questionsMap) {
      // Return empty list if no data found
      return NextResponse.json({ count: 0, questions: [] });
    }

    // 4. In-Memory Filtering
    // We convert the map to an array and apply any extra filters
    let questionsList = Object.values(questionsMap);

    // Apply 'topic' filter if it exists
    if (topic && topic !== 'all') {
        questionsList = questionsList.filter((q: any) => q.topic === topic);
    }
    
    // Apply 'subject' filter if we started with 'year' but also have a subject
    if (year && subject && subject !== 'all') {
        questionsList = questionsList.filter((q: any) => q.subject === subject);
    }

    // 5. Return the Result
    return NextResponse.json({
      count: questionsList.length,
      questions: questionsList
    }, {
      headers: {
        // Cache in browser for 60s for instant navigation
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