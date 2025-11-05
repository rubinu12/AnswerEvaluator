// components/admin/HotspotModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Hotspot } from '@/lib/quizTypes'; // We will use our existing Hotspot type

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
    } else {
      // Reset form when opening for a "new" hotspot
      setTerm('');
      setType('green');
      setDefinition('');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ term, type, definition });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  // This is a simple modal using fixed position and a backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Hotspot Editor</h2>

        {/* Term (Read-only, it's the text you selected) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Term
          </label>
          <input
            type="text"
            value={term}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        {/* Pen Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Pen Type
          </label>
          <div className="flex space-x-2">
            {(['green', 'blue', 'red'] as const).map((penType) => (
              <button
                key={penType}
                onClick={() => setType(penType)}
                className={`px-4 py-2 rounded-md ${
                  type === penType
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200'
                } ${
                  penType === 'green' && type === 'green'
                    ? 'bg-green-600'
                    : ''
                } ${
                  penType === 'blue' && type === 'blue' ? 'bg-blue-600' : ''
                } ${penType === 'red' && type === 'red' ? 'bg-red-600' : ''}`}
              >
                {penType.charAt(0).toUpperCase() + penType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Definition */}
        <div className="mb-6">
          <label
            htmlFor="definition"
            className="block text-sm font-medium text-gray-700"
          >
            Definition
          </label>
          <textarea
            id="definition"
            rows={4}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the 'Deeper Knowledge', 'Connection', or 'Trap'..."
          ></textarea>
        </div>

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
              Save Hotspot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}