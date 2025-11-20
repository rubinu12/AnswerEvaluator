// lib/firebase-admin.ts
// 🛡️ ARCHITECT UPDATE: Hardened Env Validation for Pillar 2.5

import admin from 'firebase-admin';

// 1. Get the secret from the environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// 2. Validate Service Account
if (!serviceAccountString) {
  throw new Error(
    "\n❌ CRITICAL ERROR: 'FIREBASE_SERVICE_ACCOUNT_JSON' is missing." +
    "\nThis is required for the Admin SDK to function." +
    "\nPlease check your .env.local file.\n"
  );
}

let serviceAccount: admin.ServiceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error: any) {
  throw new Error(
    "\n❌ CRITICAL ERROR: Failed to parse 'FIREBASE_SERVICE_ACCOUNT_JSON'." +
    `\nParse Error: ${error.message}\n`
  );
}

// 3. 💎 Validate Hybrid Architecture Config 💎
// We MUST have the Database URL for the Student App (RTDB) to work.
const databaseURL = process.env.FIREBASE_DATABASE_URL;
const storageBucket = process.env.GCS_BUCKET_NAME;

if (!databaseURL) {
  throw new Error(
    "\n❌ CRITICAL ERROR: 'FIREBASE_DATABASE_URL' is missing." +
    "\nThe Student App requires this to connect to the Realtime Database (Pillar 2.5)." +
    "\nAdd this to your .env.local (e.g., https://your-project-id-default-rtdb.firebaseio.com)\n"
  );
}

// 4. Initialize the app (Singleton Pattern)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL, // Required for admin.database()
      storageBucket: storageBucket, // Required for admin.storage()
    });
    console.log("✅ Firebase Admin Initialized (Hybrid Mode Active)");
  } catch (error: any) {
    console.error('❌ Firebase Admin Initialization Failed:', error.message);
    // We don't throw here to avoid crashing the whole build if only one part fails,
    // but the individual services will fail if accessed.
  }
}

const db = admin.firestore();
// We export the raw admin to access .database() and .storage() elsewhere
export { admin, db };