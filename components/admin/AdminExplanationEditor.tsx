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
import { ChevronDown, ChevronRight, Save } from 'lucide-react';

// Our new, stable foundation
import MagicEditor from '@/components/admin/MagicEditor';
// The modal for creating/editing hotspots
import HotspotModal, {
  HotspotModalData,
} from '@/components/admin/HotspotModal';
// We NEED the renderer for "Preview Mode" to show tooltips
import { RenderWithRadixHotspots } from '@/components/quiz/UltimateExplanationUI';


const EMPTY_EXPLANATION: UltimateExplanation = {
  howToThink: '',
  coreAnalysis: '',
  adminProTip: '',
  hotspotBank: [],
};

// This helper function is correct
const convertBracketsToSpans = (
  html: string,
  hotspotBank: Hotspot[]
): string => {
  if (!html || !hotspotBank) return html;
  let processedHtml = html;
  for (const hotspot of hotspotBank) {
    const escapedTerm = hotspot.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedTerm}\\]`, 'g');
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

  // --- Core State ---
  const [explanation, setExplanation] = useState<UltimateExplanation | null>(
    null
  );
  const [rawAiResponse, setRawAiResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // This is the "click-to-edit" state.
  const [editingBlock, setEditingBlock] = useState<
    'howToThink' | 'coreAnalysis' | 'adminProTip' | null
  >(null);

  const [isControlRoomOpen, setIsControlRoomOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  // This "Smart Check" logic is correct
  useEffect(() => {
    if (isUltimateExplanation(question.explanation)) {
      setExplanation(question.explanation);
      setIsControlRoomOpen(false);
    } else {
      setExplanation(EMPTY_EXPLANATION);
      setIsControlRoomOpen(true);
    }
  }, [question]);

  // --- Control Room Functions (Correct) ---
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

  // --- 💎 "BROKEN PARSE" FIX (PROBLEM 4) 💎 ---
  // Added console.log statements for debugging
  const handleParse = () => {
    console.log('handleParse called. Raw response:', rawAiResponse); // DEBUG
    if (!rawAiResponse.trim()) {
      toast.error('Paste JSON response from AI first.');
      return;
    }
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawAiResponse);
      console.log('Parsed JSON data:', parsedData); // DEBUG
    } catch (error: any) {
      toast.error(`Invalid JSON: ${error.message}`);
      return;
    }
    
    if (isUltimateExplanation(parsedData)) {
      console.log('isUltimateExplanation check PASSED'); // DEBUG
      const bank = parsedData.hotspotBank || [];
      const processed: UltimateExplanation = {
        howToThink: convertBracketsToSpans(parsedData.howToThink || '', bank),
        coreAnalysis: convertBracketsToSpans(parsedData.coreAnalysis || '', bank),
        adminProTip: convertBracketsToSpans(parsedData.adminProTip || '', bank),
        hotspotBank: bank,
      };
      
      console.log('Processed explanation object:', processed); // DEBUG
      
      // Check if blocks are empty
      if (!processed.howToThink && !processed.coreAnalysis && !processed.adminProTip) {
        console.warn('Warning: All processed blocks are empty. Check parsedData fields.'); // DEBUG
        toast.warning('Parsed, but all content blocks were empty.');
      }

      setExplanation(processed);
      toast.success('AI Response Parsed! Loading workspace...');
      setRawAiResponse('');
      setIsControlRoomOpen(false);
    } else {
      console.error('isUltimateExplanation check FAILED'); // DEBUG
      toast.error(
        'Parse Error: JSON missing "soulful" fields (howToThink, coreAnalysis, etc.)'
      );
    }
  };
  // --- 💎 END OF "BROKEN PARSE" FIX 💎 ---

  // --- Editor Content Change Handler (Correct) ---
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
  
  // This is the new handler that switches back to "Preview Mode"
  const handleBlur = () => {
    setEditingBlock(null);
  };

  // --- Hotspot Modal Handlers ---
  
  // 1. For clicking text in the editor (BubbleMenu)
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

  // 2. For clicking tooltips in "Preview Mode"
  const handleHotspotClick = (hotspot: Hotspot) => {
    toast.info(`Editing hotspot: ${hotspot.term}`);
    setModalData({ ...hotspot });
    setIsModalOpen(true);
    setActiveEditor(null); // No active editor, we are in preview mode
  };

  // --- 💎 "BROKEN SAVE" FIX (PROBLEM 3) 💎 ---
  // This one function now handles saving from BOTH flows
  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!explanation) return;

    // Flow 1: We were in the editor
    if (activeEditor) {
      activeEditor.chain().setMark('hotspot', { type: data.type }).run();
    }
    
    // Flow 2: We were in "Preview Mode"
    if (!activeEditor) {
      const updateHtml = (html: string) => {
        const regex = new RegExp(`(<span class="hotspot-mark" data-type=")(.*?)(">${data.term}<\/span>)`, 'g');
        const replacement = `$1${data.type}$3`;
        return html.replace(regex, replacement);
      };
      
      setExplanation((prev) => ({
        ...prev!,
        howToThink: updateHtml(prev!.howToThink),
        coreAnalysis: updateHtml(prev!.coreAnalysis),
        adminProTip: updateHtml(prev!.adminProTip),
      }));
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
  // --- 💎 END OF "BROKEN SAVE" FIX 💎 ---

  const handleDeleteHotspot = () => {
    if (!explanation || !modalData) return;
    const termToDelete = modalData.term;

    // Flow 1: We were in the editor
    if (activeEditor) {
      activeEditor.chain().unsetMark('hotspot').run();
    }
    
    // Flow 2: We were in "Preview Mode"
    if (!activeEditor) {
        const removeHtml = (html: string) => {
         const regex = new RegExp(`(<span class="hotspot-mark" data-type=".*?">${termToDelete}<\/span>)`, 'g');
         return html.replace(regex, termToDelete); // Replace span with just its text
       };
      setExplanation((prev) => ({
        ...prev!,
        howToThink: removeHtml(prev!.howToThink),
        coreAnalysis: removeHtml(prev!.coreAnalysis),
        adminProTip: removeHtml(prev!.adminProTip),
      }));
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

  // --- Main Save Function (Correct) ---
  const handleSaveToFirestore = async () => {
    if (!explanation) {
      toast.error('No explanation to save.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(explanation);
      toast.success('Explanation saved successfully!');
      onClose();
    } catch (error: any) {
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!explanation) {
    return <div>Loading editor...</div>;
  }
  
  const hotspotBank = explanation.hotspotBank || [];

  return (
    <div className="p-6 space-y-6">
      {/* --- 1. Main Header Bar (Correct) --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Explanation Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center disabled:bg-gray-400"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      {/* --- 2. Collapsible Control Room (Correct) --- */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={() => setIsControlRoomOpen(!isControlRoomOpen)}
          className="w-full p-4 text-left font-semibold flex justify-between items-center"
        >
          Admin Control Room
          {isControlRoomOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
        {isControlRoomOpen && (
          <div className="p-6 border-t border-gray-200 space-y-4">
            <div>
              <h4 className="font-semibold">Step 1: Generate Prompt</h4>
              <button
                onClick={handleGeneratePrompt}
                className="mt-1 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Generate & Copy Prompt
              </button>
            </div>
            <div>
              <h4 className="font-semibold">Step 2: Paste AI JSON Response</h4>
              <textarea
                value={rawAiResponse}
                onChange={(e) => setRawAiResponse(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
                placeholder="Paste AI JSON here..."
              />
            </div>
            <div>
              <h4 className="font-semibold">Step 3: Parse & Load</h4>
              <button
                onClick={handleParse}
                className="mt-1 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Parse & Load Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 3. "HYBRID" Soulful Editor --- */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-3 flex items-center">
            🧠 Topper's Mental Model
          </h2>
          <div className="border rounded-lg shadow-inner bg-white">
            {editingBlock === 'howToThink' ? (
              // --- A. EDIT MODE ---
              <MagicEditor
                content={explanation.howToThink}
                onChange={(html) => handleContentChange('howToThink', html)}
                onConnectClick={handleConnectClick}
                onBlur={handleBlur} 
                autoFocus={true}
              />
            ) : (
              // --- B. PREVIEW MODE ---
              // --- 💎 "JUMP/CRAMPED/SELECTION" FIX (PROBLEMS 1, 2, 3) 💎 ---
              <div
                // 1. Use ".ProseMirror" class to get all editor styles
                //    (fixes line-height, padding, min-height)
                className="ProseMirror w-full cursor-text p-4"
                // 2. Use "onMouseDown" to preserve text selection
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  setEditingBlock('howToThink');
                }}
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
        
        <div>
          <h2 className="text-xl font-bold mb-3 flex items-center">
            🎯 Core Analysis
          </h2>
          <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-inner">
             {editingBlock === 'coreAnalysis' ? (
              // --- A. EDIT MODE ---
              <MagicEditor
                content={explanation.coreAnalysis}
                onChange={(html) => handleContentChange('coreAnalysis', html)}
                onConnectClick={handleConnectClick}
                onBlur={handleBlur}
                autoFocus={true}
              />
            ) : (
              // --- B. PREVIEW MODE ---
              // --- 💎 "JUMP/CRAMPED/SELECTION" FIX (PROBLEMS 1, 2, 3) 💎 ---
              <div
                className="ProseMirror w-full cursor-text p-4"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setEditingBlock('coreAnalysis');
                }}
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
        
        <div>
          <div className="bg-blue-100 border border-blue-200 p-5 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
              ✍️ Mentor's Pro-Tip
            </h2>
             {editingBlock === 'adminProTip' ? (
              // --- A. EDIT MODE ---
              <MagicEditor
                content={explanation.adminProTip}
                onChange={(html) => handleContentChange('adminProTip', html)}
                onConnectClick={handleConnectClick}
                onBlur={handleBlur}
                autoFocus={true}
              />
            ) : (
              // --- B. PREVIEW MODE ---
              // --- 💎 "JUMP/CRAMPED/SELECTION" FIX (PROBLEMS 1, 2, 3) 💎 ---
              <div
                className="ProseMirror w-full cursor-text p-4"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setEditingBlock('adminProTip');
                }}
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

      {/* --- 4. Hotspot Modal (Correct) --- */}
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