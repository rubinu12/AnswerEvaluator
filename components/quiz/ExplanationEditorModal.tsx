// components/quiz/ExplanationEditorModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuizStore } from '@/lib/quizStore';
import {
  Question,
  UltimateExplanation,
  isUltimateExplanation,
  VisualAid,
  CoreAnalysisItem,
} from '@/lib/quizTypes';
import { Copy, Save, Wand2, X, AlertTriangle, Upload } from 'lucide-react';
import UltimateExplanationUI from './UltimateExplanationUI';
import { useAuthContext } from '@/lib/AuthContext';

/**
 * ==================================================================
 * --- 💎 THIS IS THE "PERFECT" PROMPT 💎 ---
 * ==================================================================
 */
const generateAiPrompt = (question: Question): string => {
  const { questionType, text, options } = question;
  let analysisPrompt = '';

  switch (questionType) {
    case 'SingleChoice':
      analysisPrompt = `
  "coreAnalysis": [
    { "option": "(a) ${options[0].text}", "isCorrect": true, "analysis": "...", "hotspots": [] },
    { "option": "(b) ${options[1].text}", "isCorrect": false, "analysis": "...", "hotspots": [] },
    { "option": "(c) ${options[2].text}", "isCorrect": false, "analysis": "...", "hotspots": [] },
    { "option": "(d) ${options[3].text}", "isCorrect": false, "analysis": "...", "hotspots": [] }
  ]`;
      break;
    case 'StatementBased':
    case 'HowManyPairs':
      analysisPrompt = `
  "coreAnalysis": [\n${options
    .map(
      (opt) =>
        `    { "${
          questionType === 'StatementBased' ? 'statement' : 'pair'
        }": "${
          opt.text
        }", "isCorrect": false, "analysis": "...", "hotspots": [] }`
    )
    .join(',\n')}\n  ]`;
      break;
    case 'MatchTheList':
      analysisPrompt = `
  "coreAnalysis": [
    { "list1_item": "A. ...", "list2_item": "1. ...", "analysis": "...", "hotspots": [] },
    { "list1_item": "B. ...", "list2_item": "2. ...", "analysis": "...", "hotspots": [] },
    { "list1_item": "C. ...", "list2_item": "3. ...", "analysis": "...", "hotspots": [] }
  ]`;
      break;
  }

  return `You are an expert UPSC Prelims educator for Mainsevaluator. Your task is to generate a perfect, structured JSON explanation for the following question.

Question:
${text}

Options:
${options.map((opt) => `${opt.label}. ${opt.text}`).join('\n')}

---
Respond with ONLY a valid JSON object matching this schema.
Follow our "Ultimate Explanation" vision.

**JSON Schema:**
{
  "howToThink": "A 1-2 sentence 'Topper's Mental Model' for how to approach this question. Be insightful.",
  ${analysisPrompt},
  "adminProTip": "A unique, high-value 'Admin Pro-Tip'. Make it insightful and different from the 'howToThink' section.",
  "takeaway": "A final 1-sentence conclusion, e.g., 'The correct answer is (b) Only two.'"
}

**Crucial Rules:**
1.  **\`coreAnalysis\` is MANDATORY and MUST be an array of objects.** This is the most important part.
2.  **Use our "Pen Theme":** Format text with HTML. Use \`<strong>\` for bold, and use \`<span style="color: red;">...\</span>\` for our "Red Pen" to highlight critical keywords or traps.
3.  **Use "Deeper Connections":** In the \`analysis\` text, wrap key terms you want to define in square brackets (e.g., "This relates to the [Kesavananda Bharati case]."). This will become a 'hotspot' tooltip.
4.  **DO NOT** include a \`visualAid\` field. This is added manually by the admin.
`;
};

export const ExplanationEditorModal: React.FC = () => {
  const {
    editingQuestionId,
    closeExplanationEditor,
    questions,
    updateQuestionExplanation,
  } = useQuizStore();
  const { user } = useAuthContext();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [view, setView] = useState<'prompt' | 'editor'>('prompt');

  // Editor State
  const [rawJson, setRawJson] = useState('');
  const [parsedExplanation, setParsedExplanation] =
    useState<UltimateExplanation | null>(null);

  const [visualAidUrl, setVisualAidUrl] = useState('');
  const [visualAidCaption, setVisualAidCaption] = useState('');

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Find the question when the modal opens
  useEffect(() => {
    if (editingQuestionId) {
      const question = questions.find((q) => q.id === editingQuestionId);
      if (question) {
        setCurrentQuestion(question);

        if (isUltimateExplanation(question.explanation)) {
          setParsedExplanation(question.explanation);
          const { visualAid, ...restOfExplanation } = question.explanation;
          setRawJson(JSON.stringify(restOfExplanation, null, 2));
          setVisualAidUrl(visualAid?.url || '');
          setVisualAidCaption(visualAid?.caption || '');
          setView('editor');
        } else {
          setAiPrompt(generateAiPrompt(question));
          setParsedExplanation(null);
          setRawJson('');
          setVisualAidUrl('');
          setVisualAidCaption('');
          setView('prompt');
        }
      } else {
        setError('Could not find the question to edit.');
      }
    } else {
      setError(null);
      setIsSaving(false);
    }
  }, [editingQuestionId, questions]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(aiPrompt);
  };

  /**
   * ==================================================================
   * --- THIS IS THE "ROBUST" PARSER FIX ---
   * ==================================================================
   */
  const handleParseAndPreview = () => {
    setError(null);
    try {
      if (rawJson.trim() === '') {
        throw new Error('Pasted JSON cannot be empty.');
      }
      const parsed = JSON.parse(rawJson) as any;

      if (!parsed.howToThink || !parsed.takeaway) {
        throw new Error(
          'JSON is missing minimum required fields (howToThink, takeaway).'
        );
      }

      // Robustly handle coreAnalysis
      let robustCoreAnalysis: CoreAnalysisItem[] = [];
      if (Array.isArray(parsed.coreAnalysis)) {
        // Filter out any items that are NOT objects (e.g., strings)
        robustCoreAnalysis = parsed.coreAnalysis.filter(
          (item: any) => typeof item === 'object' && item !== null
        );
      }
      // If coreAnalysis was missing or not an array, it remains []

      const previewExplanation: UltimateExplanation = {
        howToThink: parsed.howToThink,
        coreAnalysis: robustCoreAnalysis, // Use the new robust array
        adminProTip: parsed.adminProTip || '',
        takeaway: parsed.takeaway,
        visualAid: visualAidUrl
          ? { type: 'image', url: visualAidUrl, caption: visualAidCaption }
          : null,
      };

      setParsedExplanation(previewExplanation);
    } catch (e: any) {
      console.error('JSON Parse Error:', e);
      setError(`JSON Parse Error: ${e.message}`);
      setParsedExplanation(null);
    }
  };

  /**
   * ==================================================================
   * --- THIS IS THE "ROBUST" SAVE FIX ---
   * ==================================================================
   */
  const handleSaveToFirestore = async () => {
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch (e: any) {
      setError(`JSON Parse Error: ${e.message}`);
      return;
    }

    if (!parsedJson || !editingQuestionId) {
      setError('No valid explanation JSON to save.');
      return;
    }

    // Robustly build the final explanation
    let robustCoreAnalysis: CoreAnalysisItem[] = [];
    if (Array.isArray(parsedJson.coreAnalysis)) {
      // Filter out any items that are NOT objects (e.g., strings)
      robustCoreAnalysis = parsedJson.coreAnalysis.filter(
        (item: any) => typeof item === 'object' && item !== null
      );
    }

    const finalExplanation: UltimateExplanation = {
      howToThink: parsedJson.howToThink || '',
      coreAnalysis: robustCoreAnalysis,
      adminProTip: parsedJson.adminProTip || '',
      takeaway: parsedJson.takeaway || 'No takeaway provided.',
      visualAid: visualAidUrl
        ? { type: 'image', url: visualAidUrl, caption: visualAidCaption }
        : null,
    };

    if (!isUltimateExplanation(finalExplanation)) {
      setError(
        'Final JSON is invalid. Make sure it has howToThink and takeaway.'
      );
      return;
    }

    setIsSaving(true);
    setError(null);

   try {
      // Try to obtain a token from the auth context's user object first,
      // otherwise fall back to a client-side stored token (e.g. localStorage).
      const token =
        (user as any)?.token ??
        (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null);
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(`/api/questions/${editingQuestionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalExplanation),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save explanation.');
      }

      updateQuestionExplanation(editingQuestionId, finalExplanation);
    } catch (e: any) {
      console.error('Save Error:', e);
      setError(`Save Error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!editingQuestionId || !currentQuestion) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={closeExplanationEditor}>
      <div
        className="modal-panel bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Ultimate Explanation Editor (Q: {currentQuestion.questionNumber})
          </h2>
          <button
            onClick={closeExplanationEditor}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-shrink-0 border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setView('prompt')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'prompt'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              1. Generate Prompt
            </button>
            <button
              onClick={() => setView('editor')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'editor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              2. Paste, Preview & Save
            </button>
          </nav>
        </div>

        {view === 'prompt' && (
          <>
            <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-gray-600 mb-4">
                Copy this prompt, get the JSON from Gemini, then go to Step 2.
              </p>
              <textarea
                readOnly
                value={aiPrompt}
                className="w-full h-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm custom-scrollbar min-h-[400px]"
              />
            </main>
            <footer className="p-6 border-t flex justify-end gap-4 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="btn bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy Prompt
              </button>
              <button
                onClick={() => setView('editor')}
                className="btn bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                Next: Paste & Edit <Wand2 className="w-4 h-4" />
              </button>
            </footer>
          </>
        )}

        {view === 'editor' && (
          <>
            <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
              <div className="w-full md:w-1/2 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                <label className="font-semibold" htmlFor="json-input">
                  Pasted AI JSON
                </label>
                <textarea
                  id="json-input"
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  placeholder="Paste the JSON (excluding visualAid) here..."
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-xs custom-scrollbar flex-1"
                  style={{ minHeight: '300px' }}
                />
                <div className="mt-4">
                  <label className="font-semibold">
                    Admin Controls (Your Additions)
                  </label>
                  <div className="p-4 border rounded-md mt-2 space-y-3 bg-gray-50">
                    <div>
                      <label
                        htmlFor="visual-url"
                        className="text-sm font-medium text-gray-700"
                      >
                        Visual Aid URL (Map, etc.)
                      </label>
                      <input
                        id="visual-url"
                        type="text"
                        value={visualAidUrl}
                        onChange={(e) => setVisualAidUrl(e.target.value)}
                        placeholder="https://.../my-map.png"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="visual-caption"
                        className="text-sm font-medium text-gray-700"
                      >
                        Visual Aid Caption (Optional)
                      </label>
                      <input
                        id="visual-caption"
                        type="text"
                        value={visualAidCaption}
                        onChange={(e) => setVisualAidCaption(e.target.value)}
                        placeholder="e.g., 'Map of the Congo Basin'"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleParseAndPreview}
                  className="btn bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md w-full mt-4 flex-shrink-0"
                >
                  Parse & Preview
                </button>
              </div>

              <div className="w-full md:w-1/2 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                <label className="font-semibold">Live Preview</label>
                <div className="flex-1 border rounded-md p-4 bg-gray-50 min-h-[400px]">
                  {parsedExplanation ? (
                    <UltimateExplanationUI explanation={parsedExplanation} />
                  ) : (
                    <div className="text-gray-500">
                      Preview will appear here after you paste JSON and click
                      "Parse & Preview".
                    </div>
                  )}
                </div>
              </div>
            </main>

            <footer className="p-6 border-t flex justify-between items-center flex-shrink-0">
              <div className="flex-1 text-red-600">
                {error && (
                  <p className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeExplanationEditor}
                  className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToFirestore}
                  disabled={isSaving || rawJson.trim() === ''}
                  className="btn bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : `Confirm & Add to Database`}
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};