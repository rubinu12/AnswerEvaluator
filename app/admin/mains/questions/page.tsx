'use client';

import React, { useState } from 'react';
import { saveMainsQuestions } from '@/app/actions/mains-studio';
import { 
  FileJson, Upload, CheckCircle, AlertTriangle, 
  Loader2, ArrowRight, BookOpen, Calendar, Layers 
} from 'lucide-react';

export default function MainsImportTerminal() {
  const [context, setContext] = useState({
    type: 'DAILY', 
    refVal: new Date().toISOString().split('T')[0],
    extraVal: 'CSE'
  });

  const [jsonInput, setJsonInput] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'READY' | 'BUSY' | 'DONE'>('IDLE');
  const [logs, setLogs] = useState<any>(null);

  // --- HANDLER: Parse ---
  const handleParse = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) throw new Error("Root must be an Array []");
      
      // Basic check for required fields
      const invalid = data.find(i => !i.question_text || !i.main_path);
      if (invalid) throw new Error("Invalid Format: Missing 'question_text' or 'main_path'");

      setPreviewData(data);
      setStatus('READY');
    } catch (e: any) {
      alert("JSON Error: " + e.message);
    }
  };

  // --- HANDLER: Submit ---
  const handleSubmit = async () => {
    setStatus('BUSY');
    
    let sourceRef = {};
    if (context.type === 'DAILY') sourceRef = { date: context.refVal };
    if (context.type === 'TEST') sourceRef = { test_name: context.refVal };
    if (context.type === 'PYQ') sourceRef = { year: parseInt(context.refVal), exam: context.extraVal };

    const res = await saveMainsQuestions({
      sourceType: context.type,
      sourceRef: sourceRef,
      questions: previewData
    });

    if (res.success) {
      setLogs(res);
      setStatus('DONE');
    } else {
      alert("Server Error: " + res.error);
      setStatus('READY');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. CONTROL PANEL */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h2 className="text-xs font-bold text-slate-400 uppercase mb-4">Context</h2>
           <div className="flex gap-2 mb-4">
              {['DAILY', 'TEST', 'PYQ'].map(t => (
                <button key={t} onClick={()=>setContext({...context, type: t})}
                  className={`flex-1 py-2 text-[10px] font-bold rounded border uppercase ${context.type===t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>
                  {t}
                </button>
              ))}
           </div>
           
           <div className="space-y-3">
              {context.type === 'DAILY' && (
                 <input type="date" className="w-full p-2 border rounded font-bold text-sm" 
                   value={context.refVal} onChange={e=>setContext({...context, refVal:e.target.value})}/>
              )}
              {context.type === 'TEST' && (
                 <input className="w-full p-2 border rounded font-bold text-sm" placeholder="Test Name"
                   value={context.refVal} onChange={e=>setContext({...context, refVal:e.target.value})}/>
              )}
              {context.type === 'PYQ' && (
                 <div className="flex gap-2">
                    <input className="w-1/2 p-2 border rounded font-bold text-sm" placeholder="Exam"
                      value={context.extraVal} onChange={e=>setContext({...context, extraVal:e.target.value})}/>
                    <input type="number" className="w-1/2 p-2 border rounded font-bold text-sm" placeholder="Year"
                      value={context.refVal} onChange={e=>setContext({...context, refVal:e.target.value})}/>
                 </div>
              )}
           </div>
        </div>

        {/* Status Card */}
        {status === 'DONE' && logs && (
           <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                 <CheckCircle className="w-6 h-6 text-emerald-500"/>
                 <h3 className="font-bold text-slate-800">Success!</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">{logs.successCount} Questions Imported.</p>
              
              {logs.errors.length > 0 && (
                <div className="mb-4 bg-red-50 p-3 rounded text-[10px] text-red-600 font-mono max-h-32 overflow-auto">
                   {logs.errors.map((e:string,i:number)=><div key={i}>{e}</div>)}
                </div>
              )}

              <button onClick={()=>{setStatus('IDLE'); setJsonInput(''); setPreviewData([]); setLogs(null)}} 
                className="w-full py-2 bg-slate-900 text-white hover:bg-black rounded font-bold text-sm">
                New Import
              </button>
           </div>
        )}
      </div>

      {/* 2. JSON TERMINAL */}
      <div className="lg:col-span-2 flex flex-col h-[calc(100vh-100px)]">
         {status === 'IDLE' ? (
           <div className="flex-1 bg-slate-900 rounded-xl p-6 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-emerald-400 font-mono text-sm font-bold flex items-center gap-2">
                   <FileJson className="w-4 h-4"/> JSON INPUT
                 </label>
                 <span className="text-slate-500 text-xs font-mono">schema: Question[]</span>
              </div>
              <textarea 
                className="flex-1 bg-transparent text-slate-300 font-mono text-xs focus:outline-none resize-none p-2 border border-slate-700 rounded"
                placeholder='[ { "question_text": "...", "main_path": ["GS2", "Polity", "Governor"] } ]'
                value={jsonInput} onChange={e=>setJsonInput(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                 <button onClick={handleParse} disabled={!jsonInput}
                   className="px-6 py-3 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 transition-all flex items-center gap-2 disabled:opacity-50">
                   Check Syntax <ArrowRight className="w-4 h-4"/>
                 </button>
              </div>
           </div>
         ) : (
           <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Review ({previewData.length})</h3>
                 <button onClick={()=>setStatus('IDLE')} className="text-xs text-red-500 hover:underline font-bold">Edit</button>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-white sticky top-0 text-xs uppercase text-slate-400 font-bold border-b">
                       <tr><th className="p-3">Topic</th><th className="p-3">Question</th><th className="p-3">Tags</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {previewData.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                             <td className="p-3 align-top font-bold text-indigo-600 text-xs">
                                {item.main_path?.[item.main_path.length-1]}
                             </td>
                             <td className="p-3 text-slate-700 line-clamp-2 text-xs">{item.question_text}</td>
                             <td className="p-3 text-xs text-slate-500">{item.related_topics?.join(', ')}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-end">
                 {status === 'DONE' ? null : (
                   <button onClick={handleSubmit} disabled={status==='BUSY'}
                     className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-black flex justify-center items-center gap-2">
                     {status==='BUSY' ? <Loader2 className="animate-spin"/> : <Upload/>} 
                     Commit to DB
                   </button>
                 )}
              </div>
           </div>
         )}
      </div>

    </div>
  );
}