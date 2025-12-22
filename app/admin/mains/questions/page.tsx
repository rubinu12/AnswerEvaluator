import QuestionStudioClient from '@/app/admin/components/QuestionStudioClient';
import { getTopicTree } from '@/app/actions/topics';
import { getQuestionsForReview } from '@/app/actions/questions';

export default async function QuestionStudioPage() {
  const [topics, initialQuestions] = await Promise.all([
    getTopicTree(),
    getQuestionsForReview()
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <QuestionStudioClient 
        initialTopics={topics} 
        initialQuestions={initialQuestions} 
      />
    </div>
  );
}