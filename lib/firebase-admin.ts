// lib/firebase-admin.ts
// (FIX: Added 'databaseURL' to the config)

import admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountString) {
  throw new Error(
    "\nCRITICAL: 'FIREBASE_SERVICE_ACCOUNT_JSON' environment variable is not set.\n"
  );
}

let serviceAccount: admin.ServiceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error: any) {
  throw new Error(
    "\nCRITICAL: Failed to parse 'FIREBASE_SERVICE_ACCOUNT_JSON'.\n" +
    `\nParse Error: ${error.message}\n`
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.GCS_BUCKET_NAME,
      
      // --- THIS IS THE NEW FIX ---
      databaseURL: process.env.FIREBASE_DATABASE_URL
      // --- END OF FIX ---
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

const db = admin.firestore();
export { admin, db };