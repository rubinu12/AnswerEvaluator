// components/quiz/UltimateExplanationUI.tsx
'use client';

import React from 'react';
import parse, { domToReact, DOMNode, Element } from 'html-react-parser';
import { Text } from 'domhandler';
import {
  UltimateExplanation,
  Hotspot,
  isUltimateExplanation,
} from '@/lib/quizTypes';
import { Brain, Target, Pen, Paperclip } from 'lucide-react';
import HotspotTooltip from './HotspotTooltip';
import Image from 'next/image';

/**
 * --- 💎 "SOULFUL" HOTSPOT RENDERER (v4) 💎 ---
 *
 * This helper component is responsible for parsing the HTML string
 * and replacing any <span class="hotspot-mark">...</span> tags
 * with our interactive <HotspotTooltip> component.
 *
 * It is also used by the HotspotTooltip to render HTML *inside*
 * the tooltip definition itself.
 */
export const RenderWithRadixHotspots: React.FC<{
  html: string;
  hotspotBank: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}> = ({ html, hotspotBank, onHotspotClick }) => {
  if (!html) {
    return null;
  }

  const options = {
    replace: (domNode: DOMNode) => {
      // Find the <span> tag
      if (
        domNode instanceof Element &&
        domNode.name === 'span' &&
        domNode.attribs?.class?.includes('hotspot-mark')
      ) {
        let term = '';
        if (
          domNode.children &&
          domNode.children.length > 0 &&
          domNode.children[0].type === 'text'
        ) {
          term = (domNode.children[0] as Text).data;
        } else {
          // Fallback if the span is empty for some reason
          return <>{domToReact(domNode.children as DOMNode[])}</>;
        }

        // Find the matching hotspot data from the bank
        const hotspot = hotspotBank.find((h) => h.term === term);

        if (hotspot) {
          // Replace the span with our interactive Tooltip component
          return (
            <HotspotTooltip hotspot={hotspot} onClick={onHotspotClick}>
              <span
                className={`hotspot-mark ${
                  onHotspotClick ? 'cursor-pointer' : ''
                }`}
                data-type={hotspot.type}
              >
                {term}
              </span>
            </HotspotTooltip>
          );
        }
        // If hotspot is in HTML but not in bank (error case), render it plainly
        return <span className="hotspot-mark">{term}</span>;
      }
    },
  };

  return <>{parse(html, options)}</>;
};

// --- PROPS (Unchanged) ---
interface UltimateExplanationUIProps {
  explanation: string | UltimateExplanation;
  handwrittenNoteUrl?: string | null;
}

/**
 * --- 💎 "SOULFUL" EXPLANATION UI (v4 - Streamlined) 💎 ---
 *
 * This is the new, professional layout. It removes the "boxy" UI
 * and uses our "soulful" schema keys as the main headers.
 */
const UltimateExplanationUI: React.FC<UltimateExplanationUIProps> = ({
  explanation,
  handwrittenNoteUrl,
}) => {
  if (!isUltimateExplanation(explanation)) {
    return (
      <div className="p-4 text-gray-700 bg-gray-50 rounded-lg">
        {explanation && typeof explanation === 'string' ? (
          <p className="whitespace-pre-line">{explanation}</p>
        ) : (
          <p>No explanation available for this question yet.</p>
        )}
      </div>
    );
  }

  const { howToThink, coreAnalysis, adminProTip, hotspotBank } = explanation;
  const bank = hotspotBank || [];

  return (
    <div className="space-y-6">
      {/* --- 1. Topper's Mental Model (howToThink) --- */}
      {howToThink && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            🧠 Topper's Mental Model
          </h3>
          {/* We use .ProseMirror to get styling from globals.css */}
          <div className="ProseMirror">
            <RenderWithRadixHotspots html={howToThink} hotspotBank={bank} />
          </div>
        </div>
      )}

      {/* --- 2. Core Analysis (coreAnalysis) --- */}
      {coreAnalysis && (
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            🎯 Core Analysis
          </h3>
          <div className="ProseMirror">
            <RenderWithRadixHotspots html={coreAnalysis} hotspotBank={bank} />
          </div>
        </div>
      )}

      {/* --- 3. Mentor's Pro-Tip (adminProTip) --- */}
      {adminProTip && (
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 text-blue-900 shadow-sm">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <Pen className="w-5 h-5 mr-2" />
            ✍️ Mentor's Pro-Tip
          </h3>
          <div className="ProseMirror">
            <RenderWithRadixHotspots html={adminProTip} hotspotBank={bank} />
          </div>
        </div>
      )}

      {/* --- 4. Handwritten Note (Unchanged) --- */}
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
              width={800}
              height={1000}
              objectFit="contain"
              className="bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UltimateExplanationUI;