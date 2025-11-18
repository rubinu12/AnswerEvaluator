// app/api/get-key/route.ts
// The "Keymaster" API.
// Securely delivers the encryption key to authenticated, rate-limited users.

import { NextRequest, NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Force this route to be dynamic so it always runs the checks
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    
    // Decode the token to get the User ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. (Optional) Check Subscription Status
    // You can uncomment this when you have a 'users' collection with payment info
    /*
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists && !userDoc.data()?.isPaid) {
       return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }
    */

    // 3. RATE LIMITING (The "Scraper Defense")
    // We track requests in a 'rate_limits' collection in Firestore
    const rateLimitRef = db.collection('rate_limits').doc(userId);
    const now = Timestamp.now();
    const oneHourAgo = new Timestamp(now.seconds - 3600, 0); // 1 hour ago

    const docSnap = await rateLimitRef.get();
    let rateData = docSnap.data();

    // If no record exists, or the record is older than 1 hour, reset the counter
    if (!rateData || rateData.startTime < oneHourAgo) {
      rateData = { count: 1, startTime: now };
      await rateLimitRef.set(rateData);
    } else {
      // Check the limit (e.g., 50 requests per hour is plenty for a real user)
      if (rateData.count > 50) {
        console.warn(`Rate limit exceeded for user ${userId}`);
        return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
      }
      
      // Increment the counter
      await rateLimitRef.update({ count: rateData.count + 1 });
    }

    // 4. Retrieve the Master Key
    const masterKey = process.env.MASTER_ENCRYPTION_KEY;
    if (!masterKey) {
      console.error('CRITICAL: MASTER_ENCRYPTION_KEY is missing on server.');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    // 5. Return the Key
    // The client will store this in memory to decrypt explanations
    return NextResponse.json({ key: masterKey });

  } catch (error) {
    console.error('Keymaster API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}