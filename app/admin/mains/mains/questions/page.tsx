'use client';

import React, { useState, useEffect } from 'react';
import { createQuestionOnly, bulkImportQuestions, getRecentQuestions } from '@/app/actions/question-bank';
import { FileText, Save, Upload, Clock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function QuestionStudio() {
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [recentQs, setRecentQs] = useState<any[]>([]);

  // -- SINGLE FORM STATE --
  const [singleForm, setSingleForm] = useState({
    paper: 'GS2', subject: 'Polity', topicName: '', questionText: '',
    marks: 10, words: 150, demands: [{ label: '', weight: 0 }],
    sourceType: 'DAILY', sourceRefVal: new Date().toISOString().split('T')[0] 
  });

  // -- BULK FORM STATE --
  const [bulkJson, setBulkJson] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [bulkStep, setBulkStep] = useState(1); // 1=Input, 2=Preview
  const [bulkSource, setBulkSource] = useState({ type: 'DAILY', refVal: new Date().toISOString().split('T')[0] });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadRecent(); }, []);
  async function loadRecent() { setRecentQs(await getRecentQuestions()); }

  // --- HANDLER: SINGLE SAVE ---
  async function handleSingleSave() {
    if (!singleForm.questionText) return alert("Enter Question Text");
    setIsSubmitting(true);

    // Construct Source Ref JSON
    let sourceRef = {};
    if (singleForm.sourceType === 'DAILY') sourceRef = { date: singleForm.sourceRefVal };
    if (singleForm.sourceType === 'TEST') sourceRef = { test_name: singleForm.sourceRefVal };
    if (singleForm.sourceType === 'PYQ') sourceRef = { year: singleForm.sourceRefVal };

    const res = await createQuestionOnly({ 
      ...singleForm, 
      sourceRef 
    });

    if (res.success) {
      alert("✅ Saved!");
      loadRecent();
      setSingleForm({ ...singleForm, questionText: '', demands: [{ label: '', weight: 0 }] });
    } else {
      alert("Error: " + res.error);
    }
    setIsSubmitting(false);
  }

  // --- HANDLER: BULK PARSE ---
  function handleBulkParse() {
    try {
      const data = JSON.parse(bulkJson);
      if (!Array.isArray(data)) throw new Error("JSON must be an Array []");
      setParsedData(data);
      setBulkStep(2);
    } catch (e: any) {
      alert("Invalid JSON: " + e.message);
    }
  }

  // --- HANDLER: BULK IMPORT (FIXED TYPESCRIPT ERROR) ---
  async function handleBulkImport() {
    setIsSubmitting(true);

    // Construct Global Source Ref
    let globalSourceRef = {};
    if (bulkSource.type === 'DAILY') globalSourceRef = { date: bulkSource.refVal };
    if (bulkSource.type === 'TEST') globalSourceRef = { test_name: bulkSource.refVal };
    if (bulkSource.type === 'PYQ') globalSourceRef = { year: bulkSource.refVal };

    const res = await bulkImportQuestions(parsedData, { type: bulkSource.type, ref: globalSourceRef });

    if (res.success) {
      // TypeScript Fix: We check if 'successCount' exists before using it
      const count = 'successCount' in res ? res.successCount : 0;
      alert(`✅ Imported ${count} questions! Check logs if any errors.`);
      
      setBulkStep(1);
      setBulkJson('');
      setParsedData([]);
      loadRecent();
    } else {
      alert("Error: " + res.error);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* --- LEFT COL: RECENT FEED (3 Cols) --- */}
      <div className="lg:col-span-3 space-y-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Additions
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-150px)] overflow-y-auto divide-y divide-slate-100">
          {recentQs.map(q => (
            <div key={q.id} className="p-4 hover:bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="bg-slate-100 text-slate-600 px-1.5 rounded text-[10px] font-bold uppercase">
                  {q.source_type}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(q.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-[10px] font-bold text-indigo-600 mb-1">{q.topic_name || 'No Topic'}</div>
              <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                {q.question_text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT COL: STUDIO (9 Cols) --- */}
      <div className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
        
        {/* TABS HEADER */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {activeTab === 'SINGLE' ? <FileText className="text-indigo-600"/> : <Upload className="text-emerald-600"/>}
            Question Studio
          </h2>
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button 
              onClick={() => setActiveTab('SINGLE')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab==='SINGLE' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Single Entry
            </button>
            <button 
              onClick={() => setActiveTab('BULK')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab==='BULK' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
            >
              Bulk Import
            </button>
          </div>
        </div>

        {/* --- TAB 1: SINGLE ENTRY --- */}
        {activeTab === 'SINGLE' && (
          <div className="p-8 space-y-6 animate-in fade-in">
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Source Type</label>
                  <select 
                    className="w-full p-2 border rounded mt-1 text-sm bg-slate-50"
                    value={singleForm.sourceType} onChange={e=>setSingleForm({...singleForm, sourceType: e.target.value})}
                  >
                    <option value="DAILY">Daily Practice</option>
                    <option value="TEST">Test Series</option>
                    <option value="PYQ">PYQ</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    {singleForm.sourceType === 'DAILY' ? 'Date' : singleForm.sourceType === 'TEST' ? 'Test Name' : 'Year'}
                  </label>
                  <input 
                    className="w-full p-2 border rounded mt-1 text-sm font-medium"
                    type={singleForm.sourceType === 'DAILY' ? 'date' : 'text'}
                    value={singleForm.sourceRefVal} onChange={e=>setSingleForm({...singleForm, sourceRefVal: e.target.value})}
                  />
               </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Target Topic (Auto-Mapped)</label>
                <input 
                  className="w-full p-3 border rounded mt-1 text-sm font-bold text-slate-700"
                  placeholder="e.g. Governor"
                  value={singleForm.topicName} onChange={e=>setSingleForm({...singleForm, topicName: e.target.value})}
                />
             </div>

             <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Question Text</label>
                <textarea 
                  className="w-full p-4 border rounded mt-1 font-serif text-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Discuss the role..."
                  value={singleForm.questionText} onChange={e=>setSingleForm({...singleForm, questionText: e.target.value})}
                />
             </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Demands</label>
                {singleForm.demands.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input 
                      className="flex-1 p-2 border rounded text-sm" placeholder="Demand..."
                      value={d.label}
                      onChange={e => {
                        const newD = [...singleForm.demands];
                        newD[i].label = e.target.value;
                        setSingleForm({...singleForm, demands: newD});
                      }}
                    />
                    <input 
                      type="number" className="w-16 p-2 border rounded text-sm" placeholder="%"
                      value={d.weight}
                      onChange={e => {
                        const newD = [...singleForm.demands];
                        newD[i].weight = parseInt(e.target.value);
                        setSingleForm({...singleForm, demands: newD});
                      }}
                    />
                  </div>
                ))}
                <button onClick={() => setSingleForm({...singleForm, demands: [...singleForm.demands, {label:'', weight:0}]})} className="text-xs text-blue-600 font-bold hover:underline">+ Add Demand</button>
             </div>

             <button onClick={handleSingleSave} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-black transition-all">
                {isSubmitting ? 'Saving...' : 'Save Question'}
             </button>
          </div>
        )}

        {/* --- TAB 2: BULK IMPORT --- */}
        {activeTab === 'BULK' && (
          <div className="p-8 space-y-6 animate-in fade-in">
             {bulkStep === 1 && (
               <>
                 <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-100 mb-4">
                   <strong>Workflow:</strong> Paste JSON from Gemini &rarr; We auto-link Topics &rarr; Save Batch.
                 </div>
                 
                 {/* Global Settings for Batch */}
                 <div className="flex gap-4 items-end mb-4 bg-slate-50 p-3 rounded border">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Batch Source</label>
                      <select className="w-full p-2 border rounded text-sm mt-1" value={bulkSource.type} onChange={e=>setBulkSource({...bulkSource, type: e.target.value})}>
                        <option value="DAILY">Daily Practice</option>
                        <option value="TEST">Test Series</option>
                        <option value="PYQ">PYQ</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Reference</label>
                      <input className="w-full p-2 border rounded text-sm mt-1" 
                        value={bulkSource.refVal} onChange={e=>setBulkSource({...bulkSource, refVal: e.target.value})} />
                    </div>
                 </div>

                 <textarea 
                   className="w-full h-80 p-4 border rounded font-mono text-xs bg-slate-900 text-green-400 focus:outline-none"
                   placeholder='[ { "paper": "GS2", "topic_name": "Governor", "question_text": "...", "demands": [...] } ]'
                   value={bulkJson} onChange={e => setBulkJson(e.target.value)}
                 />
                 <button onClick={handleBulkParse} disabled={!bulkJson} className="w-full py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 mt-4">
                   Parse JSON
                 </button>
               </>
             )}

             {bulkStep === 2 && (
               <>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">Preview ({parsedData.length} items)</h3>
                   <button onClick={()=>setBulkStep(1)} className="text-sm text-red-500 underline">Back to Edit</button>
                 </div>
                 <div className="border rounded max-h-[400px] overflow-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 font-bold uppercase text-xs text-slate-500">
                       <tr><th className="p-3">Topic</th><th className="p-3">Question</th><th className="p-3">Demands</th></tr>
                     </thead>
                     <tbody className="divide-y">
                       {parsedData.map((item, i) => (
                         <tr key={i}>
                           <td className="p-3 font-bold text-indigo-600">{item.topic_name}</td>
                           <td className="p-3 truncate max-w-xs">{item.question_text}</td>
                           <td className="p-3">{item.demands?.length || 0}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 <button onClick={handleBulkImport} disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 mt-4 flex justify-center gap-2">
                   {isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle/>}
                   Approve & Import
                 </button>
               </>
             )}
          </div>
        )}

      </div>
    </div>
  );
}