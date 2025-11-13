// lib/quizStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  QuizStore,
  QuizState,
  Question,
  UserAnswer,
  QuizFilter,
  QuizError,
  UltimateExplanation,
  BackendQuestion, // <-- I saw this was missing from your imports, added it
} from '@/lib/quizTypes'; // Import the updated types
import { auth } from '@/lib/firebase'; 
import { useQuizUIStore } from '@/lib/quizUIStore'; // Import the new UI store

// --- Helper: Get Auth Token (Unchanged) ---
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// --- Initial \"Data\" State ---
const initialState: QuizState = {
  // Core Data
  questions: [],
  userAnswers: [],

  // Status
  isLoading: true,
  isTestMode: false,
  showReport: false,
  showDetailedSolution: false,
  quizError: null,

  // Timer
  timeLeft: 0,
  totalTime: 0,

  // Grouping
  quizTitle: '',
  quizGroupBy: null,
  isGroupingEnabled: false,

  // Review
  bookmarkedQuestions: new Set<string>(),
  markedForReview: new Set<string>(),

  // Editing (for admins)
  editingQuestionId: null,

  // Toast
  toast: null,
};

// --- Helper: Question Formatter (Unchanged) ---
const formatBackendQuestion = (
  bq: BackendQuestion,
  index: number
): Question => {
  return {
    id: bq._id,
    questionNumber: index + 1,
    text: bq.questionText,
    options: bq.options || [
      { label: 'A', text: bq.optionA || '' },
      { label: 'B', text: bq.optionB || '' },
      { label: 'C', text: bq.optionC || '' },
      { label: 'D', text: bq.optionD || '' },
    ],
    correctAnswer: bq.correctOption,
    explanation: bq.explanation || bq.explanationText || 'No explanation provided.',
    questionType: bq.questionType || 'SingleChoice',
    year: bq.year,
    subject: bq.subject,
    topic: bq.topic,
    exam: bq.exam,
    examYear: bq.examYear,
    handwrittenNoteUrl: bq.handwrittenNoteUrl,
  };
};

// --- The Main \"Data\" Store ---
export const useQuizStore = create(
  persist<QuizStore>(
    (set, get) => ({
      ...initialState,

      // --- 💎 --- CORE QUIZ ACTIONS (Refactored) --- 💎 ---

      loadAndStartQuiz: async (filter: QuizFilter) => {
        try {
          set({ isLoading: true, quizError: null, questions: [] });
          useQuizUIStore.getState().resetUIState(); // Reset UI store

          const headers = (await getAuthHeader()) || {};
          const queryParams = new URLSearchParams(
            filter as Record<string, string>
          ).toString();

          const res = await fetch(`/api/quizzes?${queryParams}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...headers },
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch quiz');
          }

          const data = await res.json();
          const formattedQuestions = data.questions.map(formatBackendQuestion);

          set({
            questions: formattedQuestions,
            totalTime: data.totalTime || formattedQuestions.length * 60,
            timeLeft: data.totalTime || formattedQuestions.length * 60,
            quizGroupBy: data.quizGroupBy || 'subject',
            isGroupingEnabled: data.isGroupingEnabled || false,
            // --- 💎 --- THIS IS THE FIX FOR ISSUE #5 --- 💎 ---
            quizTitle: data.quizTitle || 'Custom Quiz', // <-- We now save the title
            // --- 💎 --- END OF FIX --- 💎 ---
            isLoading: false,
            isTestMode: false,
            showReport: false,
            userAnswers: [],
            markedForReview: new Set<string>(),
            bookmarkedQuestions: new Set<string>(),
          });
        } catch (error: any) {
          console.error('Error loading quiz:', error);
          set({
            isLoading: false,
            quizError: {
              message: error.message || 'An unknown error occurred',
            },
          });
        }
      },

      startTest: () => {
        set({ isTestMode: true, showReport: false, userAnswers: [] });
      },

      submitTest: () => {
        set({ isTestMode: false, showReport: true });
        // In the future, we will add stat calculations here
      },

      // --- 💎 --- IN-QUIZ ACTIONS (Refactored) --- 💎 ---

      handleAnswerSelect: (questionId: string, answer: string) => {
        if (get().isTestMode) {
          // In Test Mode, overwrite previous answer
          set((state) => ({
            userAnswers: [
              ...state.userAnswers.filter(
                (ua) => ua.questionId !== questionId
              ),
              { questionId, answer },
            ],
          }));
        } else {
          // In Practice Mode, lock-in first answer
          if (get().userAnswers.some((ua) => ua.questionId === questionId)) {
            return; // Already answered
          }
          set((state) => ({
            userAnswers: [...state.userAnswers, { questionId, answer }],
            showDetailedSolution: true, // Show solution immediately
          }));
        }
      },

      setTimeLeft: (time: number) => {
        set({ timeLeft: time });
      },

      toggleBookmark: (questionId: string) => {
        set((state) => {
          const newSet = new Set(state.bookmarkedQuestions);
          if (newSet.has(questionId)) {
            newSet.delete(questionId);
          } else {
            newSet.add(questionId);
          }
          return { bookmarkedQuestions: newSet };
        });
      },

      toggleMarkForReview: (questionId: string) => {
        set((state) => {
          const newSet = new Set(state.markedForReview);
          if (newSet.has(questionId)) {
            newSet.delete(questionId);
          } else {
            newSet.add(questionId);
          }
          return { markedForReview: newSet };
        });
      },

      showToast: (message: string, type: 'success' | 'error' | 'info') => {
        set({ toast: { id: Date.now(), message, type } });
      },
      
      clearToast: () => {
        set({ toast: null });
      },

      // --- 💎 --- ADMIN/EDITING ACTIONS (Unchanged) --- 💎 ---
      setEditingQuestion: (questionId: string | null) => {
        set({ editingQuestionId: questionId });
      },
      updateQuestionExplanation: (
        questionId: string,
        newExplanation: UltimateExplanation
      ) => {
        console.log(`updateQuestionExplanation: ${questionId}`);
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, explanation: newExplanation } : q
          ),
          editingQuestionId: null,
        }));
      },
      
      // These are deprecated but might be used by old components.
      // We'll have them call the new UI store.
      viewAnswer: (questionId: string) => {
        console.warn("Legacy `viewAnswer` called");
        useQuizUIStore.getState().openExplanationModal(questionId);
      },
      closeAnswerView: () => {
        console.warn("Legacy `closeAnswerView` called");
        useQuizUIStore.getState().closeExplanationModal();
      },

    }),
    {
      name: 'quiz-session', 
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (value instanceof Set) {
            return {
              _type: 'Set',
              value: Array.from(value),
            };
          }
          return value;
        },
        reviver: (key, value) => {
          if (typeof value === 'object' && value !== null && (value as any)._type === 'Set') {
            return new Set((value as any).value);
          }
          return value;
        },
      }),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) =>
              ![
                'isLoading',
                'quizError',
                'toast',
                'editingQuestionId',
              ].includes(key)
          )
        ),
    }
  )
);