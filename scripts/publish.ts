// scripts/publish.ts
// 🛡️ CRASH-PROOF VERSION: Automatically removes 'undefined' values to satisfy RTDB.

import { db, admin } from '../lib/firebase-admin'; 
import { createCipheriv, randomBytes } from 'crypto';

// --- CONFIGURATION ---
const key = Buffer.from(process.env.MASTER_ENCRYPTION_KEY!, 'utf-8');
if (key.length !== 32) {
  console.error('❌ CRITICAL: MASTER_ENCRYPTION_KEY must be 32 bytes.');
  process.exit(1);
}

const bucket = admin.storage().bucket();
if (!bucket.name) {
  console.error('❌ CRITICAL: GCS_BUCKET_NAME is not set or firebase-admin failed to initialize.');
  process.exit(1);
}

const rtdb = admin.database();
const rtdbIndexRef = rtdb.ref('public_index');

const algorithm = 'aes-256-cbc';
// --- END CONFIGURATION ---

function encrypt(text: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

async function uploadToGCS(destination: string, data: string | Buffer, contentType: string) {
  const file = bucket.file(destination);
  await file.save(data, {
    metadata: {
      contentType: contentType,
      cacheControl: 'public, max-age=60',
    },
  });
}

/**
 * 🧹 SANITIZER UTILITY
 * RTDB crashes if you send 'undefined'. This removes those keys.
 */
function cleanObject(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

/**
 * Fetches all questions from Firestore and strips sensitive/undefined data.
 */
async function getQuestionsForStudentApp() {
  const questionsRef = db.collection('questions');
  // Fetching ONLY prelims to match your data model
  const snapshot = await questionsRef.where('type', '==', 'prelims').get();
  
  const questionsClean: any[] = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // 1. Construct the raw object
    // We use || "" to fallback to empty string instead of undefined for critical strings
    const rawQ: any = {
      id: doc.id,
      questionText: data.questionText || data.question || "Error: Text missing",
      
      // Options: Ensure we handle cases where options might be missing
      options: data.options || [
        { label: 'A', text: data.optionA || '' },
        { label: 'B', text: data.optionB || '' },
        { label: 'C', text: data.optionC || '' },
        { label: 'D', text: data.optionD || '' },
      ],
      
      // 🛡️ FIX: Default to "" if missing. RTDB will accept empty string.
      correctOption: data.correctOption || data.correctAnswer || data.answer || "",
      
      subject: data.subject || "Uncategorized",
      topic: data.topic || "General",
      exam: data.exam || "UPSC",
      year: data.year || new Date().getFullYear(), // Default to current year if missing
      
      // Placeholder for UI logic
      explanation: "Tap 'View Solution' to load explanation." 
    };

    // Optional fields: Add them only if they exist
    if (data.questionType) rawQ.questionType = data.questionType;
    if (data.handwrittenNoteUrl) rawQ.handwrittenNoteUrl = data.handwrittenNoteUrl;
    
    // 2. Clean the object (Remove any remaining undefineds)
    questionsClean.push(cleanObject(rawQ));
  });
  
  return questionsClean;
}

async function getExplanations() {
  const snapshot = await db.collection('explanations').get();
  const explanations: Record<string, any> = {};
  snapshot.forEach(doc => {
    explanations[doc.id] = doc.data();
  });
  return explanations;
}

async function getTopicTree() {
  const docRef = db.doc('admin/topic_tree');
  const docSnap = await docRef.get();
  return docSnap.exists ? docSnap.data()?.tree || [] : [];
}

async function publish() {
  console.log('🚀 Starting Crash-Proof Publish Script...');
  
  try {
    // --- JOB 1: CLEAR OLD DATA ---
    console.log('Step 1: Clearing old data from Realtime Database...');
    await rtdbIndexRef.set(null);
    console.log('✅ RTDB cleared.');

    // --- JOB 2: FETCH DATA ---
    console.log('Step 2: Fetching and Sanitizing data from Firestore...');
    const [topicTree, studentQuestions, allExplanations] = await Promise.all([
      getTopicTree(),
      getQuestionsForStudentApp(),
      getExplanations(),
    ]);
    console.log(`✅ Fetched & Sanitized: ${studentQuestions.length} questions.`);

    // --- JOB 3: UPLOAD TO STORAGE ---
    console.log('Step 3: Uploading files to Cloud Storage...');
    
    await uploadToGCS(
      'topic_tree.json',
      JSON.stringify(topicTree),
      'application/json'
    );

    const encryptionJobs = Object.entries(allExplanations).map(async ([id, explanationData]) => {
      const plainText = JSON.stringify(explanationData);
      const encryptedData = encrypt(plainText);
      
      await uploadToGCS(
        `explanations/${id}.dat`,
        encryptedData,
        'application/octet-stream'
      );
    });
    await Promise.all(encryptionJobs);
    console.log(`✅ Cloud Storage: Uploaded topic tree and ${encryptionJobs.length} explanations.`);

    // --- JOB 4: SYNC TO RTDB ---
    console.log('Step 4: Building and syncing new indexes to Realtime Database...');
    
    const bySubjectIndex: Record<string, any> = {};
    const byYearIndex: Record<string, any> = {};

    for (const q of studentQuestions) {
      // Add to "by_subject" index
      // (We already sanitized q.subject to default to "Uncategorized" if missing)
      const subj = q.subject;
      if (!bySubjectIndex[subj]) {
        bySubjectIndex[subj] = {};
      }
      bySubjectIndex[subj][q.id] = q;

      // Add to "by_year" index
      const yearKey = String(q.year);
      if (!byYearIndex[yearKey]) {
        byYearIndex[yearKey] = {};
      }
      byYearIndex[yearKey][q.id] = q;
    }

    const publicIndex = {
      by_subject: bySubjectIndex,
      by_year: byYearIndex,
    };

    await rtdbIndexRef.set(publicIndex);
    console.log('✅ Realtime Database sync complete.');

    console.log('\n🎉 PUBLISH COMPLETE! 🎉');
    process.exit(0);

  } catch (error) {
    console.error('❌ PUBLISH FAILED:', error);
    process.exit(1);
  }
}

publish();