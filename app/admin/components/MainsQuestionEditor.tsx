// app/admin/components/MainsQuestionEditor.tsx
'use client';

import React, { useState } from 'react';
import { createMainsQuestion } from '@/app/actions/mains';
import { Trash2, Plus, Save, BookOpen, List, Target } from 'lucide-react';

// --- Type Definitions for Safety ---
type BodyPoint = {
  heading: string;
  content: string;
};

type Demand = {
  label: string;
  weight: number;
};

type Topic = {
  id: string;
  name: string;
  paper: string;
  subject: string;
};

export default function MainsQuestionEditor({ topics }: { topics: Topic[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- 1. Meta State --
  const [meta, setMeta] = useState({
    paper: 'GS1',
    subject: 'History',
    topicId: '',
    marks: 10,
    words: 150,
    question: '',
  });

  // -- 2. Structure State (The Digital Anatomy) --
  const [structure, setStructure] = useState<{
    intro: string;
    bodyPoints: BodyPoint[];
    conclusion: string;
  }>({
    intro: '',
    bodyPoints: [{ heading: '', content: '' }],
    conclusion: '',
  });

  // -- 3. Rubric State --
  const [demands, setDemands] = useState<Demand[]>([
    { label: 'Core Demand 1', weight: 40 },
  ]);

  // -- Helpers --

  // Fixed: Type-safe handler for dynamic fields
  const handleBodyChange = (idx: number, field: keyof BodyPoint, val: string) => {
    const newBody = [...structure.bodyPoints];
    // Create a new object to ensure immutability
    newBody[idx] = { ...newBody[idx], [field]: val };
    setStructure({ ...structure, bodyPoints: newBody });
  };

  const addBodySection = () => {
    setStructure({
      ...structure,
      bodyPoints: [...structure.bodyPoints, { heading: '', content: '' }],
    });
  };

  const removeBodySection = (idx: number) => {
    if (structure.bodyPoints.length === 1) return; // Keep at least one
    const newBody = structure.bodyPoints.filter((_, i) => i !== idx);
    setStructure({ ...structure, bodyPoints: newBody });
  };

  const handleDemandChange = (idx: number, field: keyof Demand, val: string | number) => {
    const newDemands = [...demands];
    newDemands[idx] = { ...newDemands[idx], [field]: val };
    setDemands(newDemands);
  };

  const handleSubmit = async () => {
    if (!meta.topicId || !meta.question) {
      alert('Please select a topic and enter a question.');
      return;
    }
    
    setIsSubmitting(true);

    // 1. Construct Full Text for AI Context/Reading
    const fullText = `
Introduction: ${structure.intro}

${structure.bodyPoints.map((b) => `${b.heading}: ${b.content}`).join('\n\n')}

Conclusion: ${structure.conclusion}
    `.trim();

    // 2. Construct Payload
    const payload = {
      paper: meta.paper,
      subject: meta.subject,
      main_topic_id: meta.topicId,
      question_text: meta.question,
      marks: meta.marks,
      word_limit: meta.words,
      demand_structure: JSON.stringify(demands),
      model_answer_text: fullText,
      structure_breakdown: JSON.stringify({
        intro: { content: structure.intro, strategy_tag: 'Definition/Context' },
        body: structure.bodyPoints.map((b) => ({
          heading: b.heading,
          points: [b.content], // Wrapping in array to match our schema
        })),
        conclusion: { content: structure.conclusion, strategy_tag: 'Way Forward' },
      }),
    };

    const res = await createMainsQuestion(payload);

    if (res.success) {
      alert(`✅ Question Created Successfully! (ID: ${res.id})`);
      // Optional: Reset form here if needed
    } else {
      alert(`❌ Error: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[calc(100vh-100px)]">
      
      {/* --- LEFT COLUMN: Meta & Challenge --- */}
      <div className="p-6 lg:p-8 space-y-8 bg-white">
        <div>
          <h3 className="flex items-center text-lg font-bold text-slate-900 border-b pb-3 mb-6">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            1. The Challenge
          </h3>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Paper</label>
              <select
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={meta.paper}
                onChange={(e) => setMeta({ ...meta, paper: e.target.value })}
              >
                {['GS1', 'GS2', 'GS3', 'GS4', 'Essay'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Topic</label>
              <select
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={meta.topicId}
                onChange={(e) => {
                  const t = topics.find((t) => t.id === e.target.value);
                  setMeta({ 
                    ...meta, 
                    topicId: e.target.value, 
                    subject: t?.subject || meta.subject // Auto-set subject
                  });
                }}
              >
                <option value="">-- Select Topic --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.paper} - {t.subject} - {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Question Text</label>
             <textarea
               className="w-full p-4 border border-slate-300 rounded-md font-serif text-lg leading-relaxed h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
               placeholder="Discuss the role of..."
               value={meta.question}
               onChange={(e) => setMeta({ ...meta, question: e.target.value })}
             />
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Marks</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={meta.marks}
                  onChange={(e) => setMeta({...meta, marks: parseInt(e.target.value)})}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Word Limit</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={meta.words}
                  onChange={(e) => setMeta({...meta, words: parseInt(e.target.value)})}
                />
             </div>
          </div>
        </div>

        {/* --- Rubric Section --- */}
        <div>
           <h3 className="flex items-center text-lg font-bold text-slate-900 border-b pb-3 mb-6">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            2. Evaluation Rubric
          </h3>
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
             {demands.map((d, i) => (
               <div key={i} className="flex gap-3 items-center">
                 <span className="text-xs font-bold text-slate-400 w-4">{i+1}.</span>
                 <input
                   className="flex-1 p-2 border border-slate-300 rounded text-sm"
                   placeholder="e.g. Mention Article 21"
                   value={d.label}
                   onChange={(e) => handleDemandChange(i, 'label', e.target.value)}
                 />
                 <div className="relative w-24">
                   <input
                     type="number"
                     className="w-full p-2 border border-slate-300 rounded text-sm pr-6"
                     value={d.weight}
                     onChange={(e) => handleDemandChange(i, 'weight', parseInt(e.target.value))}
                   />
                   <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                 </div>
                 {demands.length > 1 && (
                    <button 
                      onClick={() => setDemands(demands.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 )}
               </div>
             ))}
             <button
               onClick={() => setDemands([...demands, { label: '', weight: 0 }])}
               className="text-xs font-bold text-indigo-600 hover:underline flex items-center mt-2"
             >
               <Plus className="w-3 h-3 mr-1" /> Add Demand
             </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Golden Answer --- */}
      <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50">
        <h3 className="flex items-center text-lg font-bold text-slate-900 border-b pb-3 mb-6">
          <List className="w-5 h-5 mr-2 text-emerald-600" />
          3. The Golden Answer (Digital Anatomy)
        </h3>

        {/* Intro Block */}
        <div className="relative group">
           <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-purple-600 border border-purple-100 rounded">
             INTRODUCTION
           </label>
           <textarea
             className="w-full p-4 pt-6 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-28"
             placeholder="Write the introduction strategy here..."
             value={structure.intro}
             onChange={(e) => setStructure({ ...structure, intro: e.target.value })}
           />
        </div>

        {/* Dynamic Body Blocks */}
        <div className="space-y-4">
           {structure.bodyPoints.map((bp, idx) => (
             <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 relative group hover:border-blue-300 transition-colors">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                   Body Paragraph {idx + 1}
                 </label>
                 {structure.bodyPoints.length > 1 && (
                   <button 
                    onClick={() => removeBodySection(idx)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
               </div>
               
               <input
                 className="w-full font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 transition-colors"
                 placeholder="Main Heading (e.g. Challenges, Significance)"
                 value={bp.heading}
                 onChange={(e) => handleBodyChange(idx, 'heading', e.target.value)}
               />
               <textarea
                 className="w-full text-sm text-slate-600 border-0 p-0 focus:ring-0 resize-none h-24 placeholder:text-slate-300"
                 placeholder="The content logic and bullet points..."
                 value={bp.content}
                 onChange={(e) => handleBodyChange(idx, 'content', e.target.value)}
               />
             </div>
           ))}

           <button
             onClick={addBodySection}
             className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
           >
             <Plus className="w-4 h-4" /> Add Body Section
           </button>
        </div>

        {/* Conclusion Block */}
        <div className="relative group pt-2">
           <label className="absolute top-0 left-3 bg-white px-1 text-xs font-bold text-emerald-600 border border-emerald-100 rounded z-10">
             CONCLUSION
           </label>
           <textarea
             className="w-full p-4 pt-6 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-28"
             placeholder="Write the Way Forward / Visionary conclusion..."
             value={structure.conclusion}
             onChange={(e) => setStructure({ ...structure, conclusion: e.target.value })}
           />
        </div>

        <div className="pt-4">
           <button
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl shadow-xl hover:bg-slate-800 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isSubmitting ? (
               <span className="animate-pulse">Saving to Database...</span>
             ) : (
               <>
                 <Save className="w-5 h-5" />
                 Save Mains Question
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}