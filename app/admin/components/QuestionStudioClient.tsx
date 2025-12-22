"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Layers, ShieldCheck, Trash2, Zap, 
  Loader2, CheckCircle2, AlertCircle, Database,
  LayoutList, Fingerprint, X, Info, Edit3, ArrowRight,
  Target, Activity, Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  importQuestionAction, findMatchingTopic, deleteQuestion,
  QuestionImportParams, DemandInput
} from '@/app/actions/questions';
import { TopicNode } from '@/app/actions/topics';

interface Props {
  initialTopics: TopicNode[];
  initialQuestions: any[];
}

export default function QuestionStudioClient({ initialTopics, initialQuestions }: Props) {
  const [activeTab, setActiveTab] = useState<'import' | 'bank'>('import');
  
  // 1. Target & Metadata Logic
  const [targetType, setTargetType] = useState<'daily' | 'test' | 'pyq'>('daily');
  const [targetName, setTargetName] = useState('');
  const [targetPaper, setTargetPaper] = useState('GS2');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  // 2. Ingestion State
  const [jsonInput, setJsonInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  
  // 3. The Blueprint Workspace
  const [blueprint, setBlueprint] = useState<any>(null);

  // --- Logic: Analysis & Semantic Bridging ---
  const handleAnalyze = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setIsAnalyzing(true);
      
      // Map Main Topic Anchor
      const mainMatch = await findMatchingTopic(parsed.suggested_topic || parsed.subject);
      
      // Map all Demands to their semantic topics
      const demandsWithTopics = await Promise.all((parsed.demands || []).map(async (d: any) => {
        const dMatch = await findMatchingTopic(d.demand_text);
        return {
          ...d,
          topic_id: dMatch?.id || null,
          topic_slug: dMatch?.slug || 'unlinked'
        };
      }));

      setBlueprint({
        ...parsed,
        primary_topic_id: mainMatch?.id || null,
        primary_topic_name: mainMatch?.name || 'Unmapped Context',
        demands: demandsWithTopics
      });
      
      toast.success("Semantic architecture mapped successfully.");
    } catch (e) {
      toast.error("Invalid JSON format. Check extraction.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Logic: Commitment & Security ---
  const handleCommit = async () => {
    if (!blueprint) return;
    
    // Security: Check Demand Marks Tally
    const currentTally = blueprint.demands.reduce((acc: number, d: any) => acc + Number(d.max_marks), 0);
    if (currentTally !== Number(blueprint.marks_max)) {
      return toast.error(`Mark Tally Mismatch: ${currentTally} vs ${blueprint.marks_max}`);
    }

    setIsCommitting(true);
    try {
      const params: QuestionImportParams = {
        question_text: blueprint.question_text,
        directive: blueprint.directive,
        marks_max: Number(blueprint.marks_max),
        paper: blueprint.paper,
        subject: blueprint.subject,
        target_type: targetType,
        target_metadata: {
          name: targetName,
          year: Number(targetYear),
          exam: targetType === 'pyq' ? targetName : undefined
        },
        primary_topic_id: blueprint.primary_topic_id,
        demands: blueprint.demands
      };

      await importQuestionAction(params);
      toast.success("Blueprint committed to repository.");
      setBlueprint(null);
      setJsonInput('');
    } catch (e: any) {
      toast.error(`Commit Failed: ${e.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const isPaperConflict = targetType === 'test' && blueprint?.paper !== targetPaper;

  return (
    <div className="max-w-6xl mx-auto py-12 px-8">
      
      {/* Studio Header & Tab Navigation */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex space-x-12 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('import')}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-300 hover:text-slate-500'}`}
          >
            Import Studio
          </button>
          <button 
            onClick={() => setActiveTab('bank')}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'bank' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-300 hover:text-slate-500'}`}
          >
            Review Bank
          </button>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
          Engine V2.5 Stable
        </div>
      </div>

      {activeTab === 'import' ? (
        <div className="space-y-12 animate-in fade-in duration-500">
          
          {/* STEP 1: TARGET INTENT (THE "GOAL" SELECTOR) */}
          <section className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-8">
            <div className="flex items-center space-x-3 text-slate-400">
              <Target className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-widest">Primary Target & Security</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-5">
              {[
                { id: 'daily', icon: <Activity />, label: 'Daily Practice' },
                { id: 'test', icon: <ShieldCheck />, label: 'Test Series' },
                { id: 'pyq', icon: <Archive />, label: 'UPSC PYQ' }
              ].map((t) => (
                <label key={t.id} className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all flex flex-col items-center space-y-3 ${targetType === t.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 hover:border-slate-200'}`}>
                  <input 
                    type="radio" name="target" 
                    checked={targetType === t.id}
                    onChange={() => setTargetType(t.id as any)} 
                    className="hidden" 
                  />
                  <div className={targetType === t.id ? 'text-blue-600' : 'text-slate-300'}>{t.icon}</div>
                  <span className="font-extrabold text-sm uppercase tracking-tighter">{t.label}</span>
                </label>
              ))}
            </div>

            {targetType !== 'daily' && (
              <div className="grid grid-cols-2 gap-8 pt-4 animate-in slide-in-from-top-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    {targetType === 'pyq' ? 'Examination Name' : 'Test Collection Name'}
                  </label>
                  <input 
                    type="text" value={targetName} onChange={(e) => setTargetName(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all" 
                    placeholder="e.g. GS2 Full Length #1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Paper Restriction Match</label>
                  <select 
                    value={targetPaper} onChange={(e) => setTargetPaper(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="GS1">General Studies I</option>
                    <option value="GS2">General Studies II</option>
                    <option value="GS3">General Studies III</option>
                    <option value="GS4">General Studies IV</option>
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* STEP 2: JSON INGESTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest italic">Step 2: AI Blueprint Ingestion</h2>
              <button onClick={() => toast.info("Extract via Gemini Web and paste here.")} className="text-[10px] text-blue-600 hover:underline">Syntax Help</button>
            </div>
            <textarea 
              value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 bg-white border border-slate-200 rounded-[2.5rem] p-8 font-mono text-xs leading-relaxed outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
              placeholder='Paste JSON containing question_text, marks_max, and demands[]'
            />
            <div className="flex justify-end">
              <button 
                onClick={handleAnalyze} disabled={!jsonInput || isAnalyzing}
                className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl flex items-center space-x-3 active:scale-95 disabled:opacity-30"
              >
                {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5 text-blue-400" />}
                <span>Map Semantic Architecture</span>
              </button>
            </div>
          </section>

          {/* STEP 3: WORKSPACE PREVIEW (THE EDITABLE CORE) */}
          {blueprint && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
              
              {/* Security Alert */}
              {isPaperConflict && (
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center space-x-4 text-red-600">
                  <AlertCircle className="w-8 h-8" />
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest">Metadata Conflict Detected</p>
                    <p className="text-sm font-medium opacity-80">Extraction says {blueprint.paper}, but target restriction is {targetPaper}. Verify before commit.</p>
                  </div>
                </div>
              )}

              {/* Master Question Card */}
              <div className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-12 shadow-2xl relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-6">
                    <input 
                      value={blueprint.paper} onChange={(e) => setBlueprint({...blueprint, paper: e.target.value})}
                      className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full uppercase outline-none ring-2 ring-blue-100" 
                    />
                    <textarea 
                      value={blueprint.question_text} onChange={(e) => setBlueprint({...blueprint, question_text: e.target.value})}
                      className="w-full text-3xl font-extrabold text-slate-900 outline-none leading-tight border-b-2 border-transparent focus:border-slate-50 py-2 resize-none" 
                      rows={2} 
                    />
                  </div>
                  <div className="text-right pl-12">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Master Marks</label>
                    <input 
                      type="number" value={blueprint.marks_max} onChange={(e) => setBlueprint({...blueprint, marks_max: e.target.value})}
                      className="text-6xl font-black text-slate-900 bg-transparent outline-none w-32 text-right border-b-2 border-transparent focus:border-blue-50" 
                    />
                  </div>
                </div>
                <div className="mt-12 pt-12 border-t flex items-center space-x-6">
                  <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl flex items-center space-x-3 border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Semantic Link: {blueprint.primary_topic_name}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Validated ID: {blueprint.primary_topic_id}</p>
                </div>
              </div>

              {/* Demand Engine (FLUID ORDER) */}
              <div className="space-y-8">
                <div className="flex justify-between items-end px-6">
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.3em] flex items-center">
                      <LayoutList className="w-5 h-5 mr-3" /> Blueprint Objectives
                    </h3>
                    <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Fluid mapping • Semantic intent detection active</p>
                  </div>
                  <div className={`text-sm font-black px-4 py-2 rounded-2xl border transition-all ${blueprint.demands.reduce((a:number,b:any) => a + Number(b.max_marks), 0) === Number(blueprint.marks_max) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    Tally: {blueprint.demands.reduce((a:number,b:any) => a + Number(b.max_marks), 0)} / {blueprint.marks_max} Marks
                  </div>
                </div>

                <div className="space-y-6">
                  {blueprint.demands.map((d: any, i: number) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[3rem] p-10 space-y-8 group relative shadow-lg hover:border-blue-100 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-black text-slate-200">OBJS_{i+1}</span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-100 uppercase italic">{d.topic_slug}</span>
                          </div>
                          <input 
                            value={d.demand_text} onChange={(e) => {
                              const nd = [...blueprint.demands]; nd[i].demand_text = e.target.value; setBlueprint({...blueprint, demands: nd});
                            }}
                            className="w-full text-xl font-bold text-slate-800 outline-none border-b-2 border-transparent focus:border-slate-50 py-1" 
                          />
                        </div>
                        <div className="flex items-center space-x-8 pl-12">
                          <div className="text-right">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Target Weight</label>
                            <input 
                              type="number" value={d.max_marks} onChange={(e) => {
                                const nd = [...blueprint.demands]; nd[i].max_marks = e.target.value; setBlueprint({...blueprint, demands: nd});
                              }}
                              className="block text-right font-black text-blue-600 outline-none w-16 text-3xl bg-transparent border-b-2 border-transparent focus:border-blue-50" 
                            />
                          </div>
                          <button onClick={() => {
                            const nd = blueprint.demands.filter((_:any,idx:number)=>idx!==i); setBlueprint({...blueprint, demands:nd});
                          }} className="text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-6 h-6" /></button>
                        </div>
                      </div>
                      <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4 flex items-center"><Fingerprint className="w-3.5 h-3.5 mr-2" /> Evaluation Soul (AI Rubric)</label>
                        <textarea 
                          value={d.expectation} onChange={(e) => {
                            const nd = [...blueprint.demands]; nd[i].expectation = e.target.value; setBlueprint({...blueprint, demands: nd});
                          }}
                          className="w-full bg-transparent text-sm text-slate-500 italic outline-none resize-none leading-relaxed font-medium" 
                          rows={3} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setBlueprint({...blueprint, demands: [...blueprint.demands, { demand_text: 'Describe Objective...', expectation: 'Instruction for AI...', max_marks: 0, topic_slug: 'unlinked' }]})}
                  className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black text-xs uppercase tracking-widest hover:text-blue-500 hover:border-blue-200 transition-all flex items-center justify-center space-x-3 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span>Map New Objective Node</span>
                </button>
              </div>

              <div className="pt-12 flex flex-col items-center">
                <button 
                  onClick={handleCommit} 
                  disabled={isCommitting || isPaperConflict}
                  className="w-full bg-blue-600 text-white py-8 rounded-[3.5rem] font-black text-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:translate-y-0"
                >
                  {isCommitting ? <Loader2 className="animate-spin w-10 h-10 mx-auto" /> : 'COMMIT BLUEPRINT TO REPOSITORY'}
                </button>
                <div className="mt-8 flex items-center space-x-3 text-slate-400">
                  <Database className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Precision Infrastructure • Root&Rise Studio</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* BANK REVIEW TAB */
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm animate-in slide-in-from-right-10 duration-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-12 py-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Question & Paper Data</th>
                <th className="px-12 py-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Intent</th>
                <th className="px-12 py-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Soul Status</th>
                <th className="px-12 py-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-12 py-10">
                    <p className="font-bold text-slate-800 line-clamp-1 text-lg mb-1">{q.question_text}</p>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{q.paper} • {q.marks_max} Marks</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{q.demand_count} Demands Mapped</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                      q.source_type === 'test' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>{q.source_type}</span>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center space-x-2 text-slate-400">
                      {q.has_answer ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-dashed border-slate-200" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {q.has_answer ? 'Answer Synced' : 'Draft Mode'}
                      </span>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right space-x-4">
                    <button className="p-4 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm"><Edit3 className="w-5 h-5" /></button>
                    <button 
                      onClick={async () => { if(confirm('Purge Blueprint Architecture?')) await deleteQuestion(q.id); }} 
                      className="p-4 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {initialQuestions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Database className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No blueprints detected in repository</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}