// app/admin/topics/page.tsx
import { getTopicList } from '@/app/actions/topics';
import TopicManagerClient from '@/app/admin/components/TopicManagerClient';

export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  const topics = await getTopicList();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Master Topic Tree</h1>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded border">
          Total Nodes: <span className="font-bold text-slate-900">{topics.length}</span>
        </div>
      </div>
      
      {/* Interactive Client Component */}
      <TopicManagerClient initialTopics={topics} />
    </div>
  );
}