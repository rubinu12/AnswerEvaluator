'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMainsStats } from '@/app/actions/mains-studio';
import { 
  FileText, PenTool, Layers, TrendingUp, 
  AlertCircle, CheckCircle, ArrowRight 
} from 'lucide-react';

export default function MainsDashboard() {
  const [stats, setStats] = useState({ questions: 0, answers: 0, pending: 0, topics: 0 });

  useEffect(() => {
    getMainsStats().then(setStats);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mains Control Center</h1>
        <p className="text-slate-500">Manage your subjective question bank and model answers.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Questions</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.questions}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5"/></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Model Answers</p>
              <h3 className="text-3xl font-bold text-emerald-700 mt-1">{stats.answers}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5"/></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm ring-1 ring-amber-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase">Pending Answers</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle className="w-5 h-5"/></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Active Topics</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.topics}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers className="w-5 h-5"/></div>
          </div>
        </div>
      </div>

      {/* ACTION DECK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: QUESTION STUDIO */}
        <Link href="/admin/mains/mains/questions" 
          className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
            <FileText className="w-6 h-6" /> Question Studio
          </h3>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-sm">
            Add new questions via Single Entry or Bulk Import (JSON). 
            Auto-builds your Topic Tree.
          </p>
          <div className="mt-6 flex items-center text-sm font-bold text-indigo-600">
            Open Studio <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
          </div>
        </Link>

        {/* CARD 2: ANSWER STUDIO */}
        <Link href="/admin/mains/answers"
          className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PenTool className="w-24 h-24 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
            <PenTool className="w-6 h-6" /> Answer Studio
          </h3>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-sm">
            Write or paste model answers for the <strong>{stats.pending} pending questions</strong>.
            Link them directly to the question bank.
          </p>
          <div className="mt-6 flex items-center text-sm font-bold text-emerald-600">
            Start Writing <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
          </div>
        </Link>

      </div>
    </div>
  );
}