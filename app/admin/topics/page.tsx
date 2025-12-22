import TopicManagerClient from '@/app/admin/components/TopicManagerClient';
import { getTopicTree } from '@/app/actions/topics';

export default async function TopicStudioPage() {
  const topics = await getTopicTree();

  return (
    <div className="min-h-screen bg-slate-50">
      <TopicManagerClient initialTopics={topics} />
    </div>
  );
}