'use client';

import React from 'react';
// --- 💎 FIX 1: Correct Imports ---
// We now import `Element` from `html-react-parser` itself.
import parse, { domToReact, DOMNode, Element } from 'html-react-parser';
// We still need `Text` from domhandler for safe text extraction.
import { Text } from 'domhandler';
// --- End of Fix ---
import {
  UltimateExplanation,
  Hotspot,
  isUltimateExplanation,
} from '@/lib/quizTypes';
import { Lightbulb, Eye, Pencil, Paperclip } from 'lucide-react';
import HotspotTooltip from './HotspotTooltip'; // <-- We import your *real* component
import Image from 'next/image';

/**
 * --- 💎 "SOULFUL" HOTSPOT RENDERER (v3.3 - THE FINAL, *ACTUAL* FIX) 💎 ---
 *
 * This version fixes the bug by checking `domNode.name === 'hotspot'`
 * instead of the incorrect `domNode.tagName`.
 */
export const RenderWithRadixHotspots: React.FC<{
  html: string;
  hotspotBank: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}> = ({ html, hotspotBank, onHotspotClick }) => {
  const options = {
    replace: (domNode: DOMNode) => {
      // --- 💎 THE BUG FIX 💎 ---
      // We must check `domNode.name === 'hotspot'`.
      // `domNode.tagName` does not exist on this type.
      if (domNode instanceof Element && domNode.name === 'hotspot') {
        // --- 💎 END OF BUG FIX 💎 ---

        // --- Safe Term Extraction ---
        let term = '';
        if (
          domNode.children &&
          domNode.children.length > 0 &&
          domNode.children[0].type === 'text'
        ) {
          term = (domNode.children[0] as Text).data;
        } else {
          // Fallback for empty or complex hotspots
          // This type-cast is now correct and safe.
          return <>{domToReact(domNode.children as DOMNode[])}</>;
        }
        
        // Find the matching hotspot object from our bank
        const hotspot = hotspotBank.find((h) => h.term === term);

        if (hotspot) {
          // We pass the props your component *actually* expects
          return (
            <HotspotTooltip hotspot={hotspot} onClick={onHotspotClick}>
              {/* This span is the 'children' prop for HotspotTooltip */}
              <span
                className={`hotspot hotspot-${hotspot.type} ${
                  onHotspotClick ? 'cursor-pointer' : ''
                }`}
              >
                {term}
              </span>
            </HotspotTooltip>
          );
        }
        // Hotspot exists in HTML but not in bank
        return <span className="hotspot hotspot-invalid">{term}</span>;
      }
      
      // Return all other nodes (like <p>, <strong>, <span>) unchanged
      return domNode;
    },
  };

  // We parse the HTML with our replacement options
  return <>{parse(html, options)}</>;
};

// --- PROPS (Unchanged) ---
interface UltimateExplanationUIProps {
  explanation: string | UltimateExplanation;
  handwrittenNoteUrl?: string | null;
}

// --- DELETED ---
// All the old, "soulless" 5-schema helper components are GONE.

/**
 * --- 💎 "SOULFUL" EXPLANATION UI (v3.0 - THE FINAL) 💎 ---
 */
const UltimateExplanationUI: React.FC<UltimateExplanationUIProps> = ({
  explanation,
  handwrittenNoteUrl,
}) => {
  // Our NEW type guard (from lib/quizTypes.ts)
  if (!isUltimateExplanation(explanation)) {
    return (
      <div className="p-4 text-gray-700 bg-gray-50 rounded-lg">
        {explanation && typeof explanation === 'string' ? (
          <p>{explanation}</p> // Legacy string parser
        ) : (
          <p>No explanation available for this question yet.</p>
        )}
      </div>
    );
  }

  // We can now safely access our "soulful" object
  const { howToThink, coreAnalysis, adminProTip, hotspotBank, takeaway } =
    explanation;

  return (
    <div className="space-y-6 p-4">
      {/* --- 1. Topper's Mental Model (howToThink) --- */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600" />
          🧠 Topper's Mental Model
        </h3>
        <div className="prose prose-sm max-w-none">
          <RenderWithRadixHotspots
            html={howToThink}
            hotspotBank={hotspotBank || []}
          />
        </div>
      </div>

      {/* --- 2. Core Analysis (coreAnalysis) --- */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
        <h3 className="font-bold text-lg text-blue-900 mb-2 flex items-center">
          <Pencil className="w-5 h-5 mr-2 text-blue-600" />
          🎯 Core Analysis
        </h3>
        <div className="prose prose-sm max-w-none prose-strong:text-blue-900">
          <RenderWithRadixHotspots
            html={coreAnalysis}
            hotspotBank={hotspotBank || []}
          />
        </div>
      </div>

      {/* --- 3. Mentor's Pro-Tip (adminProTip) --- */}
      <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 text-blue-900 shadow-sm">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          ✍️ Mentor's Pro-Tip
        </h3>
        <div className="prose prose-sm max-w-none">
          <RenderWithRadixHotspots
            html={adminProTip}
            hotspotBank={hotspotBank || []}
          />
        </div>
      </div>

      {/* --- 4. Handwritten Note (Your Requested Feature) --- */}
      {handwrittenNoteUrl && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 shadow-sm">
          <h3 className="font-bold text-lg text-yellow-900 mb-2 flex items-center">
            <Paperclip className="w-5 h-5 mr-2" />
            My Handwritten Note
          </h3>
          <div className="relative w-full h-auto min-h-[300px] rounded-md overflow-hidden border border-yellow-200">
            <Image
              src={handwrittenNoteUrl}
              alt="User's handwritten note"
              layout="responsive"
              width={800} // Default dimensions
              height={1000} //
              objectFit="contain"
              className="bg-white"
            />
          </div>
        </div>
      )}

      {/* --- 5. Takeaway (KEPT for Legacy Data) --- */}
      {takeaway && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-900">
          <h3 className="font-bold text-lg mb-2">✅ The Takeaway</h3>
          <div className="prose prose-sm max-w-none">
            <RenderWithRadixHotspots
              html={takeaway}
              hotspotBank={hotspotBank || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UltimateExplanationUI;