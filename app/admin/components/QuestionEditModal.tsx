// app/admin/components/QuestionEditModal.tsx
// This is a new CLIENT component.
// This is the "Quick Edit" modal. It now correctly uses the 
// "Topic Tree" to create cascading dropdowns for Subject and Topic.

'use client';

import React, { useState, useMemo } from 'react';
import { MergedQuestion, TopicTree, TopicNode, FirestoreQuestion } from '@/lib/adminTypes'; // FIXED PATH
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // FIXED PATH
import { Loader2, Save, X, AlertCircle } from 'lucide-react';

interface QuestionEditModalProps {
  question: MergedQuestion;
  topicTree: TopicTree;
  onClose: () => void;
  onSave: (updatedQuestion: MergedQuestion) => void;
}

export default function QuestionEditModal({
  question,
  topicTree,
  onClose,
  onSave,
}: QuestionEditModalProps) {
  
  // Create a version of the question without the 'hasExplanation' prop
  const cleanQuestion: FirestoreQuestion = (({ hasExplanation, ...q }) => q)(question);
  
  const [formData, setFormData] = useState<FirestoreQuestion>(cleanQuestion);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Cascading Dropdown Logic ---
  const level1Topics = useMemo(() => {
    // We only show the "Prelim" root node for Prelims questions
    // This makes the dropdown cleaner
    return topicTree.filter(node => node.id === 'prelim');
  }, [topicTree]);

  const level2Topics = useMemo(() => {
    if (!formData.subject) return [];
    // Find the selected Level 1 node
    const parent = topicTree.find(node => node.id === formData.subject);
    return parent ? parent.children : [];
  }, [topicTree, formData.subject]); // Re-calculate when L1 selection changes
  // --- End Logic ---

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newState = {
        ...prev,
        [name]: name === 'year' ? Number(value) : value,
      };
      
      // If the subject (Level 1) changed, reset the topic (Level 2)
      if (name === 'subject') {
        newState.topic = '';
      }
      return newState;
    });
  };
  
  const handleOptionChange = (index: number, newText: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = newText;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };
  
  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const questionRef = doc(db, 'questions', question.id);
      
      // Create an update object from the form data
      const { id, ...updateData } = formData;
      
      // Ensure we are saving the correct type
      const dataToSave: Omit<FirestoreQuestion, 'id'> = updateData;
      
      await updateDoc(questionRef, dataToSave);
      
      // Pass the updated data back (including the 'hasExplanation' prop)
      onSave({ ...formData, hasExplanation: question.hasExplanation });
      
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const correctIndex = formData.options.findIndex(opt => opt.isCorrect);

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent click-through
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Question</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
             <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 mr-2" />
                <strong>Error:</strong> {error}
             </div>
          )}

          <div className="text-sm">
            <span className="font-medium">Question ID:</span> {formData.id}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          {/* Options Editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {formData.options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectAnswerChange(index)}
                  className="w-5 h-5"
                />
                <span className="font-mono text-sm">{String.fromCharCode(65 + index)}:</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
          </div>

          {/* --- NEW CASCADING DROPDOWNS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Subject (Level 1)</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="">Select Subject...</option>
                {level1Topics.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Topic (Level 2)</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                disabled={!formData.subject || level2Topics.length === 0}
                className="w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100"
              >
                <option value="">Select Topic...</option>
                {level2Topics.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md mr-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}