// app/admin/editor/[questionId]/CommandCenter.tsx
'use client';

// Updated to include all 5 types from quizTypes
import React from 'react';
import {
  Question,
  QuestionType,
  UltimateExplanation,
  Hotspot,
  SingleChoiceAnalysis,
  HowManyAnalysis,
  MatchTheListAnalysis,
  MultiSelectAnalysis,
  StatementAnalysis,
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
 * --- 💎 HOTSPOT HTML CONVERTER 💎 ---
 * ==================================================================
 * (This function is unchanged, but it will be *called* on new fields)
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
      console.log('Generating prompt with question object:', question);
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
   * --- UPDATED: Validator now checks for all 5 types ---
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

    // This now checks for *any* of the 5 valid analysis blocks
    const hasOneAnalysisBlock =
      ('singleChoiceAnalysis' in data &&
        typeof data.singleChoiceAnalysis === 'object') ||
      ('howManyAnalysis' in data &&
        typeof data.howManyAnalysis === 'object') ||
      ('matchTheListAnalysis' in data &&
        typeof data.matchTheListAnalysis === 'object') ||
      ('multiSelectAnalysis' in data && // <-- NEW
        typeof data.multiSelectAnalysis === 'object') ||
      ('statementAnalysis' in data && // <-- NEW
        typeof data.statementAnalysis === 'object');

    if (!hasOneAnalysisBlock) {
      console.error('Validation failed: Missing one of the 5 analysis blocks.');
      return false;
    }

    return true;
  };

  /**
   * --- UPDATED: The "Master Parser" ---
   * This now processes all 5 of your new/updated JSON schemas
   * to convert their [brackets] into <spans>.
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

    // Use our new "Master Plan" validator
    if (validateNewSchema(parsedData)) {
      const bank = parsedData.hotspotBank || [];
      
      // --- Process the 5 Schemas ---

      // 1. SingleChoice (UPDATED: No 'coreConceptAnalysis')
      const singleChoice: SingleChoiceAnalysis | undefined = parsedData.singleChoiceAnalysis
        ? {
            ...parsedData.singleChoiceAnalysis,
            optionAnalysis:
              parsedData.singleChoiceAnalysis.optionAnalysis.map(
                (opt: any) => ({
                  ...opt,
                  analysis: convertBracketsToSpans(opt.analysis, bank),
                })
              ),
          }
        : undefined;
      
      // 2. HowMany (Unchanged)
      const howMany: HowManyAnalysis | undefined = parsedData.howManyAnalysis
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
        : undefined;

      // 3. MatchTheList (UPDATED: New Schema)
      const matchTheList: MatchTheListAnalysis | undefined = parsedData.matchTheListAnalysis
        ? {
            ...parsedData.matchTheListAnalysis,
            itemAnalysis: parsedData.matchTheListAnalysis.itemAnalysis.map(
              (item: any) => ({
                ...item,
                analysis: convertBracketsToSpans(item.analysis, bank),
              })
            ),
            conclusion: {
              correctCombination: convertBracketsToSpans(
                parsedData.matchTheListAnalysis.conclusion.correctCombination,
                bank
              ),
              optionAnalysis: convertBracketsToSpans(
                parsedData.matchTheListAnalysis.conclusion.optionAnalysis,
                bank
              ),
            },
          }
        : undefined;
      
      // 4. SelectTheCode (NEW)
      const multiSelect: MultiSelectAnalysis | undefined = parsedData.multiSelectAnalysis
        ? {
            ...parsedData.multiSelectAnalysis,
            itemAnalysis: parsedData.multiSelectAnalysis.itemAnalysis.map(
              (item: any) => ({
                ...item,
                analysis: convertBracketsToSpans(item.analysis, bank),
              })
            ),
            conclusion: {
              correctItemsSummary: convertBracketsToSpans(
                parsedData.multiSelectAnalysis.conclusion.correctItemsSummary,
                bank
              ),
              optionAnalysis: convertBracketsToSpans(
                parsedData.multiSelectAnalysis.conclusion.optionAnalysis,
                bank
              ),
            },
          }
        : undefined;

      // 5. StatementExplanation (NEW)
      const statement: StatementAnalysis | undefined = parsedData.statementAnalysis
        ? {
            ...parsedData.statementAnalysis,
            statements: parsedData.statementAnalysis.statements.map(
              (stmt: any) => ({
                ...stmt,
                analysis: convertBracketsToSpans(stmt.analysis, bank),
              })
            ),
            relationshipAnalysis: convertBracketsToSpans(
              parsedData.statementAnalysis.relationshipAnalysis,
              bank
            ),
            optionAnalysis: convertBracketsToSpans(
              parsedData.statementAnalysis.optionAnalysis,
              bank
            ),
          }
        : undefined;

      // --- Build the final object ---
      const processedExplanation: UltimateExplanation = {
        // Common fields
        howToThink: convertBracketsToSpans(parsedData.howToThink, bank),
        adminProTip: convertBracketsToSpans(parsedData.adminProTip, bank),
        takeaway: convertBracketsToSpans(parsedData.takeaway, bank),
        hotspotBank: parsedData.hotspotBank, // Bank itself is just data
        visualAid: parsedData.visualAid || null,

        // Only one of these will be defined
        singleChoiceAnalysis: singleChoice,
        howManyAnalysis: howMany,
        matchTheListAnalysis: matchTheList,
        multiSelectAnalysis: multiSelect,
        statementAnalysis: statement,
      };

      setExplanation(processedExplanation);
      toast.success('AI Response Parsed! Loading workspace...');
    } else {
      toast.error(
        'Parse Error: JSON is invalid or missing required fields. (Check console for details)'
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
        
        {/* --- UPDATED: Added all 5 buttons --- */}
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
          {/* --- NEW BUTTON --- */}
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
          {/* --- NEW BUTTON --- */}
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
        {/* --- END OF UPDATED BUTTONS --- */}

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