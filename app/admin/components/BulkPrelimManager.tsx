'use client';

import React, { useState } from 'react';
import { bulkImportPrelims } from '@/app/actions/prelim-bulk';
import { Play, Save, Loader2, Database, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkPrelimManager() {
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
      setPreviewData(parsed);
      toast.success(`Found ${parsed.length} questions in batch.`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCommit = async () => {
    if (!previewData) return;
    setIsProcessing(true);
    const res = await bulkImportPrelims(previewData);
    setIsProcessing(false);

    if (res.success) {
      toast.success("All questions and provisional topics seeded successfully.");
      setPreviewData(null);
      setJsonInput('');
    } else {
      toast.error(`Import Failed: ${'error' in res ? res.error : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-3 text-slate-400">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Bulk JSON Ingestion</h2>
          </div>
          <button 
            onClick={handlePreview}
            disabled={!jsonInput.trim()}
            className="flex items-center px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" /> Analyze Architecture
          </button>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-80 bg-slate-50 border-none rounded-3xl p-8 font-mono text-xs leading-relaxed focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          placeholder="[ { 'paper': 'GS1', 'subject': 'Polity', 'l3_topic': 'Judiciary' ... } ]"
        />
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          <div className="flex justify-between items-center px-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Verification Preview</h3>
            <button 
              onClick={handleCommit}
              disabled={isProcessing}
              className="flex items-center px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Commit {previewData.length} Questions to SQL
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {previewData.map((q, i) => (
              <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase">
                    <span>{q.subject}</span>
                    <ChevronRight size={12} />
                    <span className="text-blue-600">{q.l3_topic}</span>
                    <ChevronRight size={12} />
                    <span className="text-emerald-600">{q.l4_topic}</span>
                  </div>
                  <p className="font-bold text-slate-800 line-clamp-1">{q.question_text}</p>
                </div>
                <div className="pl-10 text-right">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-md uppercase">
                    {q.year} • {q.paper}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}