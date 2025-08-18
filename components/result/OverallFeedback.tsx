// app/components/result/OverallFeedback.tsx
'use client';

const Icon = ({ type }: { type: 'strengths' | 'improvements' }) => (
  <span>
    {/* TODO: Replace with actual SVG icon based on 'type' */}
    {type === 'strengths' ? '🟢' : '🟠'}
  </span>
);

const CompetenceArea = ({ title, data }: { title: string, data?: { strengths: string[], improvements: string[] } }) => {
    if (!data || (!data.strengths?.length && !data.improvements?.length)) return null;

    return (
        <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="font-serif font-semibold text-lg text-slate-800">{title}</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 flex items-center">Key Strengths</h4>
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                        {data.strengths.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center">Areas for Improvement</h4>
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                        {data.improvements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function OverallFeedback({ feedback }: { feedback: any }) {
  const competenceMap = [
    { title: "Contextual Competence", key: "contextualCompetence" },
    { title: "Content Competence", key: "contentCompetence" },
    { title: "Language Competence", key: "languageCompetence" },
    { title: "Structure Competence", key: "structureCompetence" },
    { title: "Conclusion Competence", key: "conclusionCompetence" }
  ];

  return (
    <section id="overall-feedback" className="bg-white p-6 rounded-lg border border-gray-200 scroll-mt-20">
      <h2 className="text-2xl font-bold font-serif">Overall Competence</h2>
      {competenceMap.map(area => (
        <CompetenceArea key={area.key} title={area.title} data={feedback[area.key]} />
      ))}
    </section>
  );
}