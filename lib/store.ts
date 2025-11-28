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
  isPageLoading: boolean;

  // --- [NEW] STATE FOR MOBILE HEADER ---
  pageTitle: string;
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
  setPageLoading: (isLoading: boolean) => void;

  // --- [NEW] ACTION FOR MOBILE HEADER ---
  setPageTitle: (title: string) => void;
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
    isPageLoading: false,
    pageTitle: 'Dashboard', // Default title

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
        (prepItem: PreparedQuestion, index: number) => {
          
          // 1. Try finding by Explicit ID Match (Best Practice)
          // We convert both to strings to ensure loose matching (e.g. "1" == 1)
          let analysisItem = analysis.questionAnalysis?.find(
            (item) => String(item.questionNumber) === String(prepItem.questionNumber)
          );

          // 2. Fallback: If ID match fails, try finding by Index (Robustness)
          // This saves us if the AI returned a weird ID or if IDs are missing
          if (!analysisItem && analysis.questionAnalysis && analysis.questionAnalysis[index]) {
             console.warn(`ID mismatch for Q${prepItem.questionNumber}. Falling back to index ${index}.`);
             analysisItem = analysis.questionAnalysis[index];
          }
          
          if (!analysisItem) {
            throw new Error(`Analysis for question ${prepItem.questionNumber} is missing.`);
          }
          
          // Explicit mapping to ensure all new Phase 1 fields are captured correctly
          return {
            // 1. Identity & User Content (Prioritize Prepared Data)
            questionNumber: prepItem.questionNumber,
            questionText: prepItem.questionText,
            userAnswer: prepItem.userAnswer,
            maxMarks: prepItem.maxMarks,
            subject: analysisItem.subject, 
            
            // 2. Scores
            score: analysisItem.score,
            scoreBreakdown: analysisItem.scoreBreakdown, // NEW: Granular scoring

            // 3. The Intelligence Layers
            questionDeconstruction: analysisItem.questionDeconstruction, // Receipt
            blindSpotAnalysis: analysisItem.blindSpotAnalysis,           // Detector
            coachBlueprint: analysisItem.coachBlueprint,                 // Architect View
            mentorsPen: analysisItem.mentorsPen,                         // Annotations

            // 4. Value Adds
            vocabularySwap: analysisItem.vocabularySwap,                 // Language Table
            topperArsenal: analysisItem.topperArsenal,                   // Flashcards
            
            // 5. Legacy/Fallback & Feedback
            idealAnswer: analysisItem.idealAnswer,
            overallFeedback: analysis.overallFeedback // Attach global feedback
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

      // Generate a unique ID for this session
      const uniqueId = `eval_${Date.now()}`;
      
      // Store in Session Storage for the Result Page to retrieve
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
    
    setPageLoading: (isLoading) => set({ isPageLoading: isLoading }),

    // --- [NEW] ACTION IMPLEMENTATION ---
    setPageTitle: (title) => set({ pageTitle: title }),
  }),
);