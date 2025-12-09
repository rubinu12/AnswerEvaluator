// components/result/AnnotatedAnswer.tsx
'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  Lightbulb, 
  Wand2,
  AlertOctagon,
  BarChart3,
  Scale,
  BookOpen,
  Users,
  PlusCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { 
  CoachBlueprint, 
  VocabularySwap, 
  LogicCheck, 
  ContentInjection, 
  StrategicPraise 
} from '@/lib/types';

interface AnnotatedAnswerProps {
  userAnswer: string;
  vocabularySwaps: VocabularySwap[];
  logicChecks: LogicCheck[];
  contentInjections: ContentInjection[];
  strategicPraise: StrategicPraise[];
  coachBlueprint: CoachBlueprint;
  isXRayOn: boolean;
  onShowFeedback: (feedback: { 
    title: string; 
    body: string; 
    action: string; 
    type: 'red' | 'green' | 'blue' | 'purple' 
  }) => void;
}

export default function AnnotatedAnswer({ 
  userAnswer, 
  vocabularySwaps = [],
  logicChecks = [],
  contentInjections = [],
  strategicPraise = [],
  coachBlueprint,
  isXRayOn,
  onShowFeedback 
}: AnnotatedAnswerProps) {
  
  const paragraphs = userAnswer ? userAnswer.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
  
  if (paragraphs.length === 0) {
      return <p className="text-slate-500 italic">No answer content to display.</p>;
  }

  // We want to track which annotations were "claimed" by a paragraph match
  // But doing that globally across components is hard.
  // Instead, we will pass ALL annotations to EACH block, and each block will try to match what it can.
  // The block will ALSO render "orphans" (unmatched items) if it's the LAST block? 
  // No, that's messy.
  
  // Better approach: 
  // Each block renders matches inline.
  // If an annotation is NOT matched in ANY block, we should perhaps show it at the bottom of the whole answer?
  // For now, let's just make the matching logic in AnswerBlock robust.

  return (
    <div className={`space-y-8 ${isXRayOn ? 'xray-active' : ''}`}>
      {paragraphs.map((paraText, index) => {
        let sectionType: 'introduction' | 'body' | 'conclusion' = 'body';
        if (index === 0) sectionType = 'introduction';
        else if (index === paragraphs.length - 1 && paragraphs.length > 1) sectionType = 'conclusion';

        const blueprintTip = coachBlueprint?.[sectionType];

        return (
          <AnswerBlock 
            key={index}
            text={paraText} 
            vocabularySwaps={vocabularySwaps}
            logicChecks={logicChecks}
            contentInjections={contentInjections}
            strategicPraise={strategicPraise}
            onShowFeedback={onShowFeedback}
            blueprintTip={blueprintTip}
            sectionLabel={sectionType}
            isXRayOn={isXRayOn}
          />
        );
      })}
    </div>
  );
}

// --- FINGERPRINT MATCHING ENGINE ---

interface TextRange {
  start: number;
  end: number;
  type: 'red' | 'green' | 'purple' | 'blue';
  data: any;
  priority: number;
}

interface RenderSegment {
  text: string;
  type?: 'red' | 'green' | 'purple' | 'blue';
  data?: any;
}

// Helper: Strip non-alphanumeric chars
function getFingerprint(text: string) {
  let clean = "";
  const map: number[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Allow A-Z, 0-9. Ignore everything else.
    if (/[a-zA-Z0-9]/.test(char)) {
      clean += char.toLowerCase();
      map.push(i);
    }
  }
  return { clean, map };
}

function AnswerBlock({ 
  text, 
  vocabularySwaps, 
  logicChecks, 
  contentInjections, 
  strategicPraise,
  onShowFeedback,
  blueprintTip,
  sectionLabel,
  isXRayOn
}: { 
  text: string; 
  vocabularySwaps: VocabularySwap[];
  logicChecks: LogicCheck[];
  contentInjections: ContentInjection[];
  strategicPraise: StrategicPraise[];
  onShowFeedback: any;
  blueprintTip: any;
  sectionLabel: string;
  isXRayOn: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Calculate Matches
  const { segments, orphans } = useMemo(() => {
    // If X-Ray off, return basic text
    if (!isXRayOn || !text) return { segments: [{ text: text || "" }], orphans: [] };

    const ranges: TextRange[] = [];
    const matchedIds = new Set<string>(); // To track what we found
    
    // 1. Pre-calculate text fingerprint
    const { clean: cleanText, map: textIndexMap } = getFingerprint(text);

    // Generic Finder
    const findRanges = (items: any[], type: 'red'|'green'|'purple'|'blue', key: string, priority: number) => {
      if (!items) return;
      items.forEach((item, idx) => {
        // Unique ID for tracking
        const itemId = `${type}-${idx}`; 
        const target = item[key];
        
        if (!target || target.length < 2) return;

        // Fingerprint the target
        const { clean: cleanTarget } = getFingerprint(target);
        if (!cleanTarget) return;

        // Search in cleaned text
        let searchStart = 0;
        let foundIndex = -1;
        let foundAtLeastOne = false;

        while ((foundIndex = cleanText.indexOf(cleanTarget, searchStart)) !== -1) {
            foundAtLeastOne = true;
            const startClean = foundIndex;
            const endClean = foundIndex + cleanTarget.length - 1; 

            if (startClean < textIndexMap.length && endClean < textIndexMap.length) {
                const originalStart = textIndexMap[startClean];
                const originalEnd = textIndexMap[endClean] + 1; 

                ranges.push({
                    start: originalStart,
                    end: originalEnd,
                    type,
                    data: item,
                    priority
                });
            }
            searchStart = foundIndex + 1;
        }
        
        if (foundAtLeastOne) matchedIds.add(itemId);
      });
    };

    findRanges(vocabularySwaps, 'purple', 'original', 4);
    findRanges(contentInjections, 'green', 'locationInAnswer', 3);
    findRanges(logicChecks, 'red', 'originalText', 2);
    findRanges(strategicPraise, 'blue', 'appreciatedText', 1);

    // 2. Identify Orphans (Items that were meant for this section but not found)
    // Heuristic: If the item text contains words that appear in this paragraph, 
    // but the full phrase match failed, we treat it as an "Approximate Orphan".
    // For simplicity here, we just check if it was matched. 
    // NOTE: This logic is local to the paragraph. Truly global orphan detection requires parent state.
    // For now, we will NOT show orphans here to avoid duplicates across paragraphs. 
    // The "MicroCorrections" card already serves as the global list.
    
    // Flatten logic
    const indexMap = new Array(text.length).fill(null);
    ranges.forEach(range => {
      const start = Math.max(0, range.start);
      const end = Math.min(text.length, range.end);
      for (let i = start; i < end; i++) {
        const existing = indexMap[i];
        if (!existing || range.priority > existing.priority) {
          indexMap[i] = range;
        }
      }
    });

    const finalSegments: RenderSegment[] = [];
    let currentType: string | null = null;
    let currentData: any = null;
    let segmentStart = 0;

    for (let i = 0; i < text.length; i++) {
      const activeRange = indexMap[i];
      const type = activeRange?.type || null;
      const data = activeRange?.data || null;

      if (type !== currentType || data !== currentData) {
        if (i > segmentStart) {
          finalSegments.push({
            text: text.slice(segmentStart, i),
            type: currentType as any,
            data: currentData
          });
        }
        currentType = type;
        currentData = data;
        segmentStart = i;
      }
    }

    if (segmentStart < text.length) {
      finalSegments.push({
        text: text.slice(segmentStart),
        type: currentType as any,
        data: currentData
      });
    }

    return { segments: finalSegments, orphans: [] };

  }, [text, vocabularySwaps, logicChecks, contentInjections, strategicPraise, isXRayOn]);

  return (
    <div className="relative group pr-8">
      {/* Ghost Drawer Trigger */}
      <button 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className={`absolute -right-4 top-1 w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-300 z-10 ${isDrawerOpen ? 'text-blue-600 border-blue-300 rotate-90' : ''}`}
        title={`View ${sectionLabel} strategy`}
      >
        <ChevronRight size={16} />
      </button>

      {/* Paragraph Text */}
      <p className={`serif-font text-lg leading-loose text-slate-800 transition-opacity duration-300 ${isXRayOn ? 'opacity-100' : ''}`}>
        {segments.map((seg, idx) => {
          if (!seg.type) return <span key={idx}>{seg.text}</span>;

          // 🟣 PURPLE (Vocab)
          if (seg.type === 'purple') {
            return (
              <span key={idx} 
                className="cursor-pointer bg-purple-50 text-purple-900 border-b-2 border-purple-200 hover:bg-purple-100 hover:border-purple-400 transition-colors box-decoration-clone px-0.5 rounded-sm"
                onClick={() => onShowFeedback({ 
                  title: "Administrative Precision", 
                  body: `Replace "${seg.data.original}" with "${seg.data.replacement}"`, 
                  action: "Upgrade", 
                  type: 'purple' 
                })}
              >
                {seg.text}
                <Wand2 size={12} className="inline-block ml-1 text-purple-500 align-text-top" />
              </span>
            );
          }

          // 🟢 GREEN (Content)
          if (seg.type === 'green') {
            return (
              <span key={idx} 
                className="cursor-pointer bg-emerald-50 text-emerald-900 border-b-2 border-emerald-300 hover:bg-emerald-100 transition-colors box-decoration-clone px-0.5 rounded-sm"
                onClick={() => onShowFeedback({ 
                  title: `Missing ${seg.data.type || 'Insight'}`, 
                  body: seg.data.injectionContent, 
                  action: "Inject", 
                  type: 'green' 
                })}
              >
                {seg.text}
                <span className="inline-flex items-center justify-center ml-1 text-emerald-600 align-text-top bg-white rounded-full w-4 h-4 shadow-sm border border-emerald-100">
                  {getIconForType(seg.data.type)}
                </span>
              </span>
            );
          }

          // 🔴 RED (Logic)
          if (seg.type === 'red') {
            const isCritical = seg.data.severity === 'critical';
            return (
              <span key={idx} 
                className={`cursor-pointer font-medium transition-all duration-200 box-decoration-clone px-0.5 rounded-sm ${
                  isCritical 
                    ? 'bg-red-50 text-red-900 ring-1 ring-red-200 hover:bg-red-100' 
                    : 'bg-orange-50 text-orange-900 ring-1 ring-orange-200 hover:bg-orange-100'
                }`}
                onClick={() => onShowFeedback({ 
                  title: isCritical ? "Critical Logic Error" : "Structural Weakness", 
                  body: seg.data.critique, 
                  action: "Fix Logic", 
                  type: 'red' 
                })}
              >
                {seg.text}
                <AlertOctagon size={12} className="inline-block ml-1 text-red-500 align-text-top" />
              </span>
            );
          }

          // 🔵 BLUE (Praise)
          if (seg.type === 'blue') {
            return (
              <span key={idx} 
                className="cursor-pointer border-b-2 border-dashed border-blue-300 text-slate-800 hover:bg-blue-50 transition-colors box-decoration-clone"
                onClick={() => onShowFeedback({ 
                  title: "Well Done", 
                  body: seg.data.comment, 
                  action: "Keep", 
                  type: 'blue' 
                })}
              >
                {seg.text}
                <ThumbsUp size={12} className="inline-block ml-1 text-blue-500 align-text-top" />
              </span>
            );
          }
          
          return <span key={idx}>{seg.text}</span>;
        })}
      </p>

      {/* Ghost Drawer Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
              Topper's {sectionLabel} Strategy
            </span>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{blueprintTip?.strategy || "Focus"}:</span> {blueprintTip?.content || "Align with the core demand."}
          </p>
        </div>
      </div>
    </div>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case 'data': return <BarChart3 size={10} />;
    case 'case': return <Scale size={10} />;
    case 'committee': return <Users size={10} />;
    case 'law': return <BookOpen size={10} />;
    default: return <PlusCircle size={10} />;
  }
}