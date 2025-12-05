import { create } from 'zustand';
import {
  EvaluationCompletePayload,
  EvaluationData,
  QuestionAnalysis,
  PreparedQuestion,
} from './types';

// Define the possible states for our multi-step evaluation process.
type ProcessingState = 'idle' | 'ocr' | 'editing' | 'evaluating';
type EvaluationStatus = 'idle' | 'processing' | 'complete';

interface EvaluationState {
  processingState: ProcessingState;
  evaluationStatus: EvaluationStatus;
  isProcessingInBackground: boolean;
  isConfirming: boolean;
  extractedText: string;
  selectedPaper: string;
  evaluationResult: EvaluationData | null;
  newEvaluationId: string | null;
  preparedData: PreparedQuestion[];
  error: string | null;
  isReviewing: boolean;
  isPageLoading: boolean;
  pageTitle: string;
}

interface EvaluationActions {
  setProcessingState: (state: ProcessingState) => void;
  setIsConfirming: (isConfirming: boolean) => void;
  setExtractedText: (text: string, paper: string) => void;
  setPreparedData: (data: PreparedQuestion[]) => void;
  startEvaluation: () => void;
  completeEvaluation: (payload: EvaluationCompletePayload) => void;
  failEvaluation: (error: string) => void;
  resetEvaluation: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setIsReviewing: (isReviewing: boolean) => void;
  setSelectedPaper: (paper: string) => void;
  acknowledgeCompletion: () => void;
  startTranscription: () => void;
  cancelTranscription: () => void;
  setPageLoading: (isLoading: boolean) => void;
  setPageTitle: (title: string) => void;
  updateQuestionData: (index: number, newData: Partial<PreparedQuestion>) => void;
}

export const useEvaluationStore = create<EvaluationState & EvaluationActions>(
  (set) => ({
    // Initial State
    processingState: 'idle',
    evaluationStatus: 'idle',
    isProcessingInBackground: false,
    isConfirming: false,
    extractedText: '',
    selectedPaper: '',
    evaluationResult: null,
    newEvaluationId: null,
    preparedData: [],
    error: null,
    isReviewing: false,
    isPageLoading: false,
    pageTitle: 'Dashboard', 

    // Actions
    setProcessingState: (state) => set({ processingState: state }),
    setIsConfirming: (isConfirming) => set({ isConfirming }),
    
    setExtractedText: (text, paper) =>
      set({ 
        extractedText: text, 
        selectedPaper: paper, 
        processingState: 'idle',
        isReviewing: true,
      }),

    setPreparedData: (data) => set({ 
        preparedData: data.map((item, index) => ({
            ...item,
            questionNumber: index + 1 
        })) 
    }),

    updateQuestionData: (index, newData) => set((state) => {
        const updatedData = [...state.preparedData];
        if (updatedData[index]) {
            updatedData[index] = { ...updatedData[index], ...newData };
        }
        return { preparedData: updatedData };
    }),

    startEvaluation: () =>
      set({ evaluationStatus: 'processing', isProcessingInBackground: true, isConfirming: false }),

    completeEvaluation: (payload) => {
      let { analysis, preparedData, subject } = payload;

      console.log("--- Completing Evaluation (V2 Fix) ---");
      
      // [SILVER BULLET FIX] Auto-Unwrap Data
      // @ts-ignore
      if (analysis && analysis.analysis && Array.isArray(analysis.analysis.questionAnalysis)) {
          console.log("Detected Double-Wrapped Analysis. Unwrapping...");
          // @ts-ignore
          analysis = analysis.analysis;
      }

      // Safety Check
      if (!analysis.questionAnalysis || !Array.isArray(analysis.questionAnalysis)) {
          console.error("CRITICAL: questionAnalysis is missing or not an array", analysis);
          set({ error: "Evaluation data format error. Please check console." });
          return;
      }

      const finalQuestionAnalysis: QuestionAnalysis[] = preparedData.map(
        (prepItem: PreparedQuestion, index: number) => {
          
          // Match by Index (Ticket Number)
          let analysisItem = analysis.questionAnalysis[index] as any;

          if (!analysisItem) {
            console.error(`Missing analysis for Ticket #${index + 1} (Index ${index})`);
            throw new Error(`Analysis for Ticket #${index + 1} failed.`);
          }
          
          return {
            // 1. Meta Data (Header)
            meta: analysisItem.meta, 

            // 2. Identity
            questionNumber: prepItem.questionNumber,
            questionText: prepItem.questionText,
            userAnswer: prepItem.userAnswer,
            maxMarks: prepItem.maxMarks,
            subject: analysisItem.subject || subject,
            
            // 3. Scoring
            score: analysisItem.score,
            scoreBreakdown: analysisItem.scoreBreakdown, 
            
            // 4. Core Logic Modules
            questionDeconstruction: analysisItem.questionDeconstruction, 
            blindSpotAnalysis: analysisItem.blindSpotAnalysis,           
            coachBlueprint: analysisItem.coachBlueprint,                 
            mentorsPen: analysisItem.mentorsPen,                         
            vocabularySwap: analysisItem.vocabularySwap,                 
            topperArsenal: analysisItem.topperArsenal,
            
            // [NEW] Interdisciplinary Edge
            interdisciplinaryContext: analysisItem.interdisciplinaryContext, 
            
            // 5. Feedback & Action
            actionPlan: analysisItem.actionPlan,
            overallFeedback: analysisItem.overallFeedback,
          };
        },
      );

      const finalDataForStorage: EvaluationData = {
        subject: subject,
        overallScore: analysis.overallScore,
        totalMarks: analysis.totalMarks,
        overallFeedback: analysis.overallFeedback,
        submittedOn: new Date().toISOString(),
        questionAnalysis: finalQuestionAnalysis,
      };

      const uniqueId = `eval_${Date.now()}`;
      sessionStorage.setItem(uniqueId, JSON.stringify(finalDataForStorage));

      set({
        evaluationStatus: 'complete',
        newEvaluationId: uniqueId,
        evaluationResult: finalDataForStorage,
      });
    },

    failEvaluation: (error) =>
      set({
        processingState: 'idle',
        evaluationStatus: 'idle',
        isProcessingInBackground: false,
        error: error,
      }),
      
    resetEvaluation: () =>
      set({
        evaluationStatus: 'idle',
        newEvaluationId: null,
        evaluationResult: null,
        isConfirming: false,
        preparedData: [],
        error: null,
        isReviewing: false,
        selectedPaper: '',
      }),

    setError: (error) => set({ error: error }),
    
    reset: () =>
      set({
        processingState: 'idle',
        evaluationStatus: 'idle',
        isProcessingInBackground: false,
        isConfirming: false,
        extractedText: '',
        selectedPaper: '',
        evaluationResult: null,
        newEvaluationId: null,
        preparedData: [],
        error: null,
        isReviewing: false,
      }),
      
    setIsReviewing: (isReviewing) => set({ isReviewing }),
    setSelectedPaper: (paper) => set({ selectedPaper: paper }),
    acknowledgeCompletion: () => set({ isProcessingInBackground: false }),
    startTranscription: () => set({ processingState: 'ocr', error: null }),
    cancelTranscription: () => set({ processingState: 'idle' }),
    setPageLoading: (isLoading) => set({ isPageLoading: isLoading }),
    setPageTitle: (title) => set({ pageTitle: title }),
  }),
);