'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';
import { QuestionAnalysis } from '@/lib/types';

// --- COMPONENTS ---
import ResultHeader from './Header';
import DirectiveTopicStrip from './DirectiveTopicStrip';
import DemandMap from './MarkReceipt';
import VerdictBanner from './VerdictBanner';
import AnnotatedAnswer from './AnnotatedAnswer';
import CoachBlueprint from './CoachBlueprint';
import MicroCorrections from './MicroCorrections';
import ToppersArsenal from './ToppersArsenal';
import BlindSpotDetector from './BlindSpotDetector';
import LanguageUpgrade from './LanguageUpgrade';
import ActionPlan from './ActionPlan';
import InterdisciplinaryEdge from './InterdisciplinaryEdge'; 

interface QuestionCardProps {
  data: QuestionAnalysis;
}

export default function QuestionCard({ data }: QuestionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'answer' | 'blueprint'>('answer');
  const [isXRayOn, setIsXRayOn] = useState(true);
  
  // Feedback Popup State
  const [activeFeedback, setActiveFeedback] = useState<{
    title: string;
    body: string;
    action: string;
    type: 'red' | 'green' | 'blue' | 'purple';
  } | null>(null);

  const closeFeedback = () => setActiveFeedback(null);

  return (
    <motion.div layout className="relative mb-12">
      
      {/* 1. HEADER */}
      <ResultHeader 
        data={data} 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
             <div className="space-y-2 pt-2">
                
                {/* 2. VERDICT */}
                <VerdictBanner feedback={data.overallFeedback} />

                {/* 3. CONTEXT STRIP */}
                <DirectiveTopicStrip 
                   directiveLabel={data.meta.directiveLabel} 
                   directive={data.questionDeconstruction.directive}
                   topicTree={data.meta.topicTree}
                />

                {/* 4. DEMAND MAP */}
                <DemandMap data={data.questionDeconstruction} />

                {/* 5. MAIN ANSWER AREA */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                  
                  {/* TAB BAR */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50/50">
                     <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode('answer')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                            viewMode === 'answer' 
                              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Your Answer
                        </button>
                        
                        <button
                          onClick={() => setViewMode('blueprint')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                            viewMode === 'blueprint'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-500 hover:text-indigo-600'
                          }`}
                        >
                          Coach's Blueprint
                        </button>
                     </div>

                     {viewMode === 'answer' && (
                       <label className="flex items-center gap-2 cursor-pointer select-none">
                         <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isXRayOn ? 'text-indigo-600' : 'text-slate-400'}`}>
                           X-Ray
                         </span>
                         <div className="relative">
                           <input type="checkbox" className="sr-only" checked={isXRayOn} onChange={(e) => setIsXRayOn(e.target.checked)} />
                           <div className={`block w-8 h-5 rounded-full transition-colors ${isXRayOn ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                           <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${isXRayOn ? 'translate-x-3' : ''}`}></div>
                         </div>
                       </label>
                     )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 bg-white min-h-[300px]">
                    <AnimatePresence mode='wait'>
                      {viewMode === 'answer' ? (
                        <motion.div
                          key="answer"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                          <AnnotatedAnswer 
                            userAnswer={data.userAnswer}
                            // Pass the new 4 Pillars
                            vocabularySwaps={data.vocabularySwaps}
                            logicChecks={data.logicChecks}
                            contentInjections={data.contentInjections}
                            strategicPraise={data.strategicPraise}
                            
                            coachBlueprint={data.coachBlueprint}
                            isXRayOn={isXRayOn}
                            onShowFeedback={setActiveFeedback}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="blueprint"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                          <CoachBlueprint data={data.coachBlueprint} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                {/* 6. LOGIC & PRAISE SAFETY NET (Red + Blue) */}
                <MicroCorrections 
                    logicChecks={data.logicChecks}
                    strategicPraise={data.strategicPraise}
                />
                
                {/* 7. TOPPER'S ARSENAL (Green) */}
                <ToppersArsenal data={data.contentInjections} />

                {/* 8. LANGUAGE UPGRADE (Purple) */}
                <LanguageUpgrade data={data.vocabularySwaps} />

                {/* 9. INTERDISCIPLINARY */}
                <InterdisciplinaryEdge data={data.interdisciplinaryContext} />

                {/* 10. BLIND SPOTS & ACTION PLAN */}
                <BlindSpotDetector data={data.blindSpotAnalysis} />
                <ActionPlan data={data.actionPlan} />

             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK POPUP */}
      <AnimatePresence>
        {activeFeedback && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={closeFeedback} />
            <motion.div 
              initial={{ y: "100%", x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: "100%", x: "-50%", opacity: 0 }}
              className="fixed bottom-6 left-1/2 w-[90%] max-w-[500px] bg-white rounded-2xl shadow-2xl p-5 z-[100] border border-slate-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeFeedback.type === 'red' ? 'bg-red-100 text-red-600' :
                  activeFeedback.type === 'green' ? 'bg-emerald-100 text-emerald-600' :
                  activeFeedback.type === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {activeFeedback.type === 'green' ? <Check size={16} /> : <ArrowRight size={16} />}
                </div>
                <button onClick={closeFeedback} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-1">{activeFeedback.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{activeFeedback.body}</p>
              
              <button onClick={closeFeedback} className={`w-full py-2.5 rounded-lg font-bold text-sm text-white shadow-sm ${
                   activeFeedback.type === 'red' ? 'bg-red-600 hover:bg-red-700' :
                   activeFeedback.type === 'green' ? 'bg-emerald-600 hover:bg-emerald-700' :
                   activeFeedback.type === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                   'bg-indigo-600 hover:bg-indigo-700'
              }`}>
                {activeFeedback.action}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}