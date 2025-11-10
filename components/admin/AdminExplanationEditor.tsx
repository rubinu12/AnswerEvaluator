// components/admin/AdminExplanationEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Question,
  UltimateExplanation,
  Hotspot,
  isUltimateExplanation,
} from '@/lib/quizTypes';
import { generateDetailedPrompt } from '@/lib/promptGenerator';
import { useAuthContext } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Editor as TiptapEditor } from '@tiptap/react';
import {
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  Brain,
  Target,
  Pen,
  Copy,
  Download,
} from 'lucide-react';

// Our new, stable "Hybrid" editor
import MagicEditor from '@/components/admin/MagicEditor';
// The modal for creating/editing hotspots
import HotspotModal, {
  HotspotModalData,
} from '@/components/admin/HotspotModal';

// This is the empty state for a new explanation
const EMPTY_EXPLANATION: UltimateExplanation = {
  howToThink: '',
  coreAnalysis: '',
  adminProTip: '',
  hotspotBank: [],
};

/**
 * --- 💎 THE "FIXED" PARSER HELPER 💎 ---
 * This function takes the raw HTML from the AI and the hotspotBank,
 * finds all [Terms] in the HTML, and replaces them with the
 * <span class="hotspot-mark">...</span> tag that Tiptap/CSS understands.
 */
const convertBracketsToSpans = (
  html: string,
  hotspotBank: Hotspot[]
): string => {
  if (!html || !hotspotBank) return html;
  let processedHtml = html;
  for (const hotspot of hotspotBank) {
    // Escape special regex characters in the term
    const escapedTerm = hotspot.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Create a regex to find the term wrapped in square brackets
    // [Some Key Term] -> <span ...>Some Key Term</span>
    const regex = new RegExp(`\\[${escapedTerm}\\]`, 'g');
    const replacement = `<span class="hotspot-mark" data-type="${hotspot.type}">${hotspot.term}</span>`;
    processedHtml = processedHtml.replace(regex, replacement);
  }
  return processedHtml;
};
// --- 💎 END OF "FIXED" PARSER HELPER 💎 ---

interface AdminExplanationEditorProps {
  question: Question;
  onSave: (newExplanation: UltimateExplanation) => Promise<void>;
  onClose: () => void;
}

export default function AdminExplanationEditor({
  question,
  onSave,
  onClose,
}: AdminExplanationEditorProps) {
  const { user } = useAuthContext();

  // --- Core State ---
  const [explanation, setExplanation] = useState<UltimateExplanation | null>(
    null
  );
  const [rawAiResponse, setRawAiResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- "Hybrid Editor" State ---
  // This tracks which block is currently editable, or 'null' if all are read-only
  const [editingBlock, setEditingBlock] = useState<
    'howToThink' | 'coreAnalysis' | 'adminProTip' | null
  >(null);

  // --- Control Room State ---
  const [isControlRoomOpen, setIsControlRoomOpen] = useState(false);

  // --- Hotspot Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  // This "Smart Check" logic correctly loads an existing explanation
  // or prepares an empty one.
  useEffect(() => {
    if (isUltimateExplanation(question.explanation)) {
      setExplanation(question.explanation);
      setIsControlRoomOpen(false); // Hide controls if already done
    } else {
      setExplanation(EMPTY_EXPLANATION);
      setIsControlRoomOpen(true); // Show controls to start
    }
  }, [question]);

  // --- Control Room Functions ---
  const handleGeneratePrompt = () => {
    try {
      const prompt = generateDetailedPrompt(
        question,
        question.questionType || 'SingleChoice'
      );
      navigator.clipboard.writeText(prompt);
      toast.success('Prompt generated and copied to clipboard!');
    } catch (error) {
      console.error('Prompt generation error:', error);
      toast.error('Failed to generate prompt.');
    }
  };

  // --- 💎 "BROKEN PARSE" FUNCTION (NOW FIXED) 💎 ---
  const handleParse = () => {
    if (!rawAiResponse.trim()) {
      toast.error('Paste JSON response from AI first.');
      return;
    }
    let parsedData: any;
    try {
      // Clean up markdown code blocks if AI wrapped the JSON
      const cleanedResponse = rawAiResponse
        .replace(/^```json\s*/, '')
        .replace(/```$/, '');
      parsedData = JSON.parse(cleanedResponse);
    } catch (error: any) {
      toast.error(`Invalid JSON: ${error.message}`);
      return;
    }

    // Now we check against our "v4" schema
    if (isUltimateExplanation(parsedData)) {
      const bank = parsedData.hotspotBank || [];

      // Use our new helper function to process the HTML
      const processed: UltimateExplanation = {
        howToThink: convertBracketsToSpans(parsedData.howToThink || '', bank),
        coreAnalysis: convertBracketsToSpans(
          parsedData.coreAnalysis || '',
          bank
        ),
        adminProTip: convertBracketsToSpans(
          parsedData.adminProTip || '',
          bank
        ),
        hotspotBank: bank,
      };

      setExplanation(processed);
      toast.success('AI Response Parsed! Loading workspace...');
      setRawAiResponse('');
      setIsControlRoomOpen(false);
      setEditingBlock(null); // Ensure all editors are in read-only mode
    } else {
      toast.error(
        'Parse Error: JSON missing "soulful" fields (howToThink, coreAnalysis, etc.)'
      );
    }
  };
  // --- 💎 END OF "BROKEN PARSE" FIX 💎 ---

  // --- Editor Content Change Handler ---
  const handleContentChange = (
    field: 'howToThink' | 'coreAnalysis' | 'adminProTip',
    content: string
  ) => {
    if (explanation) {
      setExplanation((prev) => ({
        ...prev!,
        [field]: content,
      }));
    }
  };

  // --- "Hybrid Editor" Click-to-Edit Handler ---
  // This just sets the state. The MagicEditor component handles the rest.
  const handleEditClick = (
    field: 'howToThink' | 'coreAnalysis' | 'adminProTip'
  ) => {
    setEditingBlock(field);
  };

  // --- Hotspot Modal Handlers ---

  // This is called by MagicEditor's "Connect" button.
  // This logic is now fixed and will work.
  const handleConnectClick = (editor: TiptapEditor) => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error('Please select text to create a hotspot.');
      return;
    }
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setActiveEditor(editor); // Save editor to apply mark later
    const existingHotspot = explanation?.hotspotBank?.find(
      (h) => h.term === selectedText
    );
    setModalData(
      existingHotspot || { term: selectedText, type: 'green', definition: '' }
    );
    setIsModalOpen(true);
  };

  // This handles saving from the HotspotModal
  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!explanation) return;

    // This is the new "Connect" logic
    if (activeEditor) {
      activeEditor
        .chain()
        .focus()
        .setMark('hotspot', { type: data.type })
        .run();
    }

    // Update the bank
    const newBank = [...explanation.hotspotBank];
    const existingIndex = newBank.findIndex((h) => h.term === data.term);

    const hotspotToSave: Hotspot = {
      term: data.term,
      type: data.type,
      definition: data.definition,
    };

    if (existingIndex > -1) {
      // Update existing hotspot
      newBank[existingIndex] = hotspotToSave;
    } else {
      // Add new hotspot
      newBank.push(hotspotToSave);
    }
    setExplanation((prev) => ({ ...prev!, hotspotBank: newBank }));

    toast.success(`Hotspot "${data.term}" saved!`);
    closeModal();
  };

  const handleDeleteHotspot = () => {
    if (!explanation || !modalData) return;
    const termToDelete = modalData.term;

    // This is the new "Disconnect" logic
    if (activeEditor) {
      activeEditor.chain().focus().unsetMark('hotspot').run();
    }

    // Update the bank
    const newBank = explanation.hotspotBank.filter(
      (h) => h.term !== termToDelete
    );
    setExplanation((prev) => ({ ...prev!, hotspotBank: newBank }));

    toast.success(`Hotspot "${termToDelete}" deleted.`);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setActiveEditor(null);
  };

  // --- Main Save Function (Unchanged, but now works) ---
  const handleSaveToFirestore = async () => {
    if (!explanation) {
      toast.error('No explanation to save.');
      return;
    }
    // Before saving, ensure all editors are blurred
    setEditingBlock(null);
    setIsSaving(true);

    try {
      // A small delay to allow editors to blur and update state
      setTimeout(async () => {
        await onSave(explanation);
        toast.success('Explanation saved successfully!');
        setIsSaving(false);
        onClose(); // Close the modal
      }, 100);
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
      setIsSaving(false);
    }
  };

  if (!explanation) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* --- 1. Main Header Bar (Professional) --- */}
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Admin Explanation Editor
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="btn px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="btn px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400 min-w-[90px]"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5 sm:mr-2" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* --- 2. Collapsible Control Room (Professional) --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <button
          onClick={() => setIsControlRoomOpen(!isControlRoomOpen)}
          className="w-full p-4 text-left font-semibold text-gray-700 flex justify-between items-center hover:bg-gray-50 rounded-t-lg"
        >
          Admin Control Room
          {isControlRoomOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
        {isControlRoomOpen && (
          <div className="p-4 sm:p-6 border-t border-gray-200 space-y-4 bg-gray-50/50 rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 & 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Step 1: Generate Prompt
                  </label>
                  <button
                    onClick={handleGeneratePrompt}
                    className="btn w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Generate & Copy Prompt
                  </button>
                </div>
                <div>
                  <label
                    htmlFor="ai-response"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Step 2: Paste AI JSON Response
                  </label>
                  <textarea
                    id="ai-response"
                    value={rawAiResponse}
                    onChange={(e) => setRawAiResponse(e.target.value)}
                    rows={8}
                    className="w-full border border-gray-300 rounded-md p-2 font-mono text-xs shadow-inner"
                    placeholder="Paste AI JSON here..."
                  />
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Step 3: Parse & Load
                </label>
                <button
                  onClick={handleParse}
                  className="btn w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Parse & Load Workspace
                </button>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                  <strong className="font-semibold">Note:</strong> Clicking
                  "Parse" will overwrite any unsaved changes in the workspace
                  below.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- 3. "HYBRID" Soulful Editor (Professional & Fixed) --- */}
      <div className="space-y-6">
        {/* --- Block 1: howToThink --- */}
        <div
          className={`border rounded-lg shadow-inner transition-all ${
            editingBlock === 'howToThink'
              ? 'bg-white border-blue-400 ring-2 ring-blue-200'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleEditClick('howToThink')}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center p-4">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            🧠 Topper's Mental Model
          </h3>
          <div
            className={`editor-container ${
              editingBlock !== 'howToThink' ? 'cursor-pointer' : ''
            }`}
          >
            <MagicEditor
              content={explanation.howToThink}
              onChange={(html) => handleContentChange('howToThink', html)}
              onConnectClick={handleConnectClick}
              isEditable={editingBlock === 'howToThink'}
            />
          </div>
        </div>

        {/* --- Block 2: coreAnalysis --- */}
        <div
          className={`border-l-4 rounded-r-lg shadow-inner transition-all ${
            editingBlock === 'coreAnalysis'
              ? 'bg-white border-blue-500 ring-2 ring-blue-200'
              : 'bg-blue-50 border-blue-200 hover:border-blue-300'
          }`}
          onClick={() => handleEditClick('coreAnalysis')}
        >
          <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center p-4">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            🎯 Core Analysis
          </h3>
          <div
            className={`editor-container ${
              editingBlock !== 'coreAnalysis' ? 'cursor-pointer' : ''
            }`}
          >
            <MagicEditor
              content={explanation.coreAnalysis}
              onChange={(html) => handleContentChange('coreAnalysis', html)}
              onConnectClick={handleConnectClick}
              isEditable={editingBlock === 'coreAnalysis'}
            />
          </div>
        </div>

        {/* --- Block 3: adminProTip --- */}
        <div
          className={`border rounded-lg shadow-inner transition-all ${
            editingBlock === 'adminProTip'
              ? 'bg-white border-blue-400 ring-2 ring-blue-200'
              : 'bg-blue-100 border-blue-200 hover:border-blue-300'
          }`}
          onClick={() => handleEditClick('adminProTip')}
        >
          <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center p-4">
            <Pen className="w-5 h-5 mr-2 text-blue-600" />
            ✍️ Mentor's Pro-Tip
          </h3>
          <div
            className={`editor-container ${
              editingBlock !== 'adminProTip' ? 'cursor-pointer' : ''
            }`}
          >
            <MagicEditor
              content={explanation.adminProTip}
              onChange={(html) => handleContentChange('adminProTip', html)}
              onConnectClick={handleConnectClick}
              isEditable={editingBlock === 'adminProTip'}
            />
          </div>
        </div>
      </div>

      {/* --- 4. Hotspot Modal (Unchanged) --- */}
      <HotspotModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveHotspot}
        onDelete={modalData?.definition ? handleDeleteHotspot : undefined}
        initialData={modalData}
      />
    </div>
  );
}