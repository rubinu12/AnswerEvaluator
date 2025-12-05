// components/result/AnnotatedAnswer.tsx
'use client';

import { useState } from 'react';
import { 
  PlusCircle, 
  AlertTriangle, 
  ThumbsUp, 
  ChevronRight, 
  Lightbulb, 
  Wand2 
} from 'lucide-react';
import { MentorsPenData, CoachBlueprint, VocabularySwap } from '@/lib/types';

interface AnnotatedAnswerProps {
  userAnswer: string;
  mentorsPen: MentorsPenData;
  vocabularySwap: VocabularySwap[]; // Added Purple Pen Data
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
  mentorsPen, 
  vocabularySwap,
  coachBlueprint,
  isXRayOn,
  onShowFeedback 
}: AnnotatedAnswerProps) {
  
  // We split the answer into paragraphs to attach "Ghost Drawers" (Side Arrows)
  // Heuristic: First Para = Intro, Last Para = Conclusion, Middle = Body
  const paragraphs = userAnswer.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return (
    <div className={`space-y-6 ${isXRayOn ? 'xray-active' : ''}`}>
      {paragraphs.map((paraText, index) => {
        // Determine Section Type for the Ghost Drawer
        let sectionType: 'introduction' | 'body' | 'conclusion' = 'body';
        if (index === 0) sectionType = 'introduction';
        else if (index === paragraphs.length - 1 && paragraphs.length > 1) sectionType = 'conclusion';

        // Get the relevant tip from the blueprint
        const blueprintTip = coachBlueprint[sectionType];

        return (
          <AnswerBlock 
            key={index}
            text={paraText} 
            mentorsPen={mentorsPen} 
            vocabularySwap={vocabularySwap}
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

// --- SUB-COMPONENT: SINGLE PARAGRAPH BLOCK WITH DRAWER ---
function AnswerBlock({ 
  text, 
  mentorsPen, 
  vocabularySwap,
  onShowFeedback,
  blueprintTip,
  sectionLabel,
  isXRayOn
}: { 
  text: string; 
  mentorsPen: MentorsPenData; 
  vocabularySwap: VocabularySwap[];
  onShowFeedback: any;
  blueprintTip: any;
  sectionLabel: string;
  isXRayOn: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- ANNOTATION PARSER ---
  // Wraps matching text with interactive spans
  const renderText = () => {
    // Start with the full text as one block
    let parts = [{ text, type: 'text', data: null as any }];

    // Generic splitter function
    const splitSegments = (feedbackItems: any[], type: 'red' | 'green' | 'blue' | 'purple', keyName: string) => {
      feedbackItems.forEach(item => {
        // Support different key names for different pen types (originalText, locationInAnswer, etc.)
        const targetText = item[keyName]; 
        if (!targetText) return;

        const newParts: any[] = [];
        parts.forEach(part => {
          // Only split raw text nodes
          if (part.type !== 'text') { newParts.push(part); return; }
          
          // Case-insensitive check could be added here if needed
          const split = part.text.split(targetText);
          
          for (let i = 0; i < split.length; i++) {
            // Insert the annotation match
            if (i > 0) newParts.push({ text: targetText, type, data: item });
            // Insert the text segment
            if (split[i]) newParts.push({ text: split[i], type: 'text', data: null });
          }
        });
        parts = newParts;
      });
    };

    if (isXRayOn) {
      // Apply splitting in priority order
      splitSegments(mentorsPen.redPen, 'red', 'originalText');
      splitSegments(mentorsPen.greenPen, 'green', 'locationInAnswer');
      splitSegments(mentorsPen.bluePen, 'blue', 'appreciatedText');
      splitSegments(vocabularySwap, 'purple', 'original'); // Added Purple Pen
    }

    return parts.map((part, idx) => {
      // 1. RED PEN (Error/Fluff)
      if (part.type === 'red') {
        return (
          <span key={idx} 
            className="decoration-wavy underline decoration-red-400 cursor-pointer hover:bg-red-50 text-slate-900 font-medium transition-colors"
            onClick={() => onShowFeedback({ title: "Correction Required", body: part.data.comment, action: "Fix Logic", type: 'red' })}
          >
            {part.text}
          </span>
        );
      }
      // 2. GREEN PEN (Add Data/Arsenal)
      if (part.type === 'green') {
        const hasArsenal = !!part.data.arsenalId;
        return (
          <span key={idx} className="relative group cursor-pointer inline-block"
            onClick={() => onShowFeedback({ 
              title: hasArsenal ? `Missing ${part.data.arsenalId}` : "Missed Opportunity", 
              body: part.data.suggestion, 
              action: hasArsenal ? `Use ${part.data.arsenalId}` : "Add Point", 
              type: 'green' 
            })}
          >
            <span className="bg-emerald-50 text-slate-900 border-b-2 border-emerald-300 px-0.5 rounded-t-sm hover:bg-emerald-100 transition-colors">
              {part.text}
            </span>
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] align-top shadow-sm -mt-2">
              <PlusCircle size={10} />
            </span>
          </span>
        );
      }
      // 3. BLUE PEN (Good)
      if (part.type === 'blue') {
        return (
          <span key={idx} 
            className="border-b-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 text-slate-900"
            onClick={() => onShowFeedback({ title: "Well Done", body: part.data.comment, action: "Save Phrase", type: 'blue' })}
          >
            {part.text}
          </span>
        );
      }
      // 4. PURPLE PEN (Vocab Swap) - NEW
      if (part.type === 'purple') {
        return (
          <span key={idx} 
            className="border-b-2 border-dotted border-purple-400 text-purple-900 font-medium cursor-pointer hover:bg-purple-50 transition-colors"
            onClick={() => onShowFeedback({ 
              title: "Language Upgrade", 
              body: `Replace "${part.data.original}" with "${part.data.replacement}"`, 
              action: "Upgrade", 
              type: 'purple' 
            })}
          >
            {part.text}
            <Wand2 size={10} className="inline ml-1 -mt-0.5 text-purple-500" />
          </span>
        );
      }
      
      // Plain Text
      return <span key={idx}>{part.text}</span>;
    });
  };

  return (
    <div className="relative group pr-8">
      {/* Side Arrow (Ghost Trigger) */}
      <button 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className={`absolute -right-3 top-1 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-300 z-10 ${isDrawerOpen ? 'text-blue-600 border-blue-300 rotate-90' : ''}`}
        title={`View ${sectionLabel} strategy`}
      >
        <ChevronRight size={14} />
      </button>

      {/* The Text Content */}
      <p className={`serif-font text-base leading-8 text-slate-800 transition-opacity duration-300 ${isXRayOn ? 'opacity-100' : ''}`}>
        {renderText()}
      </p>

      {/* Ghost Drawer (The Coach's Tip) */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-slate-50 border-l-2 border-blue-400 p-3 rounded-r-md shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              Topper's {sectionLabel} Strategy
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{blueprintTip?.strategy || "Focus"}:</span> {blueprintTip?.content || "Align with the core demand."}
          </p>
        </div>
      </div>
    </div>
  );
}