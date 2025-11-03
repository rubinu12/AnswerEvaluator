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
  UltimateExplanation, // <-- Import our new type
} from './quizTypes'; // We use our existing types
import { auth } from '@/lib/firebase'; // We need this for the auth token

// --- Helper: Get Auth Token ---
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// --- Initial State Definition ---
// This uses your 129-line file as the base, so it's "perfect"
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

  // UI & Interaction
  currentQuestionNumberInView: 1,
  currentViewAnswer: null,
  isPageScrolled: false,
  isTopBarVisible: true,

  // Grouping
  quizTitle: '',
  quizGroupBy: null,
  isGroupingEnabled: false,
  currentGroupInView: null,

  // Review
  bookmarkedQuestions: new Set<string>(),
  markedForReview: new Set<string>(),

  // Notifications
  toast: { show: false, message: '', type: 'info' },
  
  // --- 💎 "PERFECT" ADMIN STATE 💎 ---
  editingQuestionId: null,

  performanceStats: null,
};

// --- Create the Zustand Store ---
export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- ACTIONS ---

      loadAndStartQuiz: async (filter: QuizFilter) => {
        // WIPE PREVIOUS SESSION
        useQuizStore.persist.clearStorage();

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

          // Fetch raw questions
          const { questions: rawQuestions, quizTitle, totalTime } = await response.json();

          if (!rawQuestions || rawQuestions.length === 0) {
            throw new Error('No questions were found for your selection.');
          }

          // --- 💎 "PERFECT" TYPE-SAFETY FIX 💎 ---
          // This is where we fix the bug. We process the raw backend data
          // into our strict `Question` interface.
          const processedQuestions: Question[] = rawQuestions.map((q: any, index: number) => {
            
            // 1. Determine the explanation
            //    The new `explanation` field (which can be an object) takes precedence.
            //    If it's missing, fall back to the old `explanationText` string.
            const explanationContent: string | UltimateExplanation = 
              q.explanation || q.explanationText || '';

            return {
              ...q,
              id: q._id, // Ensure `id` is set from `_id`
              questionNumber: index + 1, // Assign a question number
              text: q.questionText,
              
              // 2. Set default questionType if missing from old data
              questionType: q.questionType || 'SingleChoice', 
              
              // 3. Unify explanation field
              explanation: explanationContent,
              
              // 4. Build options array (this was in your old code)
              options: [
                { label: 'A', text: q.optionA },
                { label: 'B', text: q.optionB },
                { label: 'C', text: q.optionC },
                { label: 'D', text: q.optionD },
              ],
              correctAnswer: q.correctOption,
            };
          });
          // --- 💎 END OF FIX 💎 ---

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
        // WIPE SESSION ON EXIT
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

      // --- Navigation & UI (unchanged) ---
      handleDetailedSolution: () => {
        console.log("handleDetailedSolution action called");
        set({ showReport: false, showDetailedSolution: true });
      },
      viewAnswer: (questionId: string) => {
        console.log(`viewAnswer: ${questionId}`);
        set({ currentViewAnswer: questionId });
      },
      closeAnswerView: () => {
        console.log("closeAnswerView action called");
        set({ currentViewAnswer: null });
      },
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

      // --- 💎 "PERFECT" ADMIN ACTIONS 💎 ---
      // These actions now match lib/quizTypes.ts "perfectly"
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
    }),
    {
      name: 'quiz-session', // Name of the item in localStorage
      
      storage: createJSONStorage(() => localStorage, {
        // replacer is used when SAVING (stringify)
        replacer: (key, value) => {
          if (value instanceof Set) {
            return {
              _type: 'Set',
              value: Array.from(value),
            };
          }
          return value;
        },
        // reviver is used when LOADING (parse)
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