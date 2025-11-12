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
} from './quizTypes'; // Import the updated types
import { auth } from '@/lib/firebase'; 
import { useQuizUIStore } from './quizUIStore'; // Import the new UI store

// --- Helper: Get Auth Token (Unchanged) ---
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// --- Initial "Data" State ---
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

  // Notifications
  toast: { show: false, message: '', type: 'info' },
  
  // Admin
  editingQuestionId: null,

  // Stats
  performanceStats: null,
};

// --- Create the "Data" Store ---
export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- ACTIONS ---

      loadAndStartQuiz: async (filter: QuizFilter) => {
        // WIPE PREVIOUS SESSION
        useQuizStore.persist.clearStorage();
        // 💎 --- RESET THE UI STORE --- 💎
        useQuizUIStore.getState().resetUIState(); 

        set({ ...initialState, isLoading: true, quizError: null });

        try {
          const headers = await getAuthHeader();
          if (!headers) {
            throw new Error('User is not authenticated.');
          }

          const params = new URLSearchParams();
          if (filter.subject) params.append('subject', filter.subject);
          if (filter.topic) params.append('topic', filter.topic);
          if (filter.year) params.append('year', filter.year);
          if (filter.exam) params.append('exam', filter.exam);

          const response = await fetch(`/api/quizzes?${params.toString()}`, {
            method: 'GET',
            headers: headers,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch questions.');
          }

          const { questions: rawQuestions, quizTitle, totalTime } = await response.json();

          if (!rawQuestions || rawQuestions.length === 0) {
            throw new Error('No questions were found for your selection.');
          }

          // Process and set data (this logic is correct)
          const processedQuestions: Question[] = rawQuestions.map((q: any, index: number) => {
            const explanationContent: string | UltimateExplanation = 
              q.explanation || ""; 

            return {
              ...q, 
              id: q.id, 
              questionNumber: q.questionNumber || index + 1, 
              text: q.text, 
              options: q.options, 
              correctAnswer: q.correctAnswer, 
              explanation: explanationContent,
              questionType: q.questionType || 'SingleChoice', 
            };
          });

          set({
            questions: processedQuestions,
            quizTitle,
            totalTime,
            timeLeft: totalTime,
            quizGroupBy: 'topic', 
            isGroupingEnabled: !!filter.subject,
            isLoading: false,
          });

        } catch (error: any) {
          console.error("Error loading quiz:", error);
          let errorType: QuizError['type'] = 'generic';
          if (error.message.includes('authenticated')) {
            errorType = 'auth';
          }
          set({ 
            isLoading: false, 
            quizError: { message: error.message, type: errorType }
          });
        }
      },

      startTest: () => {
        console.log("startTest action called");
        // 💎 --- RESET THE UI STORE --- 💎
        useQuizUIStore.getState().resetUIState();
        set((state) => ({
          isTestMode: true,
          showReport: false,
          showDetailedSolution: false,
          userAnswers: [],
          markedForReview: new Set<string>(),
          timeLeft: state.totalTime,
        }));
      },

      submitTest: () => {
        console.log("submitTest action called");
        set({ isTestMode: false, showReport: true });
      },
      
      resetTest: () => {
        console.log("resetTest action called");
        set({ ...initialState, isLoading: false }); 
        // 💎 --- RESET THE UI STORE --- 💎
        useQuizUIStore.getState().resetUIState();
        useQuizStore.persist.clearStorage();
      },

      handleAnswerSelect: (questionId: string, answer: string) => {
        console.log(`handleAnswerSelect: ${questionId} = ${answer}`);
        set((state) => {
          const newUserAnswers = state.userAnswers.filter(
            (ua) => ua.questionId !== questionId
          );
          newUserAnswers.push({ questionId, answer });
          
          return { userAnswers: newUserAnswers };
        });
      },

      toggleBookmark: (questionId: string) => {
        console.log(`toggleBookmark: ${questionId}`);
        set((state) => {
          const newBookmarked = new Set(state.bookmarkedQuestions);
          if (newBookmarked.has(questionId)) {
            newBookmarked.delete(questionId);
          } else {
            newBookmarked.add(questionId);
          }
          return { bookmarkedQuestions: newBookmarked };
        });
      },

      toggleMarkForReview: (questionId: string) => {
        console.log(`toggleMarkForReview: ${questionId}`);
        set((state) => {
          const newMarked = new Set(state.markedForReview);
          if (newMarked.has(questionId)) {
            newMarked.delete(questionId);
          } else {
            newMarked.add(questionId);
          }
          return { markedForReview: newMarked };
        });
      },
      
      handleDetailedSolution: () => {
        console.log("handleDetailedSolution action called");
        set({ showReport: false, showDetailedSolution: true });
      },
      
      // --- 💎 ALL UI ACTIONS HAVE BEEN MOVED --- 💎
      // viewAnswer, closeAnswerView, setCurrentQuestionNumberInView,
      // setIsPageScrolled, setIsTopBarVisible, setCurrentGroupInView,
      // openExplanationModal, closeExplanationModal
      // ARE ALL GONE FROM THIS FILE.

      // --- Actions that remain ---
      setIsGroupingEnabled: (isEnabled: boolean) => {
        set({ isGroupingEnabled: isEnabled });
      },
      setTimeLeft: (timeLeft: number) => {
        set({ timeLeft });
      },
      showToast: (message: string, type: 'info' | 'warning' = 'info') => {
        set({ toast: { show: true, message, type } });
      },
      hideToast: () => {
        set({ toast: { show: false, message: '', type: 'info' } });
      },
      openExplanationEditor: (questionId: string) => {
        console.log(`openExplanationEditor: ${questionId}`);
        set({ editingQuestionId: questionId });
      },
      closeExplanationEditor: () => {
        console.log('closeExplanationEditor');
        set({ editingQuestionId: null });
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
    }
  )
);