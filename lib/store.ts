// lib/store.ts
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

// Define the structure of our store's state.
interface EvaluationState {
  // Existing State
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
  // --- NEW STATE ADDED ---
  isPageLoading: boolean;
}

// Define the actions that can be performed on our state.
interface EvaluationActions {
  // Existing Actions
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
  // --- NEW ACTION ADDED ---
  setPageLoading: (isLoading: boolean) => void;
}

// Create the Zustand store by combining the state and actions.
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
    isPageLoading: false, // Initial state for the page loader

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

    setPreparedData: (data) => set({ preparedData: data }),
    startEvaluation: () =>
      set({ evaluationStatus: 'processing', isProcessingInBackground: true, isConfirming: false }),

    completeEvaluation: (payload) => {
      const { analysis, preparedData, subject } = payload;

      const finalQuestionAnalysis: QuestionAnalysis[] = preparedData.map(
        (prepItem: PreparedQuestion) => {
          const analysisItem = analysis.questionAnalysis?.find(
            (item) => item.questionNumber === prepItem.questionNumber,
          );
          
          if (!analysisItem) {
            throw new Error(`Analysis for question ${prepItem.questionNumber} is missing.`);
          }
          
          return {
            ...analysisItem,
            questionNumber: prepItem.questionNumber,
            questionText: prepItem.questionText,
            userAnswer: prepItem.userAnswer,
            maxMarks: prepItem.maxMarks,
            subject: analysisItem.subject, 
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

    acknowledgeCompletion: () => set({
      isProcessingInBackground: false,
    }),

    startTranscription: () => set({ processingState: 'ocr', error: null }),
    cancelTranscription: () => set({ processingState: 'idle' }),
    
    // --- NEW ACTION IMPLEMENTATION ---
    setPageLoading: (isLoading) => set({ isPageLoading: isLoading }),
  }),
);