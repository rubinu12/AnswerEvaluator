"use client";

import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, CheckCircle, AlertTriangle, Snowflake, ChevronRight, X, Database } from 'lucide-react';
import { analyzeTopicsAction, commitBatchAction } from '@/app/actions/prelim-bulk';
import { toast } from 'sonner';

export default function PrelimStudioClient({ initialSubjects }: { initialSubjects: any[] }) {
  const [view, setView] = useState<'paste' | 'review'>('paste');
  const [jsonInput, setJsonInput] = useState('');
  const [batch, setBatch] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setLoading(true);
      
      const enrichedBatch = await Promise.all(parsed.map(async (item: any) => {
        // Find subject ID from metadata name for scoped search
        const subject = initialSubjects.find(s => s.name.toLowerCase() === item.topics[0].subject.toLowerCase());
        const resolved = await analyzeTopicsAction(item.topics.map((t: any) => t.detailed), subject?.id || null);
        return { ...item, resolvedTopics: resolved, subjectId: subject?.id || null };
      }));

      setBatch(enrichedBatch);
      setView('review');
    } catch (e) {
      toast.error("Invalid JSON format.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setLoading(true);
    const res = await commitBatchAction(batch);
    setLoading(false);
    if (res.success) {
      toast.success("Batch successfully committed to PostgreSQL.");
      setView('paste');
      setJsonInput('');
    } else {
      const message = 'error' in res ? String(res.error) : 'Unknown error';
      toast.error(message);
    }
  };

  if (view === 'paste') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 bg-slate-50">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-3xl font-black text-slate-900">Prelim Ingestion Studio</h1>
          <textarea 
            value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 p-8 rounded-[2rem] shadow-xl border-none font-mono text-xs outline-none focus:ring-4 focus:ring-emerald-500/10"
            placeholder="Paste your JSON batch array here..."
          />
          <button 
            disabled={loading} onClick={handlePreview}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-lg"
          >
            {loading ? "Analyzing Semantics..." : "Enter High-Velocity Review"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
      <div className="flex items-center space-x-6">
          <button onClick={() => setView('paste')} className="text-[10px] font-black text-blue-600 uppercase">← Edit JSON</button>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{batch.length} Questions in Queue</span>
        </div>
        <button onClick={handleCommit} disabled={loading} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-bold text-xs">
          {loading ? "Syncing..." : "COMMIT ALL TO DB"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {batch.map((item, idx) => (
          <div key={idx} className="flex bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[450px] group transition-all hover:shadow-md">
            {/* Left: Content (65%) */}
            <div className="flex-1 p-10 flex flex-col justify-between border-r border-slate-50">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-black text-slate-900">{item.meta.year} • {item.meta.source}</span>
                    <button className="text-[9px] font-black text-blue-600 uppercase border border-blue-100 px-2 py-0.5 rounded-lg hover:bg-blue-50">Edit Meta</button>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.meta.question_type}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 leading-snug mb-6">{item.question.question_text}</h3>
                
                {item.meta.question_type === 'pair' && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                    <table className="w-full text-xs">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200"><th className="text-left pb-3">Item A</th><th className="text-left pb-3">Item B</th></tr>
                      {item.question.pairs.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0"><td className="py-3 font-bold">{p.col_1}</td><td className="py-3 text-slate-600">{p.col_2}</td></tr>
                      ))}
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <p className="text-sm font-black text-emerald-600 uppercase italic">
                  Correct: {item.question.correct_option} ({item.question.options.find((o:any)=>o.label===item.question.correct_option)?.text})
                </p>
                <div className="flex space-x-3">
                  <button onClick={() => setBatch(batch.filter((_, i) => i !== idx))} className="bg-red-50 text-red-500 text-[10px] font-black px-5 py-2 rounded-xl hover:bg-red-100">DISCARD</button>
                  <button className="bg-slate-100 text-slate-700 text-[10px] font-black px-6 py-2 rounded-xl">FLAG FOR EDIT</button>
                </div>
              </div>
            </div>

            {/* Right: Topic Rows (35%) */}
            <div className="w-80 shrink-0 flex flex-col bg-slate-50/30">
              <div className="p-4 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white">Topic Resolution Decision Hub</div>
              {item.resolvedTopics.map((rt: any, rtIdx: number) => (
                <div key={rtIdx} className={`p-6 border-b border-white/40 last:border-0 ${rt.status === 'high' ? 'bg-emerald-50/60' : rt.status === 'cold' ? 'bg-blue-50/60' : 'bg-amber-50/60'}`}>
                  <div className="flex justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">AI Suggestion: {rt.original}</span>
                    <span className="text-[10px] font-black px-1.5 rounded bg-white/80 shadow-sm">{rt.similarity}</span>
                  </div>
                  <p className="text-[13px] font-black text-slate-900 leading-tight mb-4">{rt.matchedName}</p>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="bg-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white">CHANGE</button>
                    <button className="bg-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 hover:bg-purple-600 hover:text-white">PROV</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}