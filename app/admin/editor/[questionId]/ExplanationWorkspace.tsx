// app/admin/editor/[questionId]/ExplanationWorkspace.tsx
'use client';

import React, { useState } from 'react';
import {
  UltimateExplanation,
  QuestionType,
  Hotspot,
} from '@/lib/quizTypes';
import MagicEditor from '@/components/admin/MagicEditor';
import { useAuthContext } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Editor as TiptapEditor } from '@tiptap/react';
import HotspotModal, {
  HotspotModalData,
} from '@/components/admin/HotspotModal';
// --- 💎 "TRUE WYSIWYG" FIX 💎 ---
// RenderWithRadixHotspots is NO LONGER NEEDED here because
// we are always in the editor.
import { Eye, Pencil, Lightbulb, Paperclip } from 'lucide-react';
import Image from 'next/image';

interface ExplanationWorkspaceProps {
  explanation: UltimateExplanation | null;
  setExplanation: (exp: UltimateExplanation) => void;
  questionId: string;
  questionType: QuestionType;
  handwrittenNoteUrl?: string | null;
}

export default function ExplanationWorkspace({
  explanation,
  setExplanation,
  questionId,
  questionType,
  handwrittenNoteUrl,
}: ExplanationWorkspaceProps) {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  // --- 💎 "TRUE WYSIWYG" FIX 💎 ---
  // The editingBlock state is GONE. This is the root of all bugs.
  // const [editingBlock, setEditingBlock] = useState<...>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  // --- Save to Firestore Logic (Unchanged) ---
  const handleSave = async () => {
    // ... (This function is correct and unchanged)
    if (!user) {
      toast.error('You must be logged in to save.');
      return;
    }
    if (!explanation) {
      toast.error('No explanation data to save. Please parse first.');
      return;
    }
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          explanation: explanation,
          questionType: questionType,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save data.');
      }
      toast.success('Explanation saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 💎 "TRUE WYSIWYG" FIX 💎 ---
  // The onBlur handler is NO LONGER NEEDED because we are never
  // switching back to a "preview" state.
  // const handleBlur = () => { setEditingBlock(null); };

  // --- Content Change Handler (Unchanged) ---
  const handleTopLevelContentChange = (
    field: 'howToThink' | 'coreAnalysis' | 'adminProTip',
    content: string
  ) => {
    if (explanation) {
      setExplanation({
        ...explanation,
        [field]: content,
      });
    }
  };

  // --- 💎 "TRUE WYSIWYG" FIX 💎 ---
  // handleHotspotClick is GONE. It was only for the preview.
  // const handleHotspotClick = (hotspot: Hotspot) => { ... };

  // --- Connect Click Handler (Unchanged) ---
  const handleConnectClick = (editor: TiptapEditor) => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error('Please select text to create or edit a hotspot.');
      return;
    }
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setActiveEditor(editor);
    const existingHotspot = explanation?.hotspotBank?.find(
      (h) => h.term === selectedText
    );
    if (existingHotspot) {
      setModalData({ ...existingHotspot });
    } else {
      setModalData({ term: selectedText, type: 'green', definition: '' });
    }
    setIsModalOpen(true);
  };

  // --- 💎 RUNTIME ERROR FIX 💎 ---
  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!explanation) return;
    if (activeEditor) {
      // We remove the .focus() call that caused the crash.
      activeEditor
        .chain()
        // .focus() // <-- BUGGY CODE REMOVED
        .setMark('hotspot', { type: data.type })
        .run();
    }
    // ... (rest of the function is correct)
    const existingIndex =
      explanation.hotspotBank?.findIndex((h) => h.term === data.term) ?? -1;
    let newHotspotBank: Hotspot[];
    if (existingIndex > -1) {
      newHotspotBank = [...(explanation.hotspotBank || [])];
      newHotspotBank[existingIndex] = data;
    } else {
      newHotspotBank = [...(explanation.hotspotBank || []), data];
    }
    setExplanation({ ...explanation, hotspotBank: newHotspotBank });
    setIsModalOpen(false);
    setActiveEditor(null);
    setModalData(null);
    toast.success(`Hotspot "${data.term}" saved!`);
  };

  const handleDeleteHotspot = () => {
    if (!explanation || !modalData) return;
    const termToDelete = modalData.term;
    if (activeEditor) {
      // We remove the .focus() call here too.
      activeEditor.chain().unsetMark('hotspot').run();
    }
    // ... (rest of the function is correct)
    const newHotspotBank = (explanation.hotspotBank || []).filter(
      (h) => h.term !== termToDelete
    );
    setExplanation({ ...explanation, hotspotBank: newHotspotBank });
    setIsModalOpen(false);
    setActiveEditor(null);
    setModalData(null);
    toast.success(`Hotspot "${termToDelete}" deleted.`);
  };

  // --- Render Logic ---

  if (!explanation) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
        <p>Click "Parse & Edit in Workspace" in Row 1 to load the editor.</p>
      </div>
    );
  }

  return (
    <>
      <HotspotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHotspot}
        onDelete={modalData?.definition ? handleDeleteHotspot : undefined}
        initialData={modalData}
      />

      <div className="w-full space-y-8">
        {/* --- 1. Topper's Mental Model --- */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-blue-600" />
            🧠 Topper's Mental Model (howToThink)
          </h2>
          {/* --- 💎 "TRUE WYSIWYG" FIX 💎 --- */}
          {/* The preview div is GONE. We ONLY render the editor. */}
          <div className="border rounded-lg shadow-inner bg-white">
            <MagicEditor
              content={explanation.howToThink}
              onChange={(html) =>
                handleTopLevelContentChange('howToThink', html)
              }
              onConnectClick={handleConnectClick}
              // onBlur prop is GONE.
            />
          </div>
        </div>

        {/* --- 2. CORE ANALYSIS --- */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Pencil className="w-6 h-6 mr-2 text-blue-600" />
            🎯 Core Analysis (Mental Model)
          </h2>
          {/* --- 💎 "TRUE WYSIWYG" FIX 💎 --- */}
          {/* The preview div is GONE. We ONLY render the editor. */}
          <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-inner">
            <MagicEditor
              content={explanation.coreAnalysis}
              onChange={(html) =>
                handleTopLevelContentChange('coreAnalysis', html)
              }
              onConnectClick={handleConnectClick}
              // onBlur prop is GONE.
            />
          </div>
        </div>

        {/* --- 3. Mentor's Pro-Tip --- */}
        <div className="playground-block">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              ✍️ Mentor's Pro-Tip
            </h2>
            {/* --- 💎 "TRUE WYSIWYG" FIX 💎 --- */}
            {/* The preview div is GONE. We ONLY render the editor. */}
            <MagicEditor
              content={explanation.adminProTip}
              onChange={(html) =>
                handleTopLevelContentChange('adminProTip', html)
              }
              onConnectClick={handleConnectClick}
              // onBlur prop is GONE.
            />
          </div>
        </div>

        {/* --- 4. HANDWRITTEN NOTE (Unchanged) --- */}
        {/* ... your handwritten note code ... */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Paperclip className="w-6 h-6 mr-2 text-blue-600" />
            My Handwritten Note
          </h2>
          {handwrittenNoteUrl ? (
            <div className="p-4 border rounded-lg shadow-inner bg-white">
              <Image
                src={handwrittenNoteUrl}
                alt="User's handwritten note"
                layout="responsive"
                width={800}
                height={1000}
                objectFit="contain"
                className="rounded-md"
              />
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500 text-center">
              <p>No handwritten note attached yet.</p>
            </div>
          )}
          <button
            onClick={() => toast.info('Upload feature coming soon!')}
            className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300"
          >
            Upload/Change Note (Coming Soon)
          </button>
        </div>

        {/* --- Save Button (Unchanged) --- */}
        <div className="pt-6 border-t mt-12">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-lg font-semibold text-white bg-blue-600 py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save to Firestore'}
          </button>
        </div>
      </div>
    </>
  );
}