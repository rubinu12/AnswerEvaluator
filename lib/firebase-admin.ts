// lib/firebase-admin.ts
// (FIXED: Now includes BOTH storageBucket AND databaseURL)

import admin from 'firebase-admin';

// 1. Get the secret from the environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// 2. Add a strong check with a clear error message if the variable is missing
if (!serviceAccountString) {
  throw new Error(
    "\nCRITICAL: 'FIREBASE_SERVICE_ACCOUNT_JSON' environment variable is not set." +
    "\nPlease create a .env.local file in your project root and add the following line:" +
    "\nFIREBASE_SERVICE_ACCOUNT_JSON='{...your service account json...}'\n"
  );
}

let serviceAccount: admin.ServiceAccount;
try {
  // 3. Parse the string content into a JSON object
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error: any) {
  // 4. Add a clear error if the JSON is badly formatted
  throw new Error(
    "\nCRITICAL: Failed to parse 'FIREBASE_SERVICE_ACCOUNT_JSON'." +
    "\nCheck your .env.local file for syntax errors (e.g., missing quotes or unescaped characters)." +
    `\nParse Error: ${error.message}\n`
  );
}

// 5. Initialize the app (only if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      
      // --- 💎 CRITICAL CONFIGURATION 💎 ---
      // We must have BOTH of these for the Hybrid Architecture to work.
      
      // 1. For Pillar 2 (Cloud Storage / Explanations)
      storageBucket: process.env.GCS_BUCKET_NAME,
      
      // 2. For Pillar 2.5 (Realtime Database / Question Index)
      databaseURL: process.env.FIREBASE_DATABASE_URL
      
      // ------------------------------------
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

const db = admin.firestore();
export { admin, db };