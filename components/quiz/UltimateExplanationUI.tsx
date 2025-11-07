// components/quiz/UltimateExplanationUI.tsx
'use client';

import React from 'react';
import {
  UltimateExplanation,
  Hotspot,
} from '@/lib/quizTypes';
import HotspotTooltip from './HotspotTooltip'; // We import your Radix tooltip
import { Eye, Pencil, Lightbulb, Presentation, Map, Video, Link, CheckCircle2, XCircle } from 'lucide-react';

// --- THIS IS THE FIX (Step 2) ---
// 1. Define props for the helper
interface RenderWithRadixHotspotsProps {
  html: string;
  hotspotBank: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void; // <-- ADDED: The click handler
}

/**
 * A new helper component that parses the editor's HTML and
 * wraps the hotspot spans with our Radix Tooltip component.
 */
export const RenderWithRadixHotspots = ({
  html,
  hotspotBank,
  onHotspotClick, // <-- ADDED
}: RenderWithRadixHotspotsProps) => {
  // --- END OF FIX ---
  if (!html) return null;
  if (!hotspotBank || hotspotBank.length === 0) {
    // No hotspots, just render the HTML
    return (
      <div
        className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // This regex splits the HTML string by our hotspot spans, but *keeps* the spans
  // This finds `<span class="hotspot-mark" ...>...</span>`
  const regex = /(<span class="hotspot-mark"[^>]*>.*?<\/span>)/g;
  const parts = html.split(regex);

  return (
    <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('<span class="hotspot-mark"')) {
          // This part is a hotspot span. We need to parse it.
          // Extract the text *inside* the span
          const termMatch = part.match(/>(.*?)</);
          const term = termMatch ? termMatch[1] : '';
          
          // Find the matching definition from the bank
          const hotspot = hotspotBank.find((h) => h.term === term);

          if (hotspot) {
            // --- THIS IS THE FIX (Step 2) ---
            // 2. Pass the handler down to the tooltip
            return (
              <HotspotTooltip
                key={index}
                hotspot={hotspot}
                onClick={onHotspotClick} // <-- PASSED DOWN
              >
                <span dangerouslySetInnerHTML={{ __html: part }} />
              </HotspotTooltip>
            );
            // --- END OF FIX ---
          }
        }
        
        // This part is just normal text
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
};

// --- THIS IS THE FIX (Step 2) ---
// 3. Define props for the main component
interface UltimateExplanationUIProps {
  explanation: UltimateExplanation;
  onHotspotClick?: (hotspot: Hotspot) => void; // <-- ADDED
}

/**
 * This is the main component to display the "Ultimate Explanation"
 * to the student. It is now upgraded to our "Master Plan" schema
 * and uses the Radix-based HotspotTooltip.
 */
const UltimateExplanationUI: React.FC<UltimateExplanationUIProps> = ({
  explanation,
  onHotspotClick, // <-- ADDED
}) => {
  // --- END OF FIX ---

  const hotspotBank = explanation.hotspotBank || [];

  // --- 1. Topper's Mental Model ---
  const renderMentalModel = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
        <Eye className="w-6 h-6 mr-2 text-blue-600" />
        Topper's Mental Model
      </h2>
      <div className="text-lg">
        {/* 4. Pass handler to all instances */}
        <RenderWithRadixHotspots
          html={explanation.howToThink}
          hotspotBank={hotspotBank}
          onHotspotClick={onHotspotClick}
        />
      </div>
    </div>
  );

  // --- 2. Core Analysis (New "Master Plan" Renderer) ---
  const renderCoreAnalysis = () => {
    // Check for *any* of our new analysis blocks
    const hasAnalysis =
      explanation.singleChoiceAnalysis ||
      explanation.howManyAnalysis ||
      explanation.matchTheListAnalysis;

    if (!hasAnalysis) {
      return null;
    }

    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Pencil className="w-6 h-6 mr-2 text-blue-600" />
          Core Analysis
        </h2>
        <div className="space-y-4">
          
          {/* --- SingleChoice Analysis --- */}
          {explanation.singleChoiceAnalysis && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700">Core Concept</h4>
                <RenderWithRadixHotspots
                  html={explanation.singleChoiceAnalysis.coreConceptAnalysis}
                  hotspotBank={hotspotBank}
                  onHotspotClick={onHotspotClick}
                />
              </div>
              <div className="space-y-3">
                {explanation.singleChoiceAnalysis.optionAnalysis.map(
                  (opt, index) => (
                    <div
                      key={index}
                      className={`border-l-4 ${
                        opt.isCorrect ? 'border-green-500' : 'border-red-500'
                      } bg-gray-50 p-4 rounded-r-lg`}
                    >
                      <h3 className="text-lg font-semibold flex items-start">
                        <span className="mr-2 pt-1 flex-shrink-0">
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </span>
                        {/* We render the option text as HTML since it might be styled */}
                        <span
                          className="leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: opt.option }}
                        />
                      </h3>
                      <div className="mt-1 pl-7">
                        <RenderWithRadixHotspots
                          html={opt.analysis}
                          hotspotBank={hotspotBank}
                          onHotspotClick={onHotspotClick}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* --- HowMany Analysis --- */}
          {explanation.howManyAnalysis && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Item-by-Item Analysis</h4>
                {explanation.howManyAnalysis.itemAnalysis.map((item, index) => (
                  <div
                    key={index}
                    className={`border-l-4 ${
                      item.isCorrect ? 'border-green-500' : 'border-red-500'
                    } bg-gray-50 p-4 rounded-r-lg`}
                  >
                    <h3 className="text-lg font-semibold flex items-start">
                      <span className="mr-2 pt-1 flex-shrink-0">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </span>
                      {/* We render the item text as HTML since it might be styled */}
                      <span
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.item }}
                      />
                    </h3>
                    <div className="mt-1 pl-7">
                      <RenderWithRadixHotspots
                        html={item.analysis}
                        hotspotBank={hotspotBank}
                        onHotspotClick={onHotspotClick}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700">Conclusion</h4>
                <RenderWithRadixHotspots
                  html={explanation.howManyAnalysis.conclusion.countSummary}
                  hotspotBank={hotspotBank}
                  onHotspotClick={onHotspotClick}
                />
                <RenderWithRadixHotspots
                  html={explanation.howManyAnalysis.conclusion.optionAnalysis}
                  hotspotBank={hotspotBank}
                  onHotspotClick={onHotspotClick}
                />
              </div>
            </div>
          )}

          {/* --- MatchTheList Analysis --- */}
          {explanation.matchTheListAnalysis && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700">Correct Match Analysis</h4>
                <div className="space-y-3">
                  {explanation.matchTheListAnalysis.correctMatches.map(
                    (match, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
                      >
                        <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                          <Link className="w-5 h-5 mr-2 flex-shrink-0 text-blue-500" />
                          <span
                            className="font-medium text-gray-800"
                            dangerouslySetInnerHTML={{ __html: match.itemA }}
                          />
                          <span className="mx-2 font-light text-blue-600">➔</span>
                          {/* --- FIXED: Errors 1 & 2 --- */}
                          <span
                            className="font-medium text-gray-800"
                            dangerouslySetInnerHTML={{ __html: match.correctMatchB }}
                          ></span>
                        </h3>
                        <div className="text-gray-700 mt-2 pl-7">
                          <RenderWithRadixHotspots
                            html={match.analysis}
                            hotspotBank={hotspotBank}
                            onHotspotClick={onHotspotClick}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700">Conclusion</h4>
                <RenderWithRadixHotspots
                  html={explanation.matchTheListAnalysis.conclusion}
                  hotspotBank={hotspotBank}
                  onHotspotClick={onHotspotClick}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  // --- 3. Visual Aid ---
  const renderVisualAid = () =>
    explanation.visualAid && (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Map className="w-6 h-6 mr-2 text-blue-600" />
          Visual Aid
        </h2>
        <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 p-2">
          {/* --- FIXED: Errors 3 & 4 --- */}
          <img
            src={explanation.visualAid.url}
            alt={explanation.visualAid.caption || 'Visual Aid'}
            className="w-full h-auto rounded"
          />
          {explanation.visualAid.caption && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {explanation.visualAid.caption}
            </p>
          )}
        </div>
      </div>
    );

  // --- 4. Admin Pro-Tip ---
  const renderAdminProTip = () =>
    explanation.adminProTip && (
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2" />
            Mentor's Pro-Tip
          </h2>
          <div className="text-lg">
            <RenderWithRadixHotspots
              html={explanation.adminProTip}
              hotspotBank={hotspotBank}
              onHotspotClick={onHotspotClick}
            />
          </div>
        </div>
      </div>
    );

  // --- 5. Takeaway ---
  const renderTakeaway = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
        <Presentation className="w-6 h-6 mr-2 text-blue-600" />
        The Takeaway
      </h2>
      <div className="text-lg">
        <RenderWithRadixHotspots
          html={explanation.takeaway}
          hotspotBank={hotspotBank}
          onHotspotClick={onHotspotClick}
        />
      </div>
      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all">
        <Video className="w-5 h-5 mr-2" />
        Find Video Explanation
      </button>
    </div>
  );

  // --- Main Render Function ---
  const coreAnalysisNode = renderCoreAnalysis();
  const visualAidNode = renderVisualAid();
  const adminProTipNode = renderAdminProTip();

  return (
    <div className="w-full bg-white">
      {/* The HotspotTooltip component is no longer rendered here at the top.
        It is now rendered *inside* RenderWithRadixHotspots,
        wrapping only the specific text that needs it.
      */}

      {renderMentalModel()}
      
      {coreAnalysisNode && <hr className="border-gray-200 my-6" />}
      {coreAnalysisNode}
      
      {visualAidNode && <hr className="border-gray-200 my-6" />}
      {visualAidNode}
      
      {adminProTipNode && <hr className="border-gray-200 my-6" />}
      {adminProTipNode}
      
      <hr className="border-gray-200 my-6" />
      {renderTakeaway()}
    </div>
  );
};

export default UltimateExplanationUI;