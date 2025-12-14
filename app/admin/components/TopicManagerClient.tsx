// app/admin/components/TopicManagerClient.tsx
'use client';

import React, { useState } from 'react';
import { addTopic, deleteTopic, updateTopic, bulkAddTopics } from '@/app/actions/topics';
import { Folder, FileText, Trash2, ChevronRight, ChevronDown, Plus, Layers, Upload, X, Loader2, Edit2, Save } from 'lucide-react';

type Topic = {
  id: string;
  paper: string;
  subject: string;
  name: string;
  keywords: string[]; // This matches the TEXT[] column in DB
  parent_id: string | null;
  slug: string;
};

export default function TopicManagerClient({ initialTopics }: { initialTopics: Topic[] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // -- Form State --
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [formData, setFormData] = useState({ 
    paper: 'GS2', 
    subject: 'Polity', 
    name: '', 
    keywords: '', // We manage this as a string in the UI (comma separated)
    parentId: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- Bulk Import State --
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // -- Helpers --
  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // -- ACTION: Load Edit Mode --
  const handleEditClick = (t: Topic) => {
    setIsEditing(true);
    setActiveId(t.id);
    setFormData({
      paper: t.paper,
      subject: t.subject,
      name: t.name,
      keywords: t.keywords ? t.keywords.join(', ') : '', // Convert Array -> String for input
      parentId: t.parent_id || ''
    });
    // Scroll to form (for mobile/small screens)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -- ACTION: Submit (Add or Update) --
  const handleSubmit = async () => {
    if (!formData.name) return alert("Please enter a Topic Name");
    setIsSubmitting(true);

    const data = new FormData();
    data.append('paper', formData.paper);
    data.append('subject', formData.subject);
    data.append('name', formData.name);
    data.append('keywords', formData.keywords); // Sends "Law, Order, Judge" string
    if (formData.parentId) data.append('parentId', formData.parentId);

    let res;
    if (isEditing) {
      data.append('id', activeId);
      res = await updateTopic(data);
    } else {
      res = await addTopic(data);
    }

    if (res.success) {
      window.location.reload();
    } else {
      alert('Error: ' + res.error);
    }
    setIsSubmitting(false);
  };

  // -- ACTION: Delete --
  const handleDelete = async (id: string) => {
    if(!confirm('Delete this topic? ALL sub-topics will also be deleted.')) return;
    await deleteTopic(id);
    window.location.reload();
  };

  // -- ACTION: Bulk Import --
  const handleBulkImport = async () => {
    try {
      setIsBulkLoading(true);
      const parsed = JSON.parse(bulkJson);
      
      // Basic Validation
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON Array [...]");

      const res = await bulkAddTopics(parsed);
      
      if (res.success) {
        alert(`✅ Successfully imported ${res.count} topics with AI Embeddings!`);
        setIsBulkOpen(false);
        setBulkJson('');
        window.location.reload();
      } else {
        alert("❌ Error: " + res.error);
      }
    } catch (e: any) {
      alert("Invalid JSON format: " + e.message);
    } finally {
      setIsBulkLoading(false);
    }
  };

  // -- RECURSIVE TREE RENDERER --
  const renderTree = (parentId: string | null = null, depth = 0) => {
    // Find all children of this parent
    const nodes = topics.filter(t => t.parent_id === parentId);
    
    if (nodes.length === 0) return null;

    return (
      <div className={`flex flex-col gap-1 ${depth > 0 ? 'ml-6 border-l-2 border-slate-100 pl-2' : ''}`}>
        {nodes.map(node => {
          const hasChildren = topics.some(t => t.parent_id === node.id);
          const isExpanded = expanded[node.id];
          const isSelected = activeId === node.id;

          return (
            <div key={node.id}>
              {/* Node Row */}
              <div className={`flex items-center gap-2 p-2 rounded-lg group transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                
                {/* Expand/Collapse Toggle */}
                <button onClick={() => toggle(node.id)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600">
                   {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-1" />}
                </button>
                
                {/* Icon (Root vs Child) */}
                {depth === 0 ? <Layers size={16} className="text-indigo-600" /> : <FileText size={16} className="text-slate-400" />}
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`text-sm truncate ${depth === 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                    {node.name}
                    {depth === 0 && <span className="text-[10px] text-slate-400 font-normal ml-2">({node.paper} • {node.subject})</span>}
                  </span>
                  {/* Show snippet of keywords if they exist */}
                  {node.keywords && node.keywords.length > 0 && (
                     <span className="text-[10px] text-slate-400 truncate max-w-[300px]">
                       Keywords: {node.keywords.join(', ')}
                     </span>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  {/* EDIT BUTTON */}
                  <button 
                    onClick={() => handleEditClick(node)} 
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Topic"
                  >
                    <Edit2 size={14} />
                  </button>
                  
                  {/* ADD CHILD BUTTON (Sets Parent ID) */}
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ 
                        ...formData, 
                        parentId: node.id, 
                        paper: node.paper, 
                        subject: node.subject, 
                        name: '', 
                        keywords: '' 
                      });
                      // Optional: focus the input
                      document.getElementById('topicNameInput')?.focus();
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Add Sub-topic"
                  >
                    <Plus size={14} />
                  </button>

                  {/* DELETE BUTTON */}
                  <button 
                    onClick={() => handleDelete(node.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Topic"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Recursion: Render Children */}
              {isExpanded && renderTree(node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* LEFT COLUMN: The Hierarchy Tree */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Folder className="w-5 h-5 text-yellow-500" /> Topic Hierarchy
          </h3>
          <span className="text-xs text-slate-400">Total Nodes: {topics.length}</span>
        </div>
        {topics.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">
            Tree is empty. Add your first topic on the right.
          </div>
        ) : (
          renderTree(null) // Start rendering from Root (parentId = null)
        )}
      </div>

      {/* RIGHT COLUMN: The Form (Add / Edit) */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-6">
        
        {/* Header with Bulk Import Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center">
            {isEditing ? <Edit2 className="w-5 h-5 mr-2 text-blue-600"/> : <Plus className="w-5 h-5 mr-2 text-emerald-600"/>}
            {isEditing ? 'Edit Topic' : 'Add Topic'}
          </h3>
          {!isEditing && (
            <button 
              onClick={() => setIsBulkOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 border border-blue-100"
            >
              <Upload size={14} /> Bulk Import
            </button>
          )}
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...formData, name: '', keywords: '', parentId: '' });
              }} 
              className="text-xs text-red-500 hover:underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <div className="space-y-5">
          {/* Paper Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper</label>
            <select 
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white"
              value={formData.paper}
              onChange={e => setFormData({...formData, paper: e.target.value})}
            >
              <option>GS1</option><option>GS2</option><option>GS3</option><option>GS4</option>
            </select>
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
            <input 
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
              placeholder="e.g. Polity"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          {/* Parent Node Display */}
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Node</label>
             <div className="flex gap-2">
               <input 
                className={`w-full border p-2.5 rounded-lg text-sm ${formData.parentId ? 'bg-indigo-50 text-indigo-700 font-semibold border-indigo-200' : 'bg-slate-100 text-slate-500'}`}
                value={formData.parentId ? `Child of: ${topics.find(t => t.id === formData.parentId)?.name}` : 'Root Level (Top Topic)'}
                disabled
              />
              {formData.parentId && (
                <button 
                  onClick={() => setFormData({...formData, parentId: ''})}
                  className="px-3 py-1 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                  title="Clear Parent (Make Root)"
                >
                  <X size={14} />
                </button>
              )}
             </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Name</label>
            <input 
              id="topicNameInput"
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Federalism"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Keywords / Description Input */}
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
               Keywords / Description
             </label>
             <textarea 
               className="w-full border border-slate-300 p-2.5 rounded-lg text-sm h-24 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
               placeholder="e.g. Judge made law, Judicial Overreach, Tyranny of unelected..."
               value={formData.keywords}
               onChange={e => setFormData({...formData, keywords: e.target.value})}
             />
             <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
               <Layers size={10} /> 
               These help the AI Semantic Search find this topic.
             </p>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-black'}`}
          >
            {isSubmitting ? (
              <> <Loader2 className="animate-spin w-4 h-4" /> Saving... </>
            ) : (
              isEditing ? <> <Save className="w-4 h-4" /> Update Topic </> : <> <Plus className="w-4 h-4" /> Add Topic </>
            )}
          </button>
        </div>
      </div>

      {/* --- BULK IMPORT MODAL --- */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Bulk Import Topics
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800">
                <p className="font-bold mb-1">Instructions:</p>
                <p>Paste a JSON array generated by ChatGPT. The system will automatically generate <strong>Vertex AI Embeddings</strong> for each topic.</p>
              </div>
              
              <div className="mb-2 text-xs font-mono text-slate-500 uppercase font-bold">Expected Format:</div>
              <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs font-mono mb-4 overflow-x-auto shadow-inner">
{`[
  { 
    "paper": "GS2", 
    "subject": "Polity", 
    "name": "Cooperative Federalism",
    "keywords": ["Centre-State Relations", "NITI Aayog"],
    "parentId": "UUID-OF-FEDERALISM" 
  },
  { ... }
]`}
              </pre>

              <textarea 
                className="w-full h-40 border border-slate-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Paste JSON array here..."
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkImport}
                disabled={isBulkLoading}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 shadow-lg"
              >
                {isBulkLoading ? (
                  <> <Loader2 className="w-4 h-4 animate-spin" /> Processing AI... </>
                ) : (
                  <> <Upload className="w-4 h-4" /> Import & Embed </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}