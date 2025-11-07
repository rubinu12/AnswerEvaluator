'use client';

import React from 'react';
import {
  Question,
  QuestionType,
  UltimateExplanation,
  Hotspot,
  isUltimateExplanation,
} from '@/lib/quizTypes';
import { generateDetailedPrompt } from '@/lib/promptGenerator';
import { toast } from 'sonner';

interface CommandCenterProps {
  question: Question;
  questionType: QuestionType;
  setQuestionType: React.Dispatch<React.SetStateAction<QuestionType>>;
  currentPrompt: string;
  setCurrentPrompt: React.Dispatch<React.SetStateAction<string>>;
  rawAiResponse: string;
  setRawAiResponse: React.Dispatch<React.SetStateAction<string>>;
  setExplanation: (exp: UltimateExplanation) => void;
}

/**
 * ==================================================================
 * --- 💎 HOTSPOT HTML CONVERTER (THE "REAL" FIX) 💎 ---
 * ==================================================================
 * This parser now converts the AI's [brackets] into the *correct*
 * <span> tags that MagicEditor.tsx is configured to understand.
 * This will fix the "Bubble Menu" bug.
 */
const convertBracketsToSpans = (
  html: string,
  hotspotBank: Hotspot[]
): string => {
  if (!html || !hotspotBank) return html;

  let processedHtml = html;
  for (const hotspot of hotspotBank) {
    const escapedTerm = hotspot.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedTerm}\\]`, 'g');
    
    // --- 💎 THE FIX 💎 ---
    // We now create the <span> tag that MagicEditorExtensions.ts
    // is configured to parse (span[data-type]).
    const replacement = `<span class="hotspot-mark" data-type="${hotspot.type}">${hotspot.term}</span>`;
    processedHtml = processedHtml.replace(regex, replacement);
  }
  return processedHtml;
};
// --- End of function ---

export default function CommandCenter({
  question,
  questionType,
  setQuestionType,
  currentPrompt,
  setCurrentPrompt,
  rawAiResponse,
  setRawAiResponse,
  setExplanation,
}: CommandCenterProps) {
  // --- Prompt Generation (Unchanged) ---
  const handleGeneratePrompt = (type: QuestionType) => {
    setQuestionType(type);
    try {
      console.log('Generating prompt with question object:', question);
      // This now calls our new, universal prompt generator
      const prompt = generateDetailedPrompt(question, type);
      setCurrentPrompt(prompt);
      toast.success(`Prompt for "${type}" generated!`);
    } catch (error) {
      console.error('Prompt generation error:', error);
      toast.error('Failed to generate prompt.');
    }
  };

  // --- "Strict & Robust Parser" Logic ---

  /**
   * --- 💎 REPLACED 💎 ---
   * The old, complex 5-schema validator is GONE.
   * We now use our simple, universal type guard from quizTypes.ts.
   */
  const validateNewSchema = (data: any): data is UltimateExplanation => {
    // This now correctly calls the imported type guard
    return isUltimateExplanation(data);
  };

  /**
   * --- 💎 REPLACED 💎 ---
   * This is the new, simple "Soulful Parser".
   * It replaces the 200-line, 5-schema "Master Parser".
   */
  const handleParse = () => {
    if (!rawAiResponse.trim()) {
      toast.error('Paste JSON response from AI first.');
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawAiResponse);
    } catch (error: any) {
      console.error('JSON Parse Error:', error);
      toast.error(`Invalid JSON: ${error.message}`);
      return;
    }

    // Use our new "Soulful" validator
    if (validateNewSchema(parsedData)) {
      const bank = parsedData.hotspotBank || [];

      // --- Build the final object ---
      // This is all we need. No more 5-schema logic.
      const processedExplanation: UltimateExplanation = {
        howToThink: convertBracketsToSpans(parsedData.howToThink, bank),
        coreAnalysis: convertBracketsToSpans(parsedData.coreAnalysis, bank),
        adminProTip: convertBracketsToSpans(parsedData.adminProTip, bank),
        hotspotBank: parsedData.hotspotBank,
        // We also pass the legacy fields through, in case they exist
        takeaway: parsedData.takeaway 
          ? convertBracketsToSpans(parsedData.takeaway, bank) 
          : undefined,
        visualAid: parsedData.visualAid || undefined,
      };

      setExplanation(processedExplanation);
      toast.success('AI Response Parsed! Loading workspace...');
    } else {
      toast.error(
        'Parse Error: JSON is invalid or missing "soulful" fields (howToThink, coreAnalysis, adminProTip, hotspotBank). (Check console for details)'
      );
      console.error("Validation Failed. Expected soulful schema, got:", parsedData);
    }
  };

  // --- Render (Unchanged) ---
  // Your render logic for the buttons and text areas is perfect.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1: Generate Prompt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Column 1.1: Generate Prompt</h3>
        <p className="text-sm text-gray-600">
          Select the question type to generate the "Dr. Topper Singh" prompt.
          (Note: All buttons now generate the same universal prompt).
        </p>

        {/* --- All your buttons still work --- */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGeneratePrompt('SingleChoice')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              questionType === 'SingleChoice'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            [SingleChoice]
          </button>
          <button
            onClick={() => handleGeneratePrompt('HowMany')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              questionType === 'HowMany' ||
              questionType === 'StatementBased' ||
              questionType === 'HowManyPairs'
                ? 'bg-green-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            [HowMany]
          </button>
          <button
            onClick={() => handleGeneratePrompt('MatchTheList')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              questionType === 'MatchTheList'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            [MatchTheList]
          </button>
          <button
            onClick={() => handleGeneratePrompt('SelectTheCode')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              questionType === 'SelectTheCode'
                ? 'bg-orange-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            [SelectTheCode]
          </button>
          <button
            onClick={() => handleGeneratePrompt('StatementExplanation')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              questionType === 'StatementExplanation'
                ? 'bg-red-600 text-white shadow'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            [StatementExplanation]
          </button>
        </div>

        <textarea
          readOnly
          value={currentPrompt}
          className="w-full h-48 p-2 border rounded-md bg-gray-100 text-sm"
          placeholder="Click a button above to generate the prompt..."
        />
      </div>

      {/* Column 2: Paste & Parse */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Column 1.2: Paste & Parse</h3>
        <p className="text-sm text-gray-600">
          Paste the raw JSON response from the AI here.
        </p>
        <textarea
          value={rawAiResponse}
          onChange={(e) => setRawAiResponse(e.target.value)}
          className="w-full h-48 p-2 border rounded-md text-sm"
          placeholder="Paste raw JSON here..."
        />
        <button
          onClick={handleParse}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          Parse & Edit in Workspace
        </button>
      </div>
    </div>
  );
}