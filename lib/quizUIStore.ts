// lib/quizUIStore.ts
import { create } from 'zustand';
import { QuizUIStore, QuizUIState } from './quizTypes';

// Define the initial state for the UI
const initialUIState: QuizUIState = {
  currentQuestionNumberInView: 1,
  isPageScrolled: false,
  isTopBarVisible: true,
  currentGroupInView: null,
  explanationModalQuestionId: null,
};

// Create the new store
export const useQuizUIStore = create<QuizUIStore>()(
  (set, get) => ({
    ...initialUIState,

    // --- All the high-frequency UI actions are now here ---

    setCurrentQuestionNumberInView: (questionNumber: number) => {
      set({ currentQuestionNumberInView: questionNumber });
    },
    
    setIsPageScrolled: (isScrolled: boolean) => {
      set({ isPageScrolled: isScrolled });
    },
    
    setIsTopBarVisible: (isVisible: boolean) => {
      set({ isTopBarVisible: isVisible });
    },
    
    setCurrentGroupInView: (groupName: string | null) => {
      set({ currentGroupInView: groupName });
    },
    
    openExplanationModal: (questionId: string) => {
      set({ explanationModalQuestionId: questionId });
    },
    
    closeExplanationModal: () => {
      set({ explanationModalQuestionId: null });
    },
    
    resetUIState: () => {
      set(initialUIState);
    }
    
  })
);