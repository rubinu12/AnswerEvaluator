// components/admin/AdminExplanationEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Question,
  UltimateExplanation,
  Hotspot,
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
  AlertTriangle,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

import MagicEditor from '@/components/admin/MagicEditor';
import HotspotModal, {
  HotspotModalData,
} from '@/components/admin/HotspotModal';

const EMPTY_EXPLANATION: UltimateExplanation = {
  howToThink: '',
  coreAnalysis: '',
  adminProTip: '',
  hotspotBank: [],
};

// Robust JSON Validation Function
const validateExplanationJSON = (
  data: any
): { isValid: boolean; error: string | null; data?: UltimateExplanation } => {
  if (typeof data !== 'object' || data === null) {
    return { isValid: false, error: 'Input is not a valid JSON object.' };
  }
  const requiredKeys: Array<keyof UltimateExplanation> = [
    'howToThink',
    'coreAnalysis',
    'adminProTip',
    'hotspotBank',
  ];
  for (const key of requiredKeys) {
    if (!(key in data)) {
      return { isValid: false, error: `JSON is missing required key: "${key}"` };
    }
  }
  if (typeof data.howToThink !== 'string') {
    return { isValid: false, error: 'Key "howToThink" must be a string.' };
  }
  if (typeof data.coreAnalysis !== 'string') {
    return { isValid: false, error: 'Key "coreAnalysis" must be a string.' };
  }
  if (typeof data.adminProTip !== 'string') {
    return { isValid: false, error: 'Key "adminProTip" must be a string.' };
  }
  if (!Array.isArray(data.hotspotBank)) {
    return { isValid: false, error: 'Key "hotspotBank" must be an array.' };
  }
  for (const item of data.hotspotBank) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.term !== 'string' ||
      typeof item.type !== 'string' ||
      typeof item.definition !== 'string'
    ) {
      return {
        isValid: false,
        error:
          'An item in "hotspotBank" has an invalid shape. Must include term, type, and definition.',
      };
    }
  }
  return {
    isValid: true,
    error: null,
    data: data as UltimateExplanation,
  };
};

const convertBracketsToSpans = (
  html: string,
  hotspotBank: Hotspot[]
): string => {
  if (!html || !hotspotBank) return html;
  let processedHtml = html;
  const sortedBank = [...hotspotBank].sort(
    (a, b) => b.term.length - a.term.length
  );
  for (const hotspot of sortedBank) {
    const escapedTerm = hotspot.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!>)\\[${escapedTerm}\\]`, 'g');
    const replacement = `<span class="hotspot-mark" data-type="${hotspot.type}">${hotspot.term}</span>`;
    processedHtml = processedHtml.replace(regex, replacement);
  }
  return processedHtml;
};

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
  const [explanation, setExplanation] = useState<UltimateExplanation | null>(
    null
  );
  const [rawAiResponse, setRawAiResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<
    'howToThink' | 'coreAnalysis' | 'adminProTip' | null
  >(null);
  const [isControlRoomOpen, setIsControlRoomOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  useEffect(() => {
    let loadedExplanation: UltimateExplanation | null = null;
    let explanationProp = question.explanation;
    if (typeof explanationProp === 'string') {
      try {
        const parsed = JSON.parse(explanationProp);
        if (typeof parsed === 'object' && parsed !== null) {
          explanationProp = parsed;
        }
      } catch (e) {
        // It's just a string (e.g., "No explanation yet"), not JSON.
      }
    }
    if (
      typeof explanationProp === 'object' &&
      explanationProp !== null &&
      'howToThink' in explanationProp &&
      'coreAnalysis' in explanationProp
    ) {
      loadedExplanation = explanationProp as UltimateExplanation;
    }
    if (loadedExplanation) {
      setExplanation(loadedExplanation);
      setIsControlRoomOpen(false);
    } else {
      setExplanation(EMPTY_EXPLANATION);
      setIsControlRoomOpen(true);
    }
  }, [question]);

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

  const handleParse = () => {
    if (!rawAiResponse.trim()) {
      toast.error('Paste JSON response from AI first.');
      return;
    }
    let parsedData: any;
    try {
      let cleanedResponse = rawAiResponse
        .replace(/^```json\s*/, '')
        .replace(/```$/, '');
      const nonBreakingSpace = new RegExp(String.fromCharCode(160), 'g');
      cleanedResponse = cleanedResponse.replace(nonBreakingSpace, ' ');
      parsedData = JSON.parse(cleanedResponse);
    } catch (error: any) {
      toast.error(`Invalid JSON: ${error.message}`, {
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      });
      return;
    }

    const validation = validateExplanationJSON(parsedData);

    if (validation.isValid && validation.data) {
      try {
        const bank = validation.data.hotspotBank || [];

        const processed: UltimateExplanation = {
          howToThink: convertBracketsToSpans(
            validation.data.howToThink || '',
            bank
          ),
          coreAnalysis: convertBracketsToSpans(
            validation.data.coreAnalysis || '',
            bank
          ),
          adminProTip: convertBracketsToSpans(
            validation.data.adminProTip || '',
            bank
          ),
          hotspotBank: bank,
        };

        setExplanation(processed);
        toast.success('AI Response Parsed! Loading workspace...');
        setRawAiResponse('');
        setIsControlRoomOpen(false);
        setEditingBlock(null);
      } catch (error: any) {
        console.error('Processing error:', error);
        toast.error(`Processing Error: ${error.message}`, {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          duration: 5000,
        });
      }
    } else {
      toast.error(validation.error || 'Failed to parse JSON.', {
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        duration: 5000,
      });
    }
  };

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

  // --- 💎 --- NEW "SMART CLICK" HANDLER --- 💎 ---
  const handleBlockClick = (
    e: React.MouseEvent<HTMLDivElement>,
    field: 'howToThink' | 'coreAnalysis' | 'adminProTip'
  ) => {
    // Check if the user clicked *on* a hotspot span
    const hotspotSpan = (e.target as HTMLElement).closest('.hotspot-mark');
    
    // Only intercept if the block is NOT already being edited
    if (hotspotSpan && editingBlock !== field && explanation) {
      // --- 1. CLICKED ON A HOTSPOT ---
      e.stopPropagation(); // Stop the click from triggering the edit mode
      const term = hotspotSpan.textContent;
      if (!term) return;

      const hotspotData = explanation.hotspotBank.find((h) => h.term === term);
      
      if (hotspotData) {
        // Found it! Open the modal in EDIT mode.
        setModalData(hotspotData);
        setIsModalOpen(true);
        // We set activeEditor to null because we are editing
        // via the modal, not the Bubble Menu.
        setActiveEditor(null); 
      } else {
        toast.error(`Hotspot data for "${term}" not found in bank.`);
      }
      
    } else {
      // --- 2. CLICKED ON WHITESPACE (or in an active editor) ---
      // This is your original, correct flow.
      setEditingBlock(field);
    }
  };
  // --- 💎 --- END OF "SMART CLICK" HANDLER --- 💎 ---


  /**
   * This function is now ONLY for CREATING new hotspots
   * from the Bubble Menu.
   */
  const handleConnectClick = (editor: TiptapEditor) => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error('Please select text to create a hotspot.');
      return;
    }
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    // This is the key: we save *which* editor is active
    // so `handleSaveHotspot` knows where to apply the mark.
    setActiveEditor(editor);
    
    const existingHotspot = explanation?.hotspotBank?.find(
      (h) => h.term === selectedText
    );
    
    setModalData(
      existingHotspot || { term: selectedText, type: 'green', definition: '' }
    );
    setIsModalOpen(true);
  };

  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!explanation) return;
    
    // 1. Update the Tiptap <span> (if we are creating a new one)
    // `activeEditor` is ONLY set when creating via Bubble Menu.
    if (activeEditor) {
      activeEditor
        .chain()
        .focus()
        .setMark('hotspot', { type: data.type })
        .run();
    }
    
    // 2. Update the Hotspot Bank (always)
    const newBank = [...explanation.hotspotBank];
    const existingIndex = newBank.findIndex((h) => h.term === data.term);
    const hotspotToSave: Hotspot = {
      term: data.term,
      type: data.type,
      definition: data.definition,
    };
    if (existingIndex > -1) {
      newBank[existingIndex] = hotspotToSave;
    } else {
      newBank.push(hotspotToSave);
    }
    setExplanation((prev) => ({ ...prev!, hotspotBank: newBank }));

    // 3. Manually update the other read-only editors
    // This is a "force refresh" to make the text in the *other*
    // blocks reflect the new `hotspotBank` data.
    // This is a subtle but important fix.
    if (!activeEditor) {
      setExplanation((prev) => ({...prev!}));
    }

    toast.success(`Hotspot "${data.term}" saved!`);
    closeModal();
  };

  const handleDeleteHotspot = () => {
    if (!explanation || !modalData) return;
    const termToDelete = modalData.term;
    
    // 1. Remove Mark from Tiptap editor (if it's active)
    if (activeEditor) {
      activeEditor.chain().focus().unsetMark('hotspot').run();
    }
    // We also need to find and remove the span from the *other*
    // editors' content. This is complex. A simpler way is
    // to just update the bank and let the user re-parse if
    // they want to remove all spans.
    // For now, we just update the bank.

    // 2. Update the bank
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

  const handleSaveToFirestore = async () => {
    if (!explanation) {
      toast.error('No explanation to save.');
      return;
    }
    setEditingBlock(null);
    setIsSaving(true);
    try {
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
    <Tooltip.Provider delayDuration={300}>
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

        {/* --- 3. "HYBRID" Soulful Editor (Original Flow) --- */}
        <div className="space-y-6">
          {/* --- Block 1: howToThink --- */}
          <div
            className={`border rounded-lg shadow-inner transition-all ${
              editingBlock === 'howToThink'
                ? 'bg-white border-blue-400 ring-2 ring-blue-200'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            onClick={(e) => handleBlockClick(e, 'howToThink')}
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
                autoFocus={editingBlock === 'howToThink'}
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
            onClick={(e) => handleBlockClick(e, 'coreAnalysis')}
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
                autoFocus={editingBlock === 'coreAnalysis'}
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
            onClick={(e) => handleBlockClick(e, 'adminProTip')}
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
                autoFocus={editingBlock === 'adminProTip'}
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
    </Tooltip.Provider>
  );
}