// app/admin/editor/[questionId]/CommandCenter.tsx
'use client';

import React, { useState } from 'react';
import { Question, QuestionType, UltimateExplanation, isUltimateExplanation } from '@/lib/quizTypes';
import { generateDetailedPrompt } from '@/lib/promptGenerator';
import { Copy, Wand2, AlertTriangle } from 'lucide-react';

interface CommandCenterProps {
  question: Question;
  initialExplanation: UltimateExplanation | null;
  onParse: (explanation: UltimateExplanation) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ 
  question, 
  initialExplanation,
  onParse
}) => {
  const [selectedType, setSelectedType] = useState<QuestionType>(question.questionType);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [rawJson, setRawJson] = useState(
    initialExplanation 
      ? JSON.stringify(initialExplanation, null, 2) 
      : ''
  );
  const [error, setError] = useState<string | null>(null);

  const questionTypes: QuestionType[] = [
    'SingleChoice',
    'StatementBased',
    'HowManyPairs',
    'MatchTheList',
  ];

  const handleGeneratePrompt = (type: QuestionType) => {
    setSelectedType(type);
    const prompt = generateDetailedPrompt(question, type);
    setGeneratedPrompt(prompt);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    // You can add a toast here
  };
  
  /**
   * ==================================================================
   * --- 💎 OUR "ROBUST PARSER" (V1 - STRICT) 💎 ---
   * ==================================================================
   * This is the "perfect" parser we designed. It is strict and
   * gives you a clear error if the AI messes up.
   */
  const handleParseAndEdit = () => {
    setError(null);
    let parsed: any;
    
    try {
      if (rawJson.trim() === '') {
        throw new Error('Pasted JSON cannot be empty.');
      }
      parsed = JSON.parse(rawJson);
    } catch (e: any) {
      console.error('JSON Parse Error:', e);
      setError(`JSON Parse Error: ${e.message}`);
      return;
    }

    // --- Strict Validation (as we agreed) ---
    if (!parsed.howToThink || !parsed.takeaway) {
      setError('JSON is missing required fields (howToThink, takeaway).');
      return;
    }
    
    if (!Array.isArray(parsed.coreAnalysis)) {
      setError('The `coreAnalysis` field is missing or is not an array.');
      return;
    }
    
    // Check *inside* the array for the bug that crashed us
    for (let i = 0; i < parsed.coreAnalysis.length; i++) {
      const item = parsed.coreAnalysis[i];
      if (typeof item !== 'object' || item === null) {
        setError(`Error in \`coreAnalysis\` item ${i}: Item is not an object (e.g., it's a string). Please fix the JSON.`);
        return;
      }
    }
    
    // --- Validation Passed ---
    // We create the full object (visualAid is null for now)
    const explanation: UltimateExplanation = {
      howToThink: parsed.howToThink,
      coreAnalysis: parsed.coreAnalysis,
      adminProTip: parsed.adminProTip || '',
      takeaway: parsed.takeaway,
      visualAid: initialExplanation?.visualAid || null, // Preserve existing visual aid
    };
    
    // Send the "perfect" data up to the parent page
    onParse(explanation);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Row 1: Command Center</h2>
      </div>
      
      {/* --- YOUR "TWO-COLUMN" LAYOUT FOR ROW 1 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        
        {/* --- COLUMN 1.1: GENERATE PROMPT --- */}
        <div className="p-6 border-r border-gray-200">
          <label className="text-lg font-semibold">
            1. Generate Prompt
          </label>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Select the question type to generate the "perfect" prompt.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {questionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleGeneratePrompt(type)}
                className={`btn text-sm px-3 py-1 rounded-full ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <textarea
            readOnly
            value={generatedPrompt || 'Click a type button to generate the prompt...'}
            className="w-full h-64 p-2 border border-gray-300 rounded-md shadow-sm font-mono text-xs custom-scrollbar"
          />
          <button
            onClick={handleCopyToClipboard}
            disabled={!generatedPrompt}
            className="btn bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border flex items-center gap-2 mt-2 w-full justify-center disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Prompt
          </button>
        </div>
        
        {/* --- COLUMN 1.2: PASTE & PARSE --- */}
        <div className="p-6">
          <label className="text-lg font-semibold" htmlFor="json-input">
            2. Paste Gemini's Response
          </label>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Paste the raw JSON from the AI here.
          </p>
          
          <textarea
            id="json-input"
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder="Paste the JSON from Gemini here..."
            className="w-full h-64 p-2 border border-gray-300 rounded-md shadow-sm font-mono text-xs custom-scrollbar"
          />
          <button
            onClick={handleParseAndEdit}
            disabled={!rawJson}
            className="btn bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md w-full flex items-center gap-2 mt-2 justify-center disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            Parse & Edit in Workspace
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default CommandCenter;