// app/admin/quiz/bulk-add/page.tsx
// This page is the host for our Bulk Add tool.
// It fetches the Topic Tree so we can (optionally) validate that 
// the subjects/topics your AI suggests actually exist in your system.

import { db as adminDb } from '@/lib/firebase-admin';
import { TopicTree } from '@/lib/adminTypes';
import BulkAddManager from '@/app/admin/components/BulkAddManager';

export const dynamic = 'force-dynamic';

async function getTopicTree(): Promise<TopicTree> {
  try {
    const docRef = adminDb.doc('admin/topic_tree');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return (docSnap.data()?.tree || []) as TopicTree;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch topic tree:", error);
    return [];
  }
}

export default async function BulkAddPage() {
  const topicTree = await getTopicTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Add Questions</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">AI Import Tool</h2>
          <p className="text-sm text-gray-500">
            Paste your AI-generated question batch below. The system will parse the 
            key-value format and create individual questions.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Format required: questionText, optionA-D, correctOption, subject, topic, year. 
            Separate questions with "---".
          </p>
        </div>
        
        {/* The Client Component handles all the logic */}
        <BulkAddManager topicTree={topicTree} />
      </div>
    </div>
  );
}