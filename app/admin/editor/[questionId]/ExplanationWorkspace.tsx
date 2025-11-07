'use client';

import React, { useState } from 'react';
import {
  UltimateExplanation, // We keep the name, but its *structure* is new
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
// We import the renderer from the UI component
import { RenderWithRadixHotspots } from '@/components/quiz/UltimateExplanationUI';
// Import all the icons we'll need for the new UI blocks
import { Eye, Pencil, Lightbulb, Paperclip } from 'lucide-react'; // Added Paperclip
import Image from 'next/image'; // Added Image

// --- 💎 FIXED 💎 ---
// These are the props passed down from page.tsx
interface ExplanationWorkspaceProps {
  explanation: UltimateExplanation | null;
  setExplanation: (exp: UltimateExplanation) => void;
  questionId: string;
  questionType: QuestionType; // We still get this, but our UI won't use it
  handwrittenNoteUrl?: string | null; // <-- This is the fix for the error
}

/**
 * --- 💎 "SOULFUL" HYBRID EDITOR (v3.0 - FINAL) 💎 ---
 * This file has been refactored to use the ONE, UNIVERSAL
 * "soulful" explanation model.
 *
 * - DELETED all 5 old schema blocks.
 * - DELETED all 10+ old state handlers.
 * - ADDED one new "coreAnalysis" block.
 * - MODIFIED handleTopLevelContentChange to be the only handler.
 * - ADDED handwrittenNoteUrl prop and display.
 */
export default function ExplanationWorkspace({
  explanation,
  setExplanation,
  questionId,
  questionType,
  handwrittenNoteUrl, // <-- We now receive the prop
}: ExplanationWorkspaceProps) {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  // --- "Soulful" Hybrid Editor State ---
  // This state tracks which of our 3 blocks is in "Edit Mode".
  const [editingBlock, setEditingBlock] = useState<
    'howToThink' | 'coreAnalysis' | 'adminProTip' | null
  >(null);

  // --- Hotspot Modal State (Unchanged) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  // --- Save to Firestore Logic ---
  const handleSave = async () => {
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
      // We are saving to our "split collection" API route
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          explanation: explanation,
          questionType: questionType, // We still save this
          // We don't need to save the handwrittenNoteUrl here,
          // as that's a separate "upload" operation.
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

  // --- Content Change Handlers (Immutability is critical) ---

  // This is our universal "onBlur" handler
  const handleBlur = () => {
    setEditingBlock(null);
  };

  /**
   * --- 💎 NEW "SOULFUL" HANDLER 💎 ---
   * This is now our ONE AND ONLY content change handler for all
   * 3 parts of our new "soulful" explanation.
   */
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

  // --- DELETED---
  // All 10+ complex state handlers for the 5 old schemas
  // (e.g., handleSingleChoiceOptionChange, handleHowManyItemChange)
  // are GONE. This file is now 100x simpler.

  // --- Hotspot Logic (Unchanged) ---
  // This logic works perfectly with our new model
  // because it only depends on `explanation.hotspotBank`.

  // (Method 1: Click Tooltip)
  const handleHotspotClick = (hotspot: Hotspot) => {
    toast.info(`Editing hotspot: ${hotspot.term}`);
    setModalData({
      term: hotspot.term,
      type: hotspot.type,
      definition: hotspot.definition,
    });
    setIsModalOpen(true);
    setActiveEditor(null);
  };

  // (Method 2: Select Text)
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

  // (Save - works for both methods)
  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!explanation) return;
    if (activeEditor) {
      // This logic is wrong, it should be <hotspot>
      // activeEditor.chain().focus().setMark('hotspot', { type: data.type }).run();
      // Your convertBracketsToSpans in CommandCenter.tsx handles this.
      // The MagicEditor should be updated to create <hotspot> tags.
      // For now, this just saves to the bank.
    }
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

  // (Delete - works for both methods)
  const handleDeleteHotspot = () => {
    if (!explanation || !modalData) return;
    const termToDelete = modalData.term;
    if (activeEditor) {
      // This logic is also related to Tiptap setup
      // activeEditor.chain().focus().unsetMark('hotspot').run();
    }
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

  // We can safely read this now.
  const hotspotBank = explanation.hotspotBank || [];

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
        {/* --- 1. Topper's Mental Model (Unchanged) --- */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-blue-600" />
            🧠 Topper's Mental Model (howToThink)
          </h2>
          <div className="p-4 border rounded-lg shadow-inner bg-white min-h-[100px]">
            {editingBlock === 'howToThink' ? (
              <MagicEditor
                content={explanation.howToThink}
                onChange={(html) =>
                  handleTopLevelContentChange('howToThink', html)
                }
                onConnectClick={handleConnectClick}
                onBlur={handleBlur}
                autoFocus={true}
              />
            ) : (
              <div
                className="cursor-text text-lg"
                onClick={() => setEditingBlock('howToThink')}
              >
                <RenderWithRadixHotspots
                  html={explanation.howToThink}
                  hotspotBank={hotspotBank}
                  onHotspotClick={handleHotspotClick}
                />
              </div>
            )}
          </div>
        </div>

        {/* --- 💎 2. CORE ANALYSIS (NEW "SOULFUL" BLOCK) 💎 --- */}
        {/* This replaces all 5 old, complex blocks */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Pencil className="w-6 h-6 mr-2 text-blue-600" />
            🎯 Core Analysis (Mental Model)
          </h2>
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-inner min-h-[150px]">
            {editingBlock === 'coreAnalysis' ? (
              <MagicEditor
                content={explanation.coreAnalysis}
                onChange={(html) =>
                  handleTopLevelContentChange('coreAnalysis', html)
                }
                onConnectClick={handleConnectClick}
                onBlur={handleBlur}
                autoFocus={true}
              />
            ) : (
              <div
                className="cursor-text text-lg"
                onClick={() => setEditingBlock('coreAnalysis')}
              >
                <RenderWithRadixHotspots
                  html={explanation.coreAnalysis}
                  hotspotBank={hotspotBank}
                  onHotspotClick={handleHotspotClick}
                />
              </div>
            )}
          </div>
        </div>
        {/* --- END OF NEW CORE ANALYSIS --- */}

        {/* --- 3. Mentor's Pro-Tip (Unchanged) --- */}
        <div className="playground-block">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-lg shadow-sm min-h-[100px]">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              ✍️ Mentor's Pro-Tip
            </h2>
            <div className="text-lg">
              {editingBlock === 'adminProTip' ? (
                <MagicEditor
                  content={explanation.adminProTip}
                  onChange={(html) =>
                    handleTopLevelContentChange('adminProTip', html)
                  }
                  onConnectClick={handleConnectClick}
                  onBlur={handleBlur}
                  autoFocus={true}
                />
              ) : (
                <div
                  className="cursor-text"
                  onClick={() => setEditingBlock('adminProTip')}
                >
                  <RenderWithRadixHotspots
                    html={explanation.adminProTip}
                    hotspotBank={hotspotBank}
                    onHotspotClick={handleHotspotClick}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* --- 💎 4. HANDWRITTEN NOTE (NEW) 💎 --- */}
        {/* This block is new, as requested. */}
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
          {/* We will add the 'Upload' button functionality in a future step */}
          <button
            onClick={() => toast.info('Upload feature coming soon!')}
            className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300"
          >
            Upload/Change Note (Coming Soon)
          </button>
        </div>

        {/* --- 5. Takeaway (DELETED) --- */}
        {/* The "Takeaway" block is gone, as it's no longer in our type. */}

        {/* Save Button (Unchanged) */}
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