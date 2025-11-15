// app/admin/topics/page.tsx
// No changes here, just showing it for context.
// It loads the TopicTreeManager component which we are updating.

import TopicTreeManager from '@/app/admin/components/TopicTreeManager';

export default function MasterTopicTreePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Master Topic Tree</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Syllabus Manager</h2>
          <p className="text-sm text-gray-500">
            This is the foundation of your entire platform. Add, edit, or delete
            topics to build your "micro-syllabus".
          </p>
          <p className="text-sm text-gray-500">
            All content (Prelims, Mains, Lexicon, etc.) will be tagged using
            this tree.
          </p>
        </div>
        
        {/* We load the main client component that holds all the logic. */}
        {/* This component is being updated to include the bulk-add feature. */}
        <TopicTreeManager />
      </div>
    </div>
  );
}