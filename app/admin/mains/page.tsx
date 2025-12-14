// app/admin/mains/add/page.tsx
import { getTopicsList } from '@/app/actions/mains';
import MainsQuestionEditor from '@/app/admin/components/MainsQuestionEditor';

export default async function MainsAddPage() {
  const topics = await getTopicsList();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mains Studio</h1>
        <p className="text-slate-500">Create structured questions with "Digital Anatomy" answers.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <MainsQuestionEditor topics={topics} />
      </div>
    </div>
  );
}