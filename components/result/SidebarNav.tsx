// app/components/result/SidebarNav.tsx
'use client';

interface SidebarNavProps {
  overallScore: number;
  totalMarks: number;
  questionAnalyses: Array<{
    questionNumber: number;
    score: number;
    maxMarks: number;
  }>;
}

export default function SidebarNav({ overallScore, totalMarks, questionAnalyses }: SidebarNavProps) {
  // Function to handle smooth scrolling
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="lg:col-span-1 lg:sticky lg:top-8 bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-bold font-serif mb-4 text-lg">Report Sections</h3>
      <nav id="question-nav" className="space-y-1">
        <a 
          href="#overall-feedback" 
          onClick={(e) => handleLinkClick(e, 'overall-feedback')}
          className="sidebar-link active flex justify-between items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
        >
          <span>Overall Feedback</span>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
            {overallScore}/{totalMarks}
          </span>
        </a>
        {questionAnalyses.map((q) => (
          <a
            key={q.questionNumber}
            href={`#question-${q.questionNumber}`}
            onClick={(e) => handleLinkClick(e, `question-${q.questionNumber}`)}
            className="sidebar-link flex justify-between items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
          >
            <span>Question {q.questionNumber}</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded-full">
              {q.score}/{q.maxMarks}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}