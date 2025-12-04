// components/result/AnnotatedAnswer.tsx
'use client';

import { useState } from 'react';
import { PlusCircle, AlertTriangle, ThumbsUp, ChevronRight, Lightbulb } from 'lucide-react';
import { MentorsPenData, CoachBlueprint } from '@/lib/types';

interface AnnotatedAnswerProps {
  userAnswer: string;
  mentorsPen: MentorsPenData;
  coachBlueprint: CoachBlueprint;
  isXRayOn: boolean;
  onShowFeedback: (feedback: { title: string; body: string; action: string; type: 'red' | 'green' | 'blue' }) => void;
}

export default function AnnotatedAnswer({ 
  userAnswer, 
  mentorsPen, 
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
  onShowFeedback,
  blueprintTip,
  sectionLabel,
  isXRayOn
}: { 
  text: string; 
  mentorsPen: MentorsPenData; 
  onShowFeedback: any;
  blueprintTip: any;
  sectionLabel: string;
  isXRayOn: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- ANNOTATION PARSER ---
  // Wraps matching text with interactive spans
  const renderText = () => {
    let parts = [{ text, type: 'text', data: null as any }];

    const splitSegments = (feedbackItems: any[], type: 'red' | 'green' | 'blue') => {
      feedbackItems.forEach(item => {
        const targetText = item.originalText || item.locationInAnswer || item.appreciatedText;
        if (!targetText) return;

        const newParts: any[] = [];
        parts.forEach(part => {
          if (part.type !== 'text') { newParts.push(part); return; }
          const split = part.text.split(targetText);
          for (let i = 0; i < split.length; i++) {
            if (i > 0) newParts.push({ text: targetText, type, data: item });
            if (split[i]) newParts.push({ text: split[i], type: 'text', data: null });
          }
        });
        parts = newParts;
      });
    };

    splitSegments(mentorsPen.redPen, 'red');
    splitSegments(mentorsPen.greenPen, 'green');
    splitSegments(mentorsPen.bluePen, 'blue');

    return parts.map((part, idx) => {
      if (part.type === 'red') {
        return (
          <span key={idx} 
            className="decoration-wavy underline decoration-red-500 cursor-pointer hover:bg-red-50 text-slate-900 font-medium"
            onClick={() => onShowFeedback({ title: "Correction Required", body: part.data.comment, action: "Fix Logic", type: 'red' })}
          >
            {part.text}
          </span>
        );
      }
      if (part.type === 'green') {
        return (
          <span key={idx} className="relative group cursor-pointer"
            onClick={() => onShowFeedback({ title: "Missed Opportunity", body: part.data.suggestion, action: "Add to Wallet", type: 'green' })}
          >
            {part.text}
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700 text-[10px] align-top hover:bg-green-200">
              <PlusCircle size={10} />
            </span>
          </span>
        );
      }
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
      return <span key={idx}>{part.text}</span>;
    });
  };

  return (
    <div className="relative group pr-8">
      {/* Side Arrow (Ghost Trigger) */}
      <button 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className={`absolute -right-2 top-1 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-300 z-10 ${isDrawerOpen ? 'text-blue-600 border-blue-300 rotate-90' : ''}`}
        title={`View ${sectionLabel} strategy`}
      >
        <ChevronRight size={14} />
      </button>

      {/* The Text Content */}
      <p className={`serif-font text-base leading-8 text-slate-800 transition-opacity duration-300 ${isXRayOn ? 'opacity-80 group-hover:opacity-100' : ''}`}>
        {renderText()}
      </p>

      {/* Ghost Drawer (The Coach's Tip) */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDrawerOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        <div className="bg-slate-50 border-l-2 border-blue-400 p-3 rounded-r-md">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              Topper's {sectionLabel} Strategy
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{blueprintTip.strategy}:</span> {blueprintTip.content}
          </p>
        </div>
      </div>
    </div>
  );
}