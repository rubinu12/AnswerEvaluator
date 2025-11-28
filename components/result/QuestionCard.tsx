'use client';

import { useState } from 'react';
import { 
  Megaphone, X, AlertTriangle, PlusCircle, ThumbsUp, Wand2 
} from 'lucide-react';
import { QuestionAnalysis } from '@/lib/types';

// Import all the LEGO blocks
import Header from './Header';
import MarkReceipt from './MarkReceipt';
import BlindSpotDetector from './BlindSpotDetector';
import AnnotatedAnswer from './AnnotatedAnswer';
import CoachBlueprint from './CoachBlueprint';
import ToppersArsenal from './ToppersArsenal';
import LanguageUpgrade from './LanguageUpgrade';
import ActionPlan from './ActionPlan'; // Ensure you have this file created as discussed

interface QuestionCardProps {
  data: QuestionAnalysis;
}

export default function QuestionCard({ data }: QuestionCardProps) {
  // --- STATE ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'answer' | 'blueprint'>('answer');
  const [isXRayOn, setIsXRayOn] = useState(true);
  
  // Feedback Popup State
  const [activeFeedback, setActiveFeedback] = useState<{
    title: string;
    body: string;
    action: string;
    type: 'red' | 'green' | 'blue' | 'gray';
  } | null>(null);

  // --- HANDLERS ---
  const handleShowFeedback = (feedback: { title: string; body: string; action: string; type: 'red' | 'green' | 'blue' }) => {
    setActiveFeedback(feedback);
  };

  const closeFeedback = () => setActiveFeedback(null);

  // --- RENDER ---
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12 relative transition-all duration-300 hover:shadow-md">
      
      {/* 1. HEADER (Sticky) */}
      <Header 
        data={data}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onBookmark={() => console.log("Bookmark clicked")} // Wire up later
        onDownload={() => console.log("Download clicked")} // Wire up later
      />

      {/* COLLAPSIBLE BODY */}
      {!isCollapsed && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* 2. MARK RECEIPT */}
          <MarkReceipt data={data.questionDeconstruction} />

          <div className="p-6 space-y-8">
            
            {/* 3. VERDICT (Punchline) */}
            <div className="bg-blue-50 text-slate-800 rounded-lg p-4 border border-blue-100 flex gap-4 shadow-sm">
              <Megaphone className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                {/* Use overallVerdict from BlindSpot or a dedicated field if available */}
                <h3 className="font-bold text-sm mb-1">
                  {data.blindSpotAnalysis.overallVerdict || "Examiner's Verdict"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed opacity-90">
                  {data.overallFeedback?.generalAssessment || "Focus on addressing the missed dimensions to boost your score."}
                </p>
              </div>
            </div>

            {/* 4. THE ANSWER DECK (Toggle View) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              
              {/* Tab Bar */}
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <div className="flex p-1 bg-gray-200/50 rounded-lg">
                  <button 
                    onClick={() => setViewMode('answer')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      viewMode === 'answer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Your Answer
                  </button>
                  <button 
                    onClick={() => setViewMode('blueprint')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      viewMode === 'blueprint' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Coach's Blueprint
                  </button>
                </div>
                
                {/* X-Ray Toggle (Only visible in Answer Mode) */}
                {viewMode === 'answer' && (
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-slate-600 transition-colors">
                      X-Ray
                    </span>
                    <input 
                      type="checkbox" 
                      checked={isXRayOn} 
                      onChange={(e) => setIsXRayOn(e.target.checked)}
                      className="accent-slate-900 h-3 w-3 cursor-pointer" 
                    />
                  </label>
                )}
              </div>

              {/* View Content */}
              <div className="p-6 min-h-[300px]">
                {viewMode === 'answer' ? (
                  <AnnotatedAnswer 
                    userAnswer={data.userAnswer}
                    mentorsPen={data.mentorsPen}
                    coachBlueprint={data.coachBlueprint}
                    isXRayOn={isXRayOn}
                    onShowFeedback={handleShowFeedback}
                  />
                ) : (
                  <CoachBlueprint data={data.coachBlueprint} />
                )}
              </div>
            </div>

            {/* 5. TOPPER'S ARSENAL */}
            <ToppersArsenal data={data.topperArsenal} />

            {/* 6. BLIND SPOT DETECTOR */}
            <BlindSpotDetector data={data.blindSpotAnalysis} />

            {/* 7. LANGUAGE UPGRADE */}
            <LanguageUpgrade data={data.vocabularySwap} />

            {/* 8. ACTION PLAN */}
            <ActionPlan feedback={data.overallFeedback} />

          </div>
        </div>
      )}

      {/* --- FEEDBACK POPUP (Bottom Sheet / Modal) --- */}
      {activeFeedback && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity" 
            onClick={closeFeedback}
          ></div>
          
          {/* Card */}
          <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-xl shadow-2xl p-6 relative pointer-events-auto animate-in slide-in-from-bottom-10 duration-200 m-4 border border-gray-100">
            <button 
              onClick={closeFeedback}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex gap-4 items-start">
              <div className={`p-3 rounded-lg flex-shrink-0 ${
                activeFeedback.type === 'red' ? 'bg-red-50 text-red-600' :
                activeFeedback.type === 'green' ? 'bg-green-50 text-green-600' :
                activeFeedback.type === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {activeFeedback.type === 'red' ? <AlertTriangle size={24} /> :
                 activeFeedback.type === 'green' ? <PlusCircle size={24} /> :
                 activeFeedback.type === 'blue' ? <ThumbsUp size={24} /> : <Wand2 size={24} />}
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 mb-1.5 text-lg">{activeFeedback.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 font-medium">
                  {activeFeedback.body}
                </p>
                <button className={`w-full py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                   activeFeedback.type === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}>
                  {activeFeedback.type === 'green' && <PlusCircle size={16} />}
                  {activeFeedback.action}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </article>
  );
}