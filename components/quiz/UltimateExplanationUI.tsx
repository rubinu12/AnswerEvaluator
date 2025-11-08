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
import { Lightbulb, Eye, Pencil, Paperclip } from 'lucide-react';
import HotspotTooltip from './HotspotTooltip';
import Image from 'next/image';

/**
 * --- 💎 "SOULFUL" HOTSPOT RENDERER (v3.5 - THE COLOR FIX) 💎 ---
 *
 * This version fixes the "missing colors" bug.
 * It now renders the <span> with the exact `className` and `data-type`
 * that your existing `globals.css` file targets.
 */
export const RenderWithRadixHotspots: React.FC<{
  html: string;
  hotspotBank: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}> = ({ html, hotspotBank, onHotspotClick }) => {
  const options = {
    replace: (domNode: DOMNode) => {
      // This logic is correct: find the <span> tag
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
          return <>{domToReact(domNode.children as DOMNode[])}</>;
        }

        const hotspot = hotspotBank.find((h) => h.term === term);

        if (hotspot) {
          return (
            <HotspotTooltip hotspot={hotspot} onClick={onHotspotClick}>
              {/* --- 💎 THE COLOR FIX 💎 --- */}
              {/*
                This now renders the <span> with `className="hotspot-mark"`
                and `data-type={hotspot.type}`. This will make your
                existing CSS classes (`.hotspot-mark[data-type='blue']`)
                work correctly.
              */}
              <span
                className={`hotspot-mark ${
                  onHotspotClick ? 'cursor-pointer' : ''
                }`}
                data-type={hotspot.type}
              >
                {term}
              </span>
              {/* --- END OF FIX --- */}
            </HotspotTooltip>
          );
        }
        // Hotspot exists in HTML but not in bank
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
 * --- 💎 "SOULFUL" EXPLANATION UI (v3.2 - UI Polish) 💎 ---
 * We are removing the 'prose' classes to stop them from
 * interfering with your 'hotspot-mark' classes.
 */
const UltimateExplanationUI: React.FC<UltimateExplanationUIProps> = ({
  explanation,
  handwrittenNoteUrl,
}) => {
  if (!isUltimateExplanation(explanation)) {
    return (
      <div className="p-4 text-gray-700 bg-gray-50 rounded-lg">
        {explanation && typeof explanation === 'string' ? (
          <p>{explanation}</p>
        ) : (
          <p>No explanation available for this question yet.</p>
        )}
      </div>
    );
  }

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
        {/* 'prose' class removed to allow custom CSS to apply */}
        <div className="text-base leading-relaxed">
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
        {/* 'prose' class removed */}
        <div className="text-base leading-relaxed">
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
        {/* 'prose' class removed */}
        <div className="text-base leading-relaxed">
          <RenderWithRadixHotspots
            html={adminProTip}
            hotspotBank={hotspotBank || []}
          />
        </div>
      </div>

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

      {/* --- 5. Takeaway (KEPT for Legacy Data) --- */}
      {takeaway && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-900">
          <h3 className="font-bold text-lg mb-2">✅ The Takeaway</h3>
          {/* 'prose' class removed */}
          <div className="text-base leading-relaxed">
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