// lib/store.ts
import { create } from 'zustand';
import { EvaluationData } from './types'; // Assuming your types are in this file

// Define the possible states for our multi-step evaluation process.
type ProcessingState = 'idle' | 'ocr' | 'editing' | 'evaluating';

// Define the structure of our store's state.
interface EvaluationState {
  processingState: ProcessingState;
  extractedText: string;
  selectedPaper: string;
  evaluationResult: EvaluationData | null;
  error: string | null;
}

// Define the actions that can be performed on our state.
interface EvaluationActions {
  setProcessingState: (state: ProcessingState) => void;
  setExtractedText: (text: string, paper: string) => void;
  setEvaluationResult: (result: EvaluationData) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Create the Zustand store by combining the state and actions.
export const useEvaluationStore = create<EvaluationState & EvaluationActions>((set) => ({
  // Initial State
  processingState: 'idle',
  extractedText: '',
  selectedPaper: '',
  evaluationResult: null,
  error: null,

  // Actions
  setProcessingState: (state) => set({ processingState: state }),
  setExtractedText: (text, paper) => set({ extractedText: text, selectedPaper: paper, processingState: 'editing' }),
  setEvaluationResult: (result) => set({ evaluationResult: result }),
  setError: (error) => set({ error: error }),
  reset: () => set({
    processingState: 'idle',
    extractedText: '',
    selectedPaper: '',
    evaluationResult: null,
    error: null,
  }),
}));
