"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Layers, ListPlus, ShieldCheck, 
  ChevronDown, ChevronRight, Edit2, Trash2, 
  Zap, Info, X, CornerDownRight, Folder,
  GanttChart, Database, Fingerprint, ExternalLink,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { TopicNode, bulkSeedTopics, verifyTopic, deleteTopic } from '@/app/actions/topics';

interface Props {
  initialTopics: TopicNode[];
}

export default function TopicManagerClient({ initialTopics }: Props) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'bulk' | 'provisional'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isSeeding, setIsSeeding] = useState(false);
  const [bulkInput, setBulkInput] = useState('- Judiciary | Focus on Supreme Court powers\n-- Judicial Review | Article 13 & 32');

  // --- Search & Selection Logic ---
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return initialTopics;
    return initialTopics.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialTopics, searchQuery]);

  const selectedTopic = useMemo(() => 
    initialTopics.find(t => t.id === selectedTopicId), 
  [initialTopics, selectedTopicId]);

  // --- Tree Interaction Logic ---
  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const renderTree = (parentId: string | null = null) => {
    const children = filteredTopics.filter(t => t.primary_parent_id === parentId && t.topic_type === 'canonical');
    
    return children.map(topic => {
      const hasChildren = filteredTopics.some(t => t.primary_parent_id === topic.id);
      const isExpanded = expandedNodes.has(topic.id);
      const isSelected = selectedTopicId === topic.id;

      return (
        <div key={topic.id} className="w-full">
          <div 
            onClick={() => setSelectedTopicId(topic.id)}
            className={`
              group flex items-center justify-between p-2 mb-0.5 rounded-lg cursor-pointer transition-all border
              ${isSelected ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleNode(topic.id); }}
                className={`p-0.5 rounded hover:bg-slate-200 transition-colors ${!hasChildren && 'invisible'}`}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <span className={`
                text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0
                ${topic.level === 1 ? 'bg-blue-100 text-blue-700' :
                  topic.level === 2 ? 'bg-emerald-100 text-emerald-700' :
                  topic.level === 3 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}
              `}>
                L{topic.level}
              </span>

              <span className={`text-sm truncate ${topic.level <= 2 ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}>
                {topic.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
              <span className="text-[10px] mono text-slate-400 mr-2 hidden lg:inline">{topic.slug}</span>
              <button onClick={() => toast.info("Manual edit mode coming soon")} className="p-1 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
            </div>
          </div>

          {isExpanded && hasChildren && (
            <div className="ml-4 border-l border-slate-100 pl-2 mt-0.5 animate-in slide-in-from-left-1 duration-200">
              {renderTree(topic.id)}
            </div>
          )}
        </div>
      );
    });
  };

  // --- Bulk Action Logic ---
  const handleBulkSubmit = async () => {
    // We assume Polity (L2) exists for this example. Logic should be flexible.
    const parent = initialTopics.find(t => t.slug === 'polity' || t.level === 2);
    if (!parent) return toast.error("Could not determine context parent (L2).");

    setIsSeeding(true);
    try {
      const promise = bulkSeedTopics({
        parentId: parent.id,
        ancestryPrefix: parent.ancestry_path,
        subjectSlug: parent.slug,
        rawText: bulkInput
      });

      toast.promise(promise, {
        loading: 'Generating 768-dim embeddings...',
        success: (data) => {
          setIsSeeding(false);
          return `Successfully seeded ${data.count} topics into ${parent.name}`;
        },
        error: (err) => {
          setIsSeeding(false);
          return `Seeding failed: ${err.message}`;
        }
      });
    } catch (e) {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header Section */}
      <div className="border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Precision Studio</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hierarchy Manager</h1>
              <p className="text-sm text-slate-500">Master architecture for semantic Mains evaluation.</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entire tree..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-72 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-slate-200">
                <Plus className="w-4 h-4" />
                <span>Single Topic</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-8 mt-8">
            <TabBtn active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')} icon={<Layers className="w-4 h-4" />} label="Explorer" />
            <TabBtn active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<ListPlus className="w-4 h-4" />} label="Bulk Seeder" />
            <TabBtn 
              active={activeTab === 'provisional'} 
              onClick={() => setActiveTab('provisional')} 
              icon={<ShieldCheck className="w-4 h-4" />} 
              label="Governance" 
              count={initialTopics.filter(t => t.topic_type === 'provisional').length} 
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 py-8">
        
        {activeTab === 'explorer' && (
          <div className="flex gap-8 h-[calc(100vh-320px)]">
            {/* Left: Scrollable Tree */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Root Hierarchy</span>
                <span className="text-[10px] text-slate-400 italic">L1-L4 Depth</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredTopics.length === 0 ? <EmptyState /> : renderTree(null)}
              </div>
            </div>

            {/* Right: Detail Sidebar */}
            <div className={`w-96 border border-slate-200 rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col ${!selectedTopic ? 'bg-slate-50/50 border-dashed opacity-50' : 'bg-white animate-in slide-in-from-right-4'}`}>
              {selectedTopic ? (
                <>
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">Level {selectedTopic.level}</span>
                      <button onClick={() => setSelectedTopicId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedTopic.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedTopic.id}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <DetailSection label="Ancestry Path" icon={<GanttChart className="w-3.5 h-3.5" />}>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] mono text-slate-600 break-all leading-relaxed">
                        {selectedTopic.ancestry_path}
                      </div>
                    </DetailSection>

                    <DetailSection label="Semantic Keywords" icon={<Fingerprint className="w-3.5 h-3.5" />}>
                      <div className="flex flex-wrap gap-2">
                        {selectedTopic.keywords.length > 0 ? selectedTopic.keywords.map((k, i) => (
                          <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">{k}</span>
                        )) : <span className="text-xs text-slate-400 italic">No description provided</span>}
                      </div>
                    </DetailSection>

                    <DetailSection label="Embedding Status" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}>
                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Active 768-dim vector synchronized</span>
                      </div>
                    </DetailSection>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3">
                    <button 
                      onClick={async () => {
                        if(confirm('Permanently delete this topic?')) {
                          await deleteTopic(selectedTopic.id);
                          toast.success('Topic purged');
                          setSelectedTopicId(null);
                        }
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Topic</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Node</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <Info className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Select a node from the tree to view its full semantic profile.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-4">
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800">Seeder Editor</h4>
                  <div className="flex space-x-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">- L3</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">-- L4</span>
                  </div>
                </div>
                <textarea 
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={15} 
                  className="w-full border border-slate-200 rounded-xl p-5 text-sm font-mono bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none shadow-inner"
                  placeholder="- Topic | Semantic Context..."
                />
              </div>
              <button 
                disabled={isSeeding}
                onClick={handleBulkSubmit}
                className={`
                  w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-3
                  ${isSeeding ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-1'}
                `}
              >
                {isSeeding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                <span>{isSeeding ? 'Generating Vectors...' : 'Sync Semantic Tree'}</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database className="w-48 h-48 text-white" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Live Engine Preview
              </h4>
              <div className="space-y-4 relative z-10">
                {bulkInput.split('\n').filter(l => l.trim()).map((line, i) => {
                  const isL4 = line.trim().startsWith('--');
                  const isL3 = !isL4 && line.trim().startsWith('-');
                  if(!isL3 && !isL4) return null;
                  
                  const content = line.replace(/^--?/, '').trim();
                  const [name, desc] = content.split('|').map(s => s.trim());

                  return (
                    <div key={i} className={`flex items-start space-x-3 ${isL4 ? 'ml-8' : 'ml-0 border-l-2 border-blue-500/30 pl-4 py-1'}`}>
                      {isL4 ? <CornerDownRight className="w-4 h-4 text-slate-600 mt-1" /> : <Folder className="w-5 h-5 text-blue-400 mt-0.5" />}
                      <div className="flex flex-col">
                        <span className={`text-sm ${isL3 ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>{name}</span>
                        {desc && (
                          <span className="text-[10px] text-emerald-400/80 italic mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">
                            Vector Context: {desc}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'provisional' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-8 bg-amber-50/50 border-b border-amber-100 flex items-center space-x-4">
              <div className="bg-amber-100 p-3 rounded-xl"><AlertCircle className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Governance Required</h3>
                <p className="text-sm text-slate-500">Review AI-extracted topics from question imports to maintain evaluation precision.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {initialTopics.filter(t => t.topic_type === 'provisional').map(topic => (
                <div key={topic.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-800 text-lg">{topic.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Provisional</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-slate-400 flex items-center"><Fingerprint className="w-3 h-3 mr-1" /> Suggested Slug: {topic.slug}</span>
                      <span className="text-xs text-slate-400 flex items-center"><Layers className="w-3 h-3 mr-1" /> Depth: L{topic.level}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => deleteTopic(topic.id)} className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600">Discard</button>
                    <button onClick={() => verifyTopic(topic.id)} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-md">Verify & Save</button>
                  </div>
                </div>
              ))}
              {initialTopics.filter(t => t.topic_type === 'provisional').length === 0 && (
                <div className="p-20 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">All AI-suggested topics have been canonized.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// --- Sub-Components ---

function TabBtn({ active, onClick, icon, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        pb-4 text-sm font-bold flex items-center space-x-2 transition-all border-b-2
        ${active ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}
      `}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
          {count}
        </span>
      )}
    </button>
  );
}

function DetailSection({ label, icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="bg-slate-50 p-6 rounded-full mb-4"><Folder className="w-12 h-12 opacity-20" /></div>
      <p className="font-medium">No architecture found matching your query.</p>
      <button className="text-blue-600 text-xs font-bold mt-2 hover:underline">Clear all filters</button>
    </div>
  );
}