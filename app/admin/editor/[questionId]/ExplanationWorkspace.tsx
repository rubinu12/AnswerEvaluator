// app/admin/editor/[questionId]/ExplanationWorkspace.tsx
'use client'; // --- "PERFECT" FIX: This must also be a Client Component ---

import React, { useState, useEffect } from 'react';
import {
  UltimateExplanation,
  isUltimateExplanation,
  CoreAnalysisItem,
  VisualAid,
} from '@/lib/quizTypes';
import { Question } from '@/lib/quizTypes';
import UltimateExplanationUI from '@/components/quiz/UltimateExplanationUI';
import { useAuthContext } from '@/lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, AlertTriangle, Eye, Pencil } from 'lucide-react';
import MagicEditor from '@/components/admin/MagicEditor';

interface ExplanationWorkspaceProps {
  questionId: string;
  liveExplanation: UltimateExplanation | null;
}

/**
 * ==================================================================
 * --- 💎 THIS IS ROW 2: THE "WYSIWYG WORKSPACE" 💎 ---
 * ==================================================================
 */
const ExplanationWorkspace: React.FC<ExplanationWorkspaceProps> = ({
  questionId,
  liveExplanation,
}) => {
  const { user } = useAuthContext();
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- "Perfect" Editor State ---
  const [howToThink, setHowToThink] = useState('');
  const [coreAnalysisJson, setCoreAnalysisJson] = useState('');
  const [adminProTip, setAdminProTip] = useState('');
  const [takeaway, setTakeaway] = useState('');
  const [visualAid, setVisualAid] = useState<VisualAid | null>(null);

  // "Perfect" Effect
  useEffect(() => {
    if (liveExplanation) {
      setHowToThink(liveExplanation.howToThink || '');
      setCoreAnalysisJson(
        JSON.stringify(liveExplanation.coreAnalysis || [], null, 2)
      );
      setAdminProTip(liveExplanation.adminProTip || '');
      setTakeaway(liveExplanation.takeaway || '');
      setVisualAid(liveExplanation.visualAid || null);
    }
  }, [liveExplanation]);

  // Creates the "live" object for the preview tab
  const getPreviewData = (): UltimateExplanation | null => {
    try {
      const parsedCoreAnalysis = JSON.parse(
        coreAnalysisJson
      ) as CoreAnalysisItem[];
      if (!Array.isArray(parsedCoreAnalysis)) {
        throw new Error('Core Analysis is not a valid JSON array.');
      }

      return {
        howToThink,
        coreAnalysis: parsedCoreAnalysis,
        adminProTip,
        takeaway,
        visualAid,
      };
    } catch (e: any) {
      return null;
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    const finalExplanation = getPreviewData();

    // "Perfect" Validation
    if (!finalExplanation) {
      setError(
        'Cannot save. The "Core Analysis" JSON is invalid. Please fix it.'
      );
      setIsSaving(false);
      return;
    }

    if (!isUltimateExplanation(finalExplanation)) {
      setError(
        'Cannot save. The explanation is missing required fields (howToThink, coreAnalysis, takeaway).'
      );
      setIsSaving(false);
      return;
    }

    try {
      if (!user) {
        throw new Error('User is not authenticated.');
      }
      const token = await user.getIdToken();

      const questionRef = doc(db, 'questions', questionId);

      await updateDoc(questionRef, {
        explanation: finalExplanation,
      });

    } catch (e: any) {
      console.error('Save Error:', e);
      setError(`Save Error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!liveExplanation) {
    return (
      <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-400">
            Row 2: WYSIWYG Workspace
          </h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">
            Paste JSON in Row 1 and click "Parse & Edit" to activate this
            workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Row 2: WYSIWYG Workspace</h2>

        {/* --- "PERFECT" 2-TAB CONTROLS --- */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('edit')}
            className={`btn flex items-center gap-2 px-4 py-2 rounded-lg ${
              view === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Pencil className="w-4 h-4" /> Edit Content
          </button>
          <button
            onClick={() => setView('preview')}
            className={`btn flex items-center gap-2 px-4 py-2 rounded-lg ${
              view === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" /> Live Preview
          </button>
        </div>
      </div>

      {/* --- "PERFECT" TAB 1: CONTENT EDITOR --- */}
      {view === 'edit' && (
        <>
          <main className="p-6 space-y-6">
            
            <div>
              <label className="text-lg font-semibold block mb-2">
                1. Topper's Mental Model (howToThink)
              </label>
              <MagicEditor content={howToThink} onChange={setHowToThink} />
            </div>

            <div>
              <label className="text-lg font-semibold block mb-2">
                2. Core Analysis (JSON)
              </label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                This must be a valid JSON array. Edit this carefully.
              </p>
              <textarea
                value={coreAnalysisJson}
                onChange={(e) => setCoreAnalysisJson(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-xs custom-scrollbar h-96"
              />
            </div>
            
            <div>
              <label className="text-lg font-semibold block mb-2">
                3. Admin Pro-Tip
              </label>
              <MagicEditor content={adminProTip} onChange={setAdminProTip} />
            </div>
            
            <div>
              <label className="text-lg font-semibold block mb-2">
                4. Takeaway
              </label>
              <MagicEditor content={takeaway} onChange={setTakeaway} />
            </div>

          </main>

          <footer className="p-6 border-t flex justify-between items-center">
            <div className="flex-1 text-red-600">
              {error && (
                <p className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save to Firestore'}
              <Save className="w-4 h-4" />
            </button>
          </footer>
        </>
      )}

      {/* --- "PERFECT" TAB 2: LIVE PREVIEW --- */}
      {view === 'preview' && (
        <>
          <main className="p-6">
            {getPreviewData() ? (
              <UltimateExplanationUI explanation={getPreviewData()!} />
            ) : (
              <div className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Could not render preview. Your "Core Analysis" JSON is invalid.
                Please fix it in the "Edit Content" tab.
              </div>
            )}
          </main>
          <footer className="p-6 border-t flex justify-end items-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save to Firestore'}
              <Save className="w-4 h-4" />
            </button>
          </footer>
        </>
      )}
    </div>
  );
};

export default ExplanationWorkspace;