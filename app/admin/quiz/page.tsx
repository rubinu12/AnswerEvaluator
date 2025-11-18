// app/admin/quiz/page.tsx
// This is the new "home" for your Quiz Engine.
// It's a server component that fetches ALL questions and explanation IDs
// to build our initial list and "to-do" list.

import { collection, getDocs, doc } from 'firebase/firestore';
// We must use the admin db here for server-side fetching
import { db as adminDb } from '@/lib/firebase-admin'; // FIXED PATH
import { TopicTree, FirestoreQuestion, MergedQuestion } from '@/lib/adminTypes'; // FIXED PATH
import QuestionListManager from '../components/QuestionListManager'; // FIXED PATH

// We must use 'force-dynamic' to ensure this admin page
// always fetches fresh data from the server.
export const dynamic = 'force-dynamic';

async function getQuestionsWithExplanationStatus(): Promise<MergedQuestion[]> {
  try {
    // 1. Fetch all documents from 'questions'
    const questionsRef = adminDb.collection('questions');
    // We filter for 'prelims' type as this is the Prelims Quiz Engine
    const questionsSnapshot = await questionsRef.where('type', '==', 'prelims').get();

    // 2. Fetch all document IDs from 'explanations'
    // We only fetch IDs for maximum efficiency
    const explanationsRef = adminDb.collection('explanations');
    const explanationsSnapshot = await explanationsRef.get();
    
    // Create a Set of all IDs that have an explanation
    const explanationIds = new Set<string>();
    explanationsSnapshot.forEach((doc) => {
      explanationIds.add(doc.id);
    });

    // 3. Merge the data
    const mergedQuestions: MergedQuestion[] = [];
    questionsSnapshot.forEach((doc) => {
      const questionData = doc.data() as Omit<FirestoreQuestion, 'id'>;
      mergedQuestions.push({
        id: doc.id,
        ...questionData,
        // This is our "To-Do List" flag!
        hasExplanation: explanationIds.has(doc.id),
      });
    });

    // Sort by year, newest first
    mergedQuestions.sort((a, b) => (b.year || 0) - (a.year || 0));

    return mergedQuestions;
  } catch (error) {
    console.error("Failed to fetch merged questions:", error);
    return []; // Return empty on error
  }
}

async function getTopicTree(): Promise<TopicTree> {
  try {
    const docRef = adminDb.doc('admin/topic_tree');
    const docSnap = await docRef.get();
    
    // --- THIS IS THE FIX ---
    // 'exists' is a boolean property in the admin-sdk, not a function
    if (docSnap.exists) {
    // --- END OF FIX ---
      return (docSnap.data()?.tree || []) as TopicTree;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch topic tree:", error);
    return [];
  }
}

export default async function QuizAdminPage() {
  // This function runs on the server and fetches all data
  // We use Promise.all to fetch in parallel for speed
  const [allQuestions, topicTree] = await Promise.all([
    getQuestionsWithExplanationStatus(),
    getTopicTree(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Prelims Quiz Engine</h1>
      
      {/* We pass the server-fetched data to the client component,
        which will handle all the filtering, pagination, and modals.
      */}
      <QuestionListManager 
        allQuestions={allQuestions}
        topicTree={topicTree} 
      />
    </div>
  );
}