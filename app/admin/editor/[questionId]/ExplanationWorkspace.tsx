'use client';

import React, { useState } from 'react';
import {
  UltimateExplanation,
  QuestionType,
  Hotspot, // Import our Hotspot type
} from '@/lib/quizTypes';
import MagicEditor from '@/components/admin/MagicEditor';
import { useAuthContext } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Editor as TiptapEditor } from '@tiptap/react';

// --- STEP 3b: Import our new modal ---
import HotspotModal, {
  HotspotModalData,
} from '@/components/admin/HotspotModal';

// These are the props passed down from page.tsx
interface ExplanationWorkspaceProps {
  explanation: UltimateExplanation | null;
  setExplanation: (exp: UltimateExplanation) => void;
  questionId: string;
  questionType: QuestionType;
}

/**
 * This is "Row 2: The WYSIWYG Workspace".
 * It is now a single "Playground" layout, combining Phase 1, 2, and 3.
 */
export default function ExplanationWorkspace({
  explanation,
  setExplanation,
  questionId,
  questionType,
}: ExplanationWorkspaceProps) {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  // --- STEP 3b: State for Hotspot Modal ---
  // This controls whether the modal is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);
  // This holds the data for the hotspot being edited (term, definition, etc.)
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  // This stores a reference to the specific Tiptap editor
  // that we need to apply commands to (e.g., to make text green)
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

  // --- Content Change Handlers (Immutability is critical) ---
  // These functions update the main 'explanation' state object
  // when you type into any of the MagicEditor instances.

  // Handler for top-level fields (howToThink, adminProTip, takeaway)
  const handleTopLevelContentChange = (
    field: 'howToThink' | 'adminProTip' | 'takeaway',
    content: string
  ) => {
    if (explanation) {
      setExplanation({
        ...explanation,
        [field]: content,
      });
    }
  };

  // --- Handlers for SingleChoiceAnalysis ---
  const handleSingleChoiceCoreChange = (content: string) => {
    if (explanation?.singleChoiceAnalysis) {
      setExplanation({
        ...explanation,
        singleChoiceAnalysis: {
          ...explanation.singleChoiceAnalysis,
          coreConceptAnalysis: content,
        },
      });
    }
  };

  const handleSingleChoiceOptionChange = (index: number, content: string) => {
    if (explanation?.singleChoiceAnalysis) {
      const newOptions = [
        ...explanation.singleChoiceAnalysis.optionAnalysis,
      ];
      newOptions[index] = { ...newOptions[index], analysis: content };
      setExplanation({
        ...explanation,
        singleChoiceAnalysis: {
          ...explanation.singleChoiceAnalysis,
          optionAnalysis: newOptions,
        },
      });
    }
  };

  // --- Handlers for HowManyAnalysis ---
  const handleHowManyItemChange = (index: number, content: string) => {
    if (explanation?.howManyAnalysis) {
      const newItems = [...explanation.howManyAnalysis.itemAnalysis];
      newItems[index] = { ...newItems[index], analysis: content };
      setExplanation({
        ...explanation,
        howManyAnalysis: {
          ...explanation.howManyAnalysis,
          itemAnalysis: newItems,
        },
      });
    }
  };

  const handleHowManyConclusionChange = (
    field: 'countSummary' | 'optionAnalysis',
    content: string
  ) => {
    if (explanation?.howManyAnalysis) {
      setExplanation({
        ...explanation,
        howManyAnalysis: {
          ...explanation.howManyAnalysis,
          conclusion: {
            ...explanation.howManyAnalysis.conclusion,
            [field]: content,
          },
        },
      });
    }
  };

  // --- Handlers for MatchTheListAnalysis ---
  const handleMatchItemChange = (index: number, content: string) => {
    if (explanation?.matchTheListAnalysis) {
      const newItems = [...explanation.matchTheListAnalysis.correctMatches];
      newItems[index] = { ...newItems[index], analysis: content };
      setExplanation({
        ...explanation,
        matchTheListAnalysis: {
          ...explanation.matchTheListAnalysis,
          correctMatches: newItems,
        },
      });
    }
  };

  const handleMatchConclusionChange = (content: string) => {
    if (explanation?.matchTheListAnalysis) {
      setExplanation({
        ...explanation,
        matchTheListAnalysis: {
          ...explanation.matchTheListAnalysis,
          conclusion: content,
        },
      });
    }
  };

  // --- STEP 3b: Hotspot Logic ---

  /**
   * Called when user clicks [Connect] in any MagicEditor.
   * This is the "brain" of the hotspot workflow.
   */
  const handleConnectClick = (editor: TiptapEditor) => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error('Please select text to create or edit a hotspot.');
      return;
    }

    // Get the text you selected
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    // Save this editor instance so we can apply commands to it later
    setActiveEditor(editor);

    // Check if this text is *already* a hotspot in our hotspotBank
    const existingHotspot = explanation?.hotspotBank?.find(
      (h) => h.term === selectedText
    );

    if (existingHotspot) {
      // It's an existing hotspot! Open modal in "Edit" mode.
      setModalData({
        term: existingHotspot.term,
        type: existingHotspot.type,
        definition: existingHotspot.definition,
      });
    } else {
      // It's a new hotspot! Open modal in "New" mode.
      setModalData({
        term: selectedText,
        type: 'green', // Default to green
        definition: '',
      });
    }
    // Open the modal
    setIsModalOpen(true);
  };

  /**
   * Called when "Save" is clicked in the HotspotModal.
   * This updates the Tiptap editor AND the React state.
   */
  const handleSaveHotspot = (data: HotspotModalData) => {
    if (!activeEditor || !explanation) return;

    // 1. Update Tiptap Editor: Apply the mark (e.g., make it green/wavy/etc.)
    activeEditor
      .chain()
      .focus()
      // This applies our custom 'hotspot' mark with the correct 'type'
      .setMark('hotspot', { type: data.type })
      .run();

    // 2. Update React State: Update the hotspotBank array
    const existingIndex =
      explanation.hotspotBank?.findIndex((h) => h.term === data.term) ?? -1;
    let newHotspotBank: Hotspot[];

    if (existingIndex > -1) {
      // It's an existing hotspot, so we update it in the array
      newHotspotBank = [...(explanation.hotspotBank || [])];
      newHotspotBank[existingIndex] = data;
    } else {
      // It's a new hotspot, so we add it to the array
      newHotspotBank = [...(explanation.hotspotBank || []), data];
    }

    // Set the main explanation state with the new hotspotBank
    setExplanation({
      ...explanation,
      hotspotBank: newHotspotBank,
    });

    // Clean up and close the modal
    setIsModalOpen(false);
    setActiveEditor(null);
    setModalData(null);
    toast.success(`Hotspot "${data.term}" saved!`);
  };

  /**
   * Called when "Delete" is clicked in the HotspotModal.
   * This updates the Tiptap editor AND the React state.
   */
  const handleDeleteHotspot = () => {
    if (!activeEditor || !explanation || !modalData) return;

    const termToDelete = modalData.term;

    // 1. Update Tiptap Editor: Remove the mark from the text
    activeEditor.chain().focus().unsetMark('hotspot').run();

    // 2. Update React State: Filter the hotspot out of the hotspotBank
    const newHotspotBank = (explanation.hotspotBank || []).filter(
      (h) => h.term !== termToDelete
    );

    setExplanation({
      ...explanation,
      hotspotBank: newHotspotBank,
    });

    // Clean up and close the modal
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

  // This is the main render for the Playground UI
  return (
    <>
      {/* STEP 3b: Render the modal.
        It's invisible by default until isModalOpen becomes true.
      */}
      <HotspotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHotspot}
        // Only show the "Delete" button if we are editing an existing hotspot
        onDelete={
          modalData?.definition ? handleDeleteHotspot : undefined
        }
        initialData={modalData}
      />

      {/* This is our Playground layout from Phase 1 & 2 */}
      <div className="w-full space-y-8">
        
        {/* PHASE 1: "Topper's Mental Model" */}
        <div className="playground-block">
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            Topper's Mental Model
          </h3>
          <div className="p-4 border rounded-lg shadow-inner bg-white">
            <MagicEditor
              content={explanation.howToThink}
              onChange={(html) =>
                handleTopLevelContentChange('howToThink', html)
              }
              // Pass the hotspot function to the editor
              onConnectClick={handleConnectClick}
            />
          </div>
        </div>

        {/* --- PHASE 2: "Core Analysis" --- */}
        <div className="playground-block space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Core Analysis</h3>

          {/* --- SingleChoice Editor --- */}
          {explanation.singleChoiceAnalysis && (
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-900">
                  Core Concept Analysis
                </h4>
                <MagicEditor
                  content={
                    explanation.singleChoiceAnalysis.coreConceptAnalysis
                  }
                  onChange={handleSingleChoiceCoreChange}
                  onConnectClick={handleConnectClick}
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-900">
                  Option-by-Option Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.singleChoiceAnalysis.optionAnalysis.map(
                    (opt, index) => (
                      <div key={index} className="pl-4 border-l-2">
                        <p className="font-medium italic">{opt.option}</p>
                        <MagicEditor
                          content={opt.analysis}
                          onChange={(html) =>
                            handleSingleChoiceOptionChange(index, html)
                          }
                          onConnectClick={handleConnectClick}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- HowMany Editor --- */}
          {explanation.howManyAnalysis && (
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">
                  Item-by-Item Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.howManyAnalysis.itemAnalysis.map(
                    (item, index) => (
                      <div key={index} className="pl-4 border-l-2">
                        <p className="font-medium italic">{item.item}</p>
                        <MagicEditor
                          content={item.analysis}
                          onChange={(html) =>
                            handleHowManyItemChange(index, html)
                          }
                          onConnectClick={handleConnectClick}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">
                  Conclusion
                </h4>
                <MagicEditor
                  content={explanation.howManyAnalysis.conclusion.countSummary}
                  onChange={(html) =>
                    handleHowManyConclusionChange('countSummary', html)
                  }
                  onConnectClick={handleConnectClick}
                />
                <MagicEditor
                  content={explanation.howManyAnalysis.conclusion.optionAnalysis}
                  onChange={(html) =>
                    handleHowManyConclusionChange('optionAnalysis', html)
                  }
                  onConnectClick={handleConnectClick}
                />
              </div>
            </div>
          )}

          {/* --- MatchTheList Editor --- */}
          {explanation.matchTheListAnalysis && (
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-900">
                  Correct Match Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.matchTheListAnalysis.correctMatches.map(
                    (match, index) => (
                      <div key={index} className="pl-4 border-l-2">
                        <p className="font-medium italic">
                          {match.itemA} ➔ {match.correctMatchB}
                        </p>
                        <MagicEditor
                          content={match.analysis}
                          onChange={(html) =>
                            handleMatchItemChange(index, html)
                          }
                          onConnectClick={handleConnectClick}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-900">
                  Conclusion
                </h4>
                <MagicEditor
                  content={explanation.matchTheListAnalysis.conclusion}
                  onChange={handleMatchConclusionChange}
                  onConnectClick={handleConnectClick}
                />
              </div>
            </div>
          )}
        </div>
        {/* --- END OF PHASE 2 --- */}

        {/* PHASE 1: "Mentor's Pro-Tip" */}
        <div className="playground-block">
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            Mentor's Pro-Tip
          </h3>
          <div className="p-4 border rounded-lg shadow-inner bg-white">
            <MagicEditor
              content={explanation.adminProTip}
              onChange={(html) =>
                handleTopLevelContentChange('adminProTip', html)
              }
              onConnectClick={handleConnectClick}
            />
          </div>
        </div>

        {/* PHASE 1: "Takeaway" */}
        <div className="playground-block">
          <h3 className="text-xl font-bold mb-2 text-gray-800">Takeaway</h3>
          <div className="p-4 border rounded-lg shadow-inner bg-white">
            <MagicEditor
              content={explanation.takeaway}
              onChange={(html) => handleTopLevelContentChange('takeaway', html)}
              onConnectClick={handleConnectClick}
            />
          </div>
        </div>

        {/* --- PHASE 4 (Admin Controls / visualAid) WILL BE INSERTED HERE --- */}

        {/* Save Button */}
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
