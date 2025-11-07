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
// We import the renderer from the UI component
import { RenderWithRadixHotspots } from '@/components/quiz/UltimateExplanationUI'; 
// Import all the icons we'll need for the new UI blocks
import { Eye, Pencil, Lightbulb, Presentation, Link, CheckCircle2, XCircle, ListChecks, FileText } from 'lucide-react';

// These are the props passed down from page.tsx
interface ExplanationWorkspaceProps {
  explanation: UltimateExplanation | null;
  setExplanation: (exp: UltimateExplanation) => void;
  questionId: string;
  questionType: QuestionType;
}

/**
 * --- UPDATED: "True Hybrid Editor" (v2) ---
 * This file is now upgraded to render all 5 "concise"
 * explanation types and handle their state.
 */
export default function ExplanationWorkspace({
  explanation,
  setExplanation,
  questionId,
  questionType,
}: ExplanationWorkspaceProps) {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  // --- "True Hybrid Editor" State ---
  // This state tracks which block is in "Edit Mode".
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  // --- Hotspot Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<HotspotModalData | null>(null);
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);

  // --- Save to Firestore Logic (Unchanged) ---
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
  
  // This is our universal "onBlur" handler
  const handleBlur = () => {
    setEditingBlock(null);
  };

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

  // --- Handlers for SingleChoiceAnalysis (UPDATED) ---
  // No more 'handleSingleChoiceCoreChange'
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

  // --- Handlers for HowManyAnalysis (Unchanged) ---
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

  // --- Handlers for MatchTheListAnalysis (UPDATED) ---
  const handleMatchItemChange = (index: number, content: string) => {
    if (explanation?.matchTheListAnalysis) {
      const newItems = [...explanation.matchTheListAnalysis.itemAnalysis];
      newItems[index] = { ...newItems[index], analysis: content };
      setExplanation({
        ...explanation,
        matchTheListAnalysis: {
          ...explanation.matchTheListAnalysis,
          itemAnalysis: newItems,
        },
      });
    }
  };
  const handleMatchConclusionChange = (
    field: 'correctCombination' | 'optionAnalysis',
    content: string
  ) => {
    if (explanation?.matchTheListAnalysis) {
      setExplanation({
        ...explanation,
        matchTheListAnalysis: {
          ...explanation.matchTheListAnalysis,
          conclusion: {
            ...explanation.matchTheListAnalysis.conclusion,
            [field]: content,
          },
        },
      });
    }
  };

  // --- Handlers for SelectTheCode (NEW) ---
  const handleMultiSelectItemChange = (index: number, content: string) => {
    if (explanation?.multiSelectAnalysis) {
      const newItems = [...explanation.multiSelectAnalysis.itemAnalysis];
      newItems[index] = { ...newItems[index], analysis: content };
      setExplanation({
        ...explanation,
        multiSelectAnalysis: {
          ...explanation.multiSelectAnalysis,
          itemAnalysis: newItems,
        },
      });
    }
  };
  const handleMultiSelectConclusionChange = (
    field: 'correctItemsSummary' | 'optionAnalysis',
    content: string
  ) => {
    if (explanation?.multiSelectAnalysis) {
      setExplanation({
        ...explanation,
        multiSelectAnalysis: {
          ...explanation.multiSelectAnalysis,
          conclusion: {
            ...explanation.multiSelectAnalysis.conclusion,
            [field]: content,
          },
        },
      });
    }
  };
  
  // --- Handlers for StatementExplanation (NEW) ---
  const handleStatementChange = (index: number, content: string) => {
    if (explanation?.statementAnalysis) {
      const newItems = [...explanation.statementAnalysis.statements];
      newItems[index] = { ...newItems[index], analysis: content };
      setExplanation({
        ...explanation,
        statementAnalysis: {
          ...explanation.statementAnalysis,
          statements: newItems,
        },
      });
    }
  };
  const handleStatementConclusionChange = (
    field: 'relationshipAnalysis' | 'optionAnalysis',
    content: string
  ) => {
    if (explanation?.statementAnalysis) {
      setExplanation({
        ...explanation,
        statementAnalysis: {
          ...explanation.statementAnalysis,
          [field]: content,
        },
      });
    }
  };

  // --- Hotspot Logic (Unchanged) ---
  
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
      activeEditor.chain().focus().setMark('hotspot', { type: data.type }).run();
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
    if (!activeEditor || !explanation || !modalData) return;
    const termToDelete = modalData.term;
    if (activeEditor) {
      activeEditor.chain().focus().unsetMark('hotspot').run();
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
            Topper's Mental Model
          </h2>
          <div className="p-4 border rounded-lg shadow-inner bg-white min-h-[100px]">
            {editingBlock === 'howToThink' ? (
              <MagicEditor
                content={explanation.howToThink}
                onChange={(html) => handleTopLevelContentChange('howToThink', html)}
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

        {/* --- 2. Core Analysis (UPDATED FOR ALL 5 TYPES) --- */}
        <div className="playground-block space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Pencil className="w-6 h-6 mr-2 text-blue-600" />
            Core Analysis
          </h2>

          {/* --- 1. SingleChoice Editor (UPDATED) --- */}
          {/* No more coreConceptAnalysis block */}
          {explanation.singleChoiceAnalysis && (
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-900">
                  Option-by-Option Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.singleChoiceAnalysis.optionAnalysis.map(
                    (opt, index) => (
                      <div key={index} className="pl-4 border-l-2 min-h-[75px]">
                        <p className="font-medium italic">{opt.option}. {opt.text}</p>
                        {editingBlock === `optionAnalysis-${index}` ? (
                          <MagicEditor
                            content={opt.analysis}
                            onChange={(html) =>
                              handleSingleChoiceOptionChange(index, html)
                            }
                            onConnectClick={handleConnectClick}
                            onBlur={handleBlur}
                            autoFocus={true}
                          />
                        ) : (
                          <div
                            className="cursor-text"
                            onClick={() =>
                              setEditingBlock(`optionAnalysis-${index}`)
                            }
                          >
                            <RenderWithRadixHotspots
                              html={opt.analysis}
                              hotspotBank={hotspotBank}
                              onHotspotClick={handleHotspotClick}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- 2. HowMany Editor (Unchanged) --- */}
          {explanation.howManyAnalysis && (
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">
                  Item-by-Item Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.howManyAnalysis.itemAnalysis.map(
                    (item, index) => (
                      <div key={index} className="pl-4 border-l-2 min-h-[75px]">
                        <p className="font-medium italic">{item.item}</p>
                        {editingBlock === `itemAnalysis-${index}` ? (
                          <MagicEditor
                            content={item.analysis}
                            onChange={(html) =>
                              handleHowManyItemChange(index, html)
                            }
                            onConnectClick={handleConnectClick}
                            onBlur={handleBlur}
                            autoFocus={true}
                          />
                        ) : (
                          <div
                            className="cursor-text"
                            onClick={() =>
                              setEditingBlock(`itemAnalysis-${index}`)
                            }
                          >
                            <RenderWithRadixHotspots
                              html={item.analysis}
                              hotspotBank={hotspotBank}
                              onHotspotClick={handleHotspotClick}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-green-900">
                  Conclusion
                </h4>
                <div className="min-h-[50px]">
                  {editingBlock === 'howMany-countSummary' ? (
                    <MagicEditor
                      content={explanation.howManyAnalysis.conclusion.countSummary}
                      onChange={(html) =>
                        handleHowManyConclusionChange('countSummary', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('howMany-countSummary')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.howManyAnalysis.conclusion.countSummary}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
                <div className="min-h-[50px] mt-2">
                  {editingBlock === 'howMany-optionAnalysis' ? (
                    <MagicEditor
                      content={explanation.howManyAnalysis.conclusion.optionAnalysis}
                      onChange={(html) =>
                        handleHowManyConclusionChange('optionAnalysis', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('howMany-optionAnalysis')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.howManyAnalysis.conclusion.optionAnalysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- 3. MatchTheList Editor (UPDATED) --- */}
          {explanation.matchTheListAnalysis && (
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-900">
                  Item-by-Item Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.matchTheListAnalysis.itemAnalysis.map(
                    (match, index) => (
                      <div key={index} className="pl-4 border-l-2 min-h-[75px]">
                        <p className="font-medium italic">
                          {match.item} ➔ {match.correctMatch}
                        </p>
                        {editingBlock === `matchAnalysis-${index}` ? (
                          <MagicEditor
                            content={match.analysis}
                            onChange={(html) =>
                              handleMatchItemChange(index, html)
                            }
                            onConnectClick={handleConnectClick}
                            onBlur={handleBlur}
                            autoFocus={true}
                          />
                        ) : (
                          <div
                            className="cursor-text"
                            onClick={() =>
                              setEditingBlock(`matchAnalysis-${index}`)
                            }
                          >
                            <RenderWithRadixHotspots
                              html={match.analysis}
                              hotspotBank={hotspotBank}
                              onHotspotClick={handleHotspotClick}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-900">
                  Conclusion
                </h4>
                <div className="min-h-[50px]">
                  {editingBlock === 'match-combination' ? (
                    <MagicEditor
                      content={explanation.matchTheListAnalysis.conclusion.correctCombination}
                      onChange={(html) =>
                        handleMatchConclusionChange('correctCombination', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() => setEditingBlock('match-combination')}
                    >
                      <RenderWithRadixHotspots
                        html={explanation.matchTheListAnalysis.conclusion.correctCombination}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
                <div className="min-h-[50px] mt-2">
                  {editingBlock === 'match-optionAnalysis' ? (
                    <MagicEditor
                      content={explanation.matchTheListAnalysis.conclusion.optionAnalysis}
                      onChange={(html) =>
                        handleMatchConclusionChange('optionAnalysis', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('match-optionAnalysis')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.matchTheListAnalysis.conclusion.optionAnalysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- 4. SelectTheCode Editor (NEW) --- */}
          {explanation.multiSelectAnalysis && (
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-orange-900">
                  Item-by-Item Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.multiSelectAnalysis.itemAnalysis.map(
                    (item, index) => (
                      <div key={index} className="pl-4 border-l-2 min-h-[75px]">
                        <p className="font-medium italic">{item.item}</p>
                        {editingBlock === `multiSelect-item-${index}` ? (
                          <MagicEditor
                            content={item.analysis}
                            onChange={(html) =>
                              handleMultiSelectItemChange(index, html)
                            }
                            onConnectClick={handleConnectClick}
                            onBlur={handleBlur}
                            autoFocus={true}
                          />
                        ) : (
                          <div
                            className="cursor-text"
                            onClick={() =>
                              setEditingBlock(`multiSelect-item-${index}`)
                            }
                          >
                            <RenderWithRadixHotspots
                              html={item.analysis}
                              hotspotBank={hotspotBank}
                              onHotspotClick={handleHotspotClick}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-orange-900">
                  Conclusion
                </h4>
                <div className="min-h-[50px]">
                  {editingBlock === 'multiSelect-summary' ? (
                    <MagicEditor
                      content={explanation.multiSelectAnalysis.conclusion.correctItemsSummary}
                      onChange={(html) =>
                        handleMultiSelectConclusionChange('correctItemsSummary', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('multiSelect-summary')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.multiSelectAnalysis.conclusion.correctItemsSummary}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
                <div className="min-h-[50px] mt-2">
                  {editingBlock === 'multiSelect-optionAnalysis' ? (
                    <MagicEditor
                      content={explanation.multiSelectAnalysis.conclusion.optionAnalysis}
                      onChange={(html) =>
                        handleMultiSelectConclusionChange('optionAnalysis', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('multiSelect-optionAnalysis')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.multiSelectAnalysis.conclusion.optionAnalysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* --- 5. StatementExplanation Editor (NEW) --- */}
          {explanation.statementAnalysis && (
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-red-900">
                  Statement Analysis
                </h4>
                <div className="space-y-3">
                  {explanation.statementAnalysis.statements.map(
                    (item, index) => (
                      <div key={index} className="pl-4 border-l-2 min-h-[75px]">
                        <p className="font-medium italic">{item.id}. {item.text}</p>
                        {editingBlock === `statement-item-${index}` ? (
                          <MagicEditor
                            content={item.analysis}
                            onChange={(html) =>
                              handleStatementChange(index, html)
                            }
                            onConnectClick={handleConnectClick}
                            onBlur={handleBlur}
                            autoFocus={true}
                          />
                        ) : (
                          <div
                            className="cursor-text"
                            onClick={() =>
                              setEditingBlock(`statement-item-${index}`)
                            }
                          >
                            <RenderWithRadixHotspots
                              html={item.analysis}
                              hotspotBank={hotspotBank}
                              onHotspotClick={handleHotspotClick}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-red-900">
                  Relationship & Conclusion
                </h4>
                <div className="min-h-[50px]">
                  {editingBlock === 'statement-relationship' ? (
                    <MagicEditor
                      content={explanation.statementAnalysis.relationshipAnalysis}
                      onChange={(html) =>
                        handleStatementConclusionChange('relationshipAnalysis', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('statement-relationship')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.statementAnalysis.relationshipAnalysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
                <div className="min-h-[50px] mt-2">
                  {editingBlock === 'statement-optionAnalysis' ? (
                    <MagicEditor
                      content={explanation.statementAnalysis.optionAnalysis}
                      onChange={(html) =>
                        handleStatementConclusionChange('optionAnalysis', html)
                      }
                      onConnectClick={handleConnectClick}
                      onBlur={handleBlur}
                      autoFocus={true}
                    />
                  ) : (
                    <div
                      className="cursor-text"
                      onClick={() =>
                        setEditingBlock('statement-optionAnalysis')
                      }
                    >
                      <RenderWithRadixHotspots
                        html={explanation.statementAnalysis.optionAnalysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={handleHotspotClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        {/* --- END OF CORE ANALYSIS --- */}

        {/* --- 3. Mentor's Pro-Tip (Unchanged) --- */}
        <div className="playground-block">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-lg shadow-sm min-h-[100px]">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              Mentor's Pro-Tip
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

        {/* --- 4. Takeaway (Unchanged) --- */}
        <div className="playground-block">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
            <Presentation className="w-6 h-6 mr-2 text-blue-600" />
            The Takeaway
          </h2>
          <div className="p-4 border rounded-lg shadow-inner bg-white min-h-[100px]">
            {editingBlock === 'takeaway' ? (
              <MagicEditor
                content={explanation.takeaway}
                onChange={(html) => handleTopLevelContentChange('takeaway', html)}
                onConnectClick={handleConnectClick}
                onBlur={handleBlur}
                autoFocus={true}
              />
            ) : (
              <div
                className="cursor-text text-lg"
                onClick={() => setEditingBlock('takeaway')}
              >
                <RenderWithRadixHotspots
                  html={explanation.takeaway}
                  hotspotBank={hotspotBank}
                  onHotspotClick={handleHotspotClick}
                />
              </div>
            )}
          </div>
        </div>

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