// components/admin/HotspotModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Hotspot } from '@/lib/quizTypes';
import MagicEditor from './MagicEditor'; // <-- 💎 NEW IMPORT 💎

// This data is passed *to* the modal when it opens
export interface HotspotModalData {
  term: string; // The text you selected
  type: 'green' | 'blue' | 'red';
  definition: string;
}

// These are the props for the modal component itself
interface HotspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave returns the *full* Hotspot data
  onSave: (data: HotspotModalData) => void;
  onDelete?: () => void; // Optional: only for editing
  initialData: HotspotModalData | null;
}

export default function HotspotModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}: HotspotModalProps) {
  const [term, setTerm] = useState('');
  const [type, setType] = useState<'green' | 'blue' | 'red'>('green');
  const [definition, setDefinition] = useState('');

  // When the modal opens, populate its state from the initialData prop
  useEffect(() => {
    if (initialData) {
      setTerm(initialData.term);
      setType(initialData.type);
      setDefinition(initialData.definition);
    }
  }, [initialData]);

  // Helper function to handle saving
  const handleSave = () => {
    onSave({ term, type, definition });
  };

  // Helper function to handle deletion
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="space-y-4">
          {/* Modal Header */}
          <h2 className="text-xl font-bold text-gray-900">
            {onDelete ? 'Edit Hotspot' : 'Create Hotspot'}
          </h2>

          {/* Term (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hotspot Term (Selected Text)
            </label>
            <input
              type="text"
              value={term}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100 text-gray-500"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pen Type (Color)
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'green' | 'blue' | 'red')
              }
              className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="green">✅ Green (Info / Distractor)</option>
              <option value="blue">🌀 Blue (Connection)</option>
              <option value="red">❌ Red (Trap / Misconception)</option>
            </select>
          </div>

          {/* --- 💎 --- RICH DEFINITION EDITOR --- 💎 --- */}
          <div>
            <label
              htmlFor="definition"
              className="block text-sm font-medium text-gray-700"
            >
              Definition
            </label>
            {/* We replace the <textarea> with your MagicEditor */}
            <div className="editor-container border border-gray-300 rounded-md shadow-inner bg-white">
              <MagicEditor
                content={definition}
                onChange={(html) => setDefinition(html)}
                isEditable={true}
                autoFocus={true}
                // We OMIT `onConnectClick` here to disable
                // the "Connect" button in the Bubble Menu
              />
            </div>
          </div>
          {/* --- 💎 --- END OF FIX --- 💎 --- */}


          {/* Action Buttons */}
          <div className="flex justify-between">
            <div>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 font-medium text-red-600 bg-transparent rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}