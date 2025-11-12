// components/quiz/UltimateExplanationUI.tsx
'use client';

import React from 'react';
import {
  Hotspot,
  UltimateExplanation,
  isUltimateExplanation,
} from '@/lib/quizTypes';
import { Brain, Target, Pen, Info } from 'lucide-react';
import HotspotTooltip from './HotspotTooltip';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

/**
 * --- 💎 THIS IS THE CORE OF THE TOOLTIP FIX 💎 ---
 * This recursive component parses the HTML string, finds
 * the <span class="hotspot-mark"> tags, and replaces
 * them with the interactive <HotspotTooltip> React component.
 */
export const RenderWithRadixHotspots: React.FC<{
  html: string;
  hotspotBank: Hotspot[];
}> = ({ html, hotspotBank }) => {
  if (!html) {
    return null;
  }

  // Find the first hotspot span
  const regex = /<span class="hotspot-mark" data-type="([^"]+)">([\s\S]*?)<\/span>/;
  const match = html.match(regex);

  if (!match) {
    // No hotspots found, just render the HTML
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Hotspot found!
  const [fullMatch, type, term] = match;
  const before = html.substring(0, match.index);
  const after = html.substring(match.index! + fullMatch.length);

  // Find the matching data in the bank
  const hotspot = hotspotBank.find((h) => h.term === term);

  return (
    <>
      {/* 1. Render the part *before* the hotspot */}
      <div dangerouslySetInnerHTML={{ __html: before }} />

      {/* 2. Render the interactive HotspotTooltip component */}
      {hotspot ? (
        <HotspotTooltip hotspot={hotspot}>
          <span className="hotspot-mark" data-type={type}>
            {term}
          </span>
        </HotspotTooltip>
      ) : (
        // Fallback for broken link
        <span className="hotspot-mark-broken" data-type={type}>
          {term}
        </span>
      )}

      {/* 3. Recursively render the part *after* the hotspot */}
      <RenderWithRadixHotspots html={after} hotspotBank={hotspotBank} />
    </>
  );
};

interface UltimateExplanationUIProps {
  explanation: string | UltimateExplanation;
  handwrittenNoteUrl?: string | null;
}

export default function UltimateExplanationUI({
  explanation,
  handwrittenNoteUrl,
}: UltimateExplanationUIProps) {
  if (isUltimateExplanation(explanation)) {
    const { howToThink, coreAnalysis, adminProTip, hotspotBank } = explanation;

    return (
      // --- 💎 --- THIS IS THE "NO-JUMP" FIX --- 💎 ---
      // We add the `ProseMirror` class. This makes the static
      // content use the *exact same typography* as the Tiptap
      // editor, preventing any layout "jump".
      <div className={`space-y-6 ProseMirror ${inter.className}`}>
        {/* --- Block 1: howToThink --- */}
        <div className="border rounded-lg shadow-inner bg-gray-50 border-gray-200 p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            🧠 Topper's Mental Model
          </h3>
          <RenderWithRadixHotspots html={howToThink} hotspotBank={hotspotBank} />
        </div>

        {/* --- Block 2: coreAnalysis --- */}
        <div className="border-l-4 rounded-r-lg shadow-inner bg-blue-50 border-blue-200 p-4">
          <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            🎯 Core Analysis
          </h3>
          <RenderWithRadixHotspots
            html={coreAnalysis}
            hotspotBank={hotspotBank}
          />
        </div>

        {/* --- Block 3: adminProTip --- */}
        <div className="border rounded-lg shadow-inner bg-blue-100 border-blue-200 p-4">
          <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center">
            <Pen className="w-5 h-5 mr-2 text-blue-600" />
            ✍️ Mentor's Pro-Tip
          </h3>
          <RenderWithRadixHotspots
            html={adminProTip}
            hotspotBank={hotspotBank}
          />
        </div>

        {/* --- Optional Handwritten Note --- */}
        {handwrittenNoteUrl && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-bold text-lg text-gray-700 mb-3">
              Handwritten Note
            </h3>
            <img
              src={handwrittenNoteUrl}
              alt="Handwritten mentor note"
              className="w-full h-auto rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
    );
  }

  // --- Fallback for old, simple string explanations ---
  return (
    <div
      className={`ProseMirror p-4 border rounded-lg bg-gray-50 ${inter.className}`}
    >
      <div className="flex items-center text-blue-600 font-semibold mb-2">
        <Info className="w-5 h-5 mr-2" />
        Mentor's Explanation
      </div>
      <p>{explanation}</p>
    </div>
  );
}