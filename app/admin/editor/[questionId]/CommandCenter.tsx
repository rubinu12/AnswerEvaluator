'use client';

import React from 'react';
import {
  Question,
  QuestionType,
  UltimateExplanation,
  Hotspot,
} from '@/lib/quizTypes';
import { generateDetailedPrompt } from '@/lib/promptGenerator';
import { toast } from 'sonner';

// --- Props updated to match page.tsx ---
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
 * --- 💎 HOTSPOT HTML CONVERTER 💎 ---
 * ==================================================================
 * This is our new function to convert [brackets] from the AI
 * into the <span> tags our editor and UI expect.
 */
const convertBracketsToSpans = (
  html: string,
  hotspotBank: Hotspot[]
): string => {
  if (!html || !hotspotBank) return html;

  let processedHtml = html;
  for (const hotspot of hotspotBank) {
    // Create a RegExp to find the [term]
    // We escape special regex characters in the term
    const escapedTerm = hotspot.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedTerm}\\]`, 'g');

    // Replace it with our editor-compatible HTML span
    const replacement = `<span class="hotspot-mark" data-type="${hotspot.type}">${hotspot.term}</span>`;
    processedHtml = processedHtml.replace(regex, replacement);
  }
  return processedHtml;
};
// --- End of new function ---

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
  // --- Prompt Generation ---
  const handleGeneratePrompt = (type: QuestionType) => {
    setQuestionType(type);
    try {
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
   * This is our new "Master Plan" validator.
   */
  const validateNewSchema = (data: any): data is UltimateExplanation => {
    if (!data || typeof data !== 'object') {
      console.error('Validation failed: Not an object.');
      return false;
    }
    const hasCommonFields =
      'howToThink' in data &&
      'adminProTip' in data &&
      'takeaway' in data &&
      'hotspotBank' in data &&
      Array.isArray(data.hotspotBank);

    if (!hasCommonFields) {
      console.error('Validation failed: Missing common fields.');
      return false;
    }

    const hasOneAnalysisBlock =
      ('singleChoiceAnalysis' in data &&
        typeof data.singleChoiceAnalysis === 'object') ||
      ('howManyAnalysis' in data &&
        typeof data.howManyAnalysis === 'object') ||
      ('matchTheListAnalysis' in data &&
        typeof data.matchTheListAnalysis === 'object');

    if (!hasOneAnalysisBlock) {
      console.error('Validation failed: Missing analysis block.');
      return false;
    }

    return true;
  };

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

    // Use our new "Master Plan" validator
    if (validateNewSchema(parsedData)) {
      // --- THIS IS THE NEW CONVERSION STEP ---
      // We take the valid JSON and "upgrade" its HTML
      const bank = parsedData.hotspotBank || [];
      const processedExplanation: UltimateExplanation = {
        ...parsedData,
        howToThink: convertBracketsToSpans(parsedData.howToThink, bank),
        adminProTip: convertBracketsToSpans(parsedData.adminProTip, bank),
        takeaway: convertBracketsToSpans(parsedData.takeaway, bank),
        // We also convert the analysis blocks
        singleChoiceAnalysis: parsedData.singleChoiceAnalysis
          ? {
              ...parsedData.singleChoiceAnalysis,
              coreConceptAnalysis: convertBracketsToSpans(
                parsedData.singleChoiceAnalysis.coreConceptAnalysis,
                bank
              ),
              optionAnalysis:
                parsedData.singleChoiceAnalysis.optionAnalysis.map(
                  (opt: any) => ({
                    ...opt,
                    analysis: convertBracketsToSpans(opt.analysis, bank),
                  })
                ),
            }
          : undefined,
        howManyAnalysis: parsedData.howManyAnalysis
          ? {
              ...parsedData.howManyAnalysis,
              itemAnalysis: parsedData.howManyAnalysis.itemAnalysis.map(
                (item: any) => ({
                  ...item,
                  analysis: convertBracketsToSpans(item.analysis, bank),
                })
              ),
              conclusion: {
                countSummary: convertBracketsToSpans(
                  parsedData.howManyAnalysis.conclusion.countSummary,
                  bank
                ),
                optionAnalysis: convertBracketsToSpans(
                  parsedData.howManyAnalysis.conclusion.optionAnalysis,
                  bank
                ),
              },
            }
          : undefined,
        matchTheListAnalysis: parsedData.matchTheListAnalysis
          ? {
              ...parsedData.matchTheListAnalysis,
              correctMatches:
                parsedData.matchTheListAnalysis.correctMatches.map(
                  (match: any) => ({
                    ...match,
                    analysis: convertBracketsToSpans(match.analysis, bank),
                  })
                ),
              conclusion: convertBracketsToSpans(
                parsedData.matchTheListAnalysis.conclusion,
                bank
              ),
            }
          : undefined,
      };
      // --- END OF CONVERSION ---

      setExplanation(processedExplanation);
      toast.success('AI Response Parsed! Loading workspace...');
    } else {
      toast.error(
        'Parse Error: JSON is invalid or missing required fields.'
      );
    }
  };

  // --- Render ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1: Generate Prompt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Column 1.1: Generate Prompt</h3>
        <p className="text-sm text-gray-600">
          Select the question type to generate the "Dr. Topper Singh" prompt.
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Buttons now set parent state */}
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
        </div>
        <textarea
          readOnly
          value={currentPrompt} // Controlled by parent
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
          value={rawAiResponse} // Controlled by parent
          onChange={(e) => setRawAiResponse(e.target.value)} // Update parent
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
