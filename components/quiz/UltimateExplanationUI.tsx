// components/quiz/UltimateExplanationUI.tsx
import React from 'react';
import {
  UltimateExplanation,
  CoreAnalysisStatement,
  CoreAnalysisOption,
  CoreAnalysisPair,
  CoreAnalysisMatch,
  CoreAnalysisItem,
  Hotspot,
} from '@/lib/quizTypes';
import {
  Eye,
  Pencil,
  Link,
  Lightbulb,
  Presentation,
  CheckCircle2,
  XCircle,
  Map,
  Video,
} from 'lucide-react';
import HotspotTooltip from './HotspotTooltip';

interface UltimateExplanationUIProps {
  explanation: UltimateExplanation;
}

/**
 * This helper function renders text that includes both rich HTML
 * and our [Hotspot] tags.
 */
const renderRichTextWithHotspots = (
  text: string,
  hotspots: Hotspot[] = []
): React.ReactNode => {
  if (!text) return null; // Handle empty text
  if (!hotspots || hotspots.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }

  const hotspotTerms = hotspots.map((h) => h.term);
  const regex = new RegExp(`(${hotspotTerms.map(t => `\\[${t}\\]`).join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const matchingHotspot = hotspots.find(h => `[${h.term}]` === part);

        if (matchingHotspot) {
          return (
            <HotspotTooltip
              key={`${matchingHotspot.term}-${index}`}
              hotspot={matchingHotspot}
            >
              {matchingHotspot.term}
            </HotspotTooltip>
          );
        }

        return (
          <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
        );
      })}
    </>
  );
};

const UltimateExplanationUI: React.FC<UltimateExplanationUIProps> = ({
  explanation,
}) => {
  // --- 1. Topper's Mental Model ---
  const renderMentalModel = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
        <Eye className="w-6 h-6 mr-2 text-blue-600" />
        Topper's Mental Model
      </h2>
      <div className="text-gray-700 text-lg leading-relaxed prose">
        {renderRichTextWithHotspots(explanation.howToThink)}
      </div>
    </div>
  );

  // --- 2. Core Analysis (The "Universal" Renderer) ---
  const renderCoreAnalysisItem = (item: CoreAnalysisItem, index: number) => {
    // ==================================================================
    // --- THIS IS THE "BULLETPROOF" UI FIX ---
    // If a string or null somehow gets here, we skip it.
    // ==================================================================
    if (typeof item !== 'object' || item === null) {
      return null;
    }

    // A. For Statement, Option, or HowManyPairs
    if ('isCorrect' in item) {
      const { isCorrect, analysis, hotspots } = item;
      let itemText = '';
      if ('statement' in item) itemText = (item as CoreAnalysisStatement).statement;
      if ('option' in item) itemText = (item as CoreAnalysisOption).option;
      if ('pair' in item) itemText = (item as CoreAnalysisPair).pair;

      return (
        <div
          key={index}
          className={`border-l-4 ${
            isCorrect ? 'border-green-500' : 'border-red-500'
          } bg-gray-50 p-4 rounded-r-lg`}
        >
          <h3
            className={`text-lg font-semibold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            } flex items-start`}
          >
            <span className="mr-2 pt-1 flex-shrink-0">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </span>
            <span className="leading-relaxed">
              {renderRichTextWithHotspots(itemText, hotspots)}
            </span>
          </h3>
          <div className="text-gray-700 mt-1 pl-7 leading-relaxed prose">
            {renderRichTextWithHotspots(analysis, hotspots)}
          </div>
        </div>
      );
    }

    // B. For MatchTheList
    if ('list1_item' in item) {
      const { list1_item, list2_item, analysis, hotspots } =
        item as CoreAnalysisMatch;
      return (
        <div
          key={index}
          className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
        >
          <h3 className="text-lg font-semibold text-blue-700 flex items-center">
            <Link className="w-5 h-5 mr-2 flex-shrink-0 text-blue-500" />
            <span className="font-medium text-gray-800">
              {renderRichTextWithHotspots(list1_item, hotspots)}
            </span>
            <span className="mx-2 font-light text-blue-600">➔</span>
            <span className="font-medium text-gray-800">
              {renderRichTextWithHotspots(list2_item, hotspots)}
            </span>
          </h3>
          <div className="text-gray-700 mt-2 pl-7 leading-relaxed prose">
            {renderRichTextWithHotspots(analysis, hotspots)}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCoreAnalysis = () => {
    // This check is now safe.
    if (
      !explanation.coreAnalysis ||
      !Array.isArray(explanation.coreAnalysis) ||
      explanation.coreAnalysis.length === 0
    ) {
      return null;
    }

    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Pencil className="w-6 h-6 mr-2 text-blue-600" />
          Core Analysis
        </h2>
        <div className="space-y-4">
          {explanation.coreAnalysis.map(renderCoreAnalysisItem)}
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
          Geographic Context
        </h2>
        <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50 p-2">
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
            Admin Pro-Tip
          </h2>
          <div className="text-lg leading-relaxed prose">
            {renderRichTextWithHotspots(explanation.adminProTip)}
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
      <div className="text-gray-700 text-lg leading-relaxed prose">
        {renderRichTextWithHotspots(explanation.takeaway)}
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