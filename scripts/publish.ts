// scripts/publish.ts
// (FIXED: Now sanitizes data to remove 'undefined' values before sending to RTDB)

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
 * Fetches all questions from Firestore and strips sensitive/undefined data.
 */
async function getQuestionsLight() {
  const questionsRef = db.collection('questions');
  const snapshot = await questionsRef.where('type', '==', 'prelims').get();
  
  const questionsLight: any[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // --- FIX: Create a clean object to avoid 'undefined' errors ---
    const q: any = {
      id: doc.id,
      questionText: data.questionText.substring(0, 150) + '...',
      subject: data.subject,
      topic: data.topic,
      exam: data.exam,
      year: data.year,
    };

    // Only add these if they truly exist. 
    // If data.questionType is undefined, we simply don't add the key.
    if (data.questionType) q.questionType = data.questionType;
    if (data.difficulty) q.difficulty = data.difficulty;
    if (data.paperQuestionNumber) q.paperQuestionNumber = data.paperQuestionNumber;
    
    questionsLight.push(q);
  });
  return questionsLight;
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
  console.log('🚀 Starting "Giant Product" Publish Script...');
  console.log(`Targeting GCS Bucket: ${bucket.name}`);
  
  try {
    // --- JOB 1: CLEAR OLD DATA ---
    console.log('Step 1: Clearing old data from Realtime Database...');
    await rtdbIndexRef.set(null);
    console.log('✅ RTDB cleared.');

    // --- JOB 2: FETCH DATA ---
    console.log('Step 2: Fetching all data from Firestore...');
    const [topicTree, questionsLight, allExplanations] = await Promise.all([
      getTopicTree(),
      getQuestionsLight(),
      getExplanations(),
    ]);
    console.log(`✅ Fetched: ${questionsLight.length} questions.`);

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

    for (const q of questionsLight) {
      // Add to "by_subject" index
      if (!bySubjectIndex[q.subject]) {
        bySubjectIndex[q.subject] = {};
      }
      bySubjectIndex[q.subject][q.id] = q;

      // Add to "by_year" index
      // Ensure year is a string key for RTDB
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

  } catch (error) {
    console.error('❌ PUBLISH FAILED:', error);
    process.exit(1);
  }
}

publish();