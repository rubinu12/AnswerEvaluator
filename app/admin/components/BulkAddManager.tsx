// app/admin/components/BulkAddManager.tsx
// (FIXED: Corrected typo '</entry>' to '</p>' around line 298)

'use client';

import React, { useState } from 'react';
import { FirestoreQuestion, Option, TopicTree } from '@/lib/adminTypes';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Save, 
  Play 
} from 'lucide-react';

interface BulkAddManagerProps {
  topicTree: TopicTree;
}

interface ParsedResult {
  success: boolean;
  questions: FirestoreQuestion[];
  errors: string[];
}

// Helper type for the new parser
type FieldData = {
  key: string;
  value: string;
};

export default function BulkAddManager({ topicTree }: BulkAddManagerProps) {
  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState<ParsedResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- THE "ALWAYS-ASTERISK" PARSER ---
  const parseInput = () => {
    setSaveStatus(null);
    const rawQuestions = inputText.split(/\n\s*---\s*\n/); // Split by "---"
    
    const parsedQuestions: FirestoreQuestion[] = [];
    const errors: string[] = [];

    rawQuestions.forEach((block, index) => {
      if (!block.trim()) return;
      const qIndex = index + 1;

      try {
        const lines = block.trim().split('\n');
        const fields: FieldData[] = [];
        
        // This variable tracks the *currently open* field.
        let activeField: FieldData | null = null;

        for (const line of lines) {
          // Skip empty lines between fields
          if (!line.trim() && !activeField) {
            continue;
          }

          // Check if this is a NEW key
          const match = line.match(/^([a-zA-Z]+):\s*(.*)/);
          
          if (match) {
            // --- PATH 1: A NEW KEY WAS FOUND ---
            
            // If we were in the middle of a field, this is an error.
            if (activeField) {
              throw new Error(`Field '${activeField.key}' was not terminated with a '*' before new key '${match[1]}' was found.`);
            }
            
            const key = match[1];
            const value = match[2];
            
            // Create the new field and add it to our list
            const newField: FieldData = { key, value };
            fields.push(newField);
            activeField = newField; // Set as the active field

            // Check if it terminates on the same line
            if (value.endsWith('*')) {
              newField.value = value.slice(0, -1); // Clean the asterisk
              activeField = null; // Field is closed.
            }

          } else if (activeField) {
            // --- PATH 2: CONTINUATION OF AN ACTIVE FIELD ---
            
            if (line.endsWith('*')) {
              // This is the terminating line
              activeField.value += '\n' + line.slice(0, -1); // Add line, remove *
              activeField = null; // Field is now closed
            } else {
              // This is just another line of content
              activeField.value += '\n' + line;
            }
          }
          // else: This is a stray line (e.g., blank) and we're not in a field. Ignore.
        }

        // After all lines, check if we're *still* in an open field
        if (activeField) {
          throw new Error(`Field '${activeField.key}' reached end of block without a '*' terminator.`);
        }

        // --- VALIDATION & CONSTRUCTION ---
        
        // Convert array of fields into a simple data object for validation
        const data: Record<string, string> = {};
        fields.forEach(f => {
          data[f.key] = f.value;
        });

        // 1. Validate Required Fields
        const requiredFields = [
          'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 
          'correctOption', 'subject', 'topic', 'exam', 'year'
        ];
        const missing = requiredFields.filter(f => !data[f]);
        
        if (missing.length > 0) {
          throw new Error(`Missing fields: ${missing.join(', ')}`);
        }

        // 2. Build Options Array
        const correctOptChar = data['correctOption'].trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(correctOptChar)) {
          throw new Error(`Invalid correctOption: ${data['correctOption']}. Must be A, B, C, or D.`);
        }

        const options: Option[] = [
            { text: data['optionA'].trim(), isCorrect: correctOptChar === 'A' },
            { text: data['optionB'].trim(), isCorrect: correctOptChar === 'B' },
            { text: data['optionC'].trim(), isCorrect: correctOptChar === 'C' },
            { text: data['optionD'].trim(), isCorrect: correctOptChar === 'D' },
        ];

        // 3. Create the Object
        const newDocRef = doc(collection(db, 'questions'));
        
        const questionObj: FirestoreQuestion = {
          id: newDocRef.id,
          questionText: data['questionText'].trim(),
          options: options,
          subject: data['subject'].trim(),
          topic: data['topic'].trim(),
          exam: data['exam'].trim(),
          year: parseInt(data['year']),
          type: 'prelims',
        };

        // Conditionally add optional fields
        if (data['questionType']) {
          questionObj.questionType = data['questionType'].trim();
        }
        if (data['difficulty']) {
          questionObj.difficulty = data['difficulty'].trim() as 'Easy' | 'Medium' | 'Hard';
        }
        if (data['paperQuestionNumber']) {
          questionObj.paperQuestionNumber = parseInt(data['paperQuestionNumber']);
        }

        parsedQuestions.push(questionObj);

      } catch (err: any) {
        errors.push(`Question ${qIndex}: ${err.message}`);
      }
    });

    setParseResult({
      success: errors.length === 0 && parsedQuestions.length > 0,
      questions: parsedQuestions,
      errors: errors
    });
  };

  // --- SAVE LOGIC (Unchanged) ---
  const handleSave = async () => {
    if (!parseResult?.questions.length) return;
    
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      parseResult.questions.forEach(q => {
        const ref = doc(db, 'questions', q.id);
        const { id, ...dataToSave } = q; 
        batch.set(ref, dataToSave);
      });

      await batch.commit();
      
      setSaveStatus({ type: 'success', message: `Successfully saved ${parseResult.questions.length} questions!` });
      setInputText(''); // Clear input
      setParseResult(null); // Reset parser

    } catch (error: any) {
      console.error('Batch save failed:', error);
      setSaveStatus({ type: 'error', message: `Save failed: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX (Placeholder updated, Review box uses programmatic split) ---
  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="relative">
        <textarea
          className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={`questionText: The preamble...
...and its multi-line content...
...is here.*
optionA: Option A text.*
optionB: Option B text
which can also be on
multiple lines.*
optionC: Option C text.*
optionD: Option D text.*
correctOption: A*
subject: prelim*
topic: polity*
exam: UPSC CSE*
year: 2023*
difficulty: Medium*

---

questionText: Next question...*
...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="absolute bottom-4 right-4">
            <button
                onClick={parseInput}
                disabled={!inputText.trim()}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-50 shadow-lg"
            >
                <Play className="w-4 h-4 mr-2" />
                Parse & Review
            </button>
        </div>
      </div>

      {/* Results Area (Using the programmatic split from our previous fix) */}
      {parseResult && (
        <div className={`p-4 rounded-lg border ${parseResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                {parseResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                )}
                <h3 className="text-lg font-semibold">
                    {parseResult.success ? 'Ready to Import' : 'Parsing Errors Found'}
                </h3>
            </div>
            
            {parseResult.success && (
                 <button
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md disabled:opacity-50"
               >
                 {isSaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                 ) : (
                    <Save className="w-5 h-5 mr-2" />
                 )}
                 Save {parseResult.questions.length} Questions
               </button>
            )}
          </div>

          {!parseResult.success && (
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-4">
              {parseResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          {parseResult.success && (
            <div className="space-y-2">
                
                {/* --- THIS IS THE FIX --- */}
                <p className="text-sm text-green-800 font-medium mb-2">
                    Found {parseResult.questions.length} valid questions:
                </p>
                {/* --- END OF FIX --- */}

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {parseResult.questions.map((q, i) => (
                        <div key={q.id} className="bg-white p-3 rounded border border-green-100 text-sm">
                            <div className="flex justify-between font-medium text-gray-900">
                                <span>#{i + 1} (Exam: {q.exam} {q.year})</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{q.subject} / {q.topic}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                                {q.questionText.split('\n').map((line, i) => (
                                  <p key={i} className="m-0 p-0">{line || '\u00A0'}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}
      
      {/* Save Status Message (Unchanged) */}
      {saveStatus && (
        <div className={`p-4 rounded-md flex items-center ${
            saveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
             {saveStatus.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-s mr-2" />}
             {saveStatus.message}
        </div>
      )}
    </div>
  );
}