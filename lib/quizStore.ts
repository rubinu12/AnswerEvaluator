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
  BackendQuestion,
  ToastState,
  PerformanceStats,
} from './quizTypes';
import { auth } from '@/lib/firebase'; 
import { useQuizUIStore } from './quizUIStore';

// --- Helper: Get Auth Token (Unchanged) ---
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const initialToastState: ToastState = { message: '', type: 'info', show: false };

// --- Initial State (Cleaned) ---
const initialState: QuizState = {
  questions: [],
  userAnswers: [],
  isLoading: true,
  isTestMode: false,
  showReport: false,
  showDetailedSolution: false,
  quizError: null, 
  timeLeft: 0,
  totalTime: 0,
  quizTitle: '',
  quizGroupBy: null,
  isGroupingEnabled: false,
  bookmarkedQuestions: new Set<string>(),
  markedForReview: new Set<string>(),
  editingQuestionId: null,
  toast: initialToastState, 
  performanceStats: null,
};


// --- Helper: Question Formatter (Unchanged from last fix) ---
const formatBackendQuestion = (
  bq: BackendQuestion & { [key: string]: any }, 
  index: number
): Question => {
  return {
    id: bq._id || `q-${index}`,
    questionNumber: index + 1,
    text: bq.questionText || bq.question_text || bq.text || bq.question || "Error: Failed to load question text.",
    options: bq.options || [
      { label: 'A', text: bq.optionA || bq.option_a || '' },
      { label: 'B', text: bq.optionB || bq.option_b || '' },
      { label: 'C', text: bq.optionC || bq.option_c || '' },
      { label: 'D', text: bq.optionD || bq.option_d || '' },
    ],
    correctAnswer: bq.correctOption || bq.correct_option || bq.correctAnswer || bq.answer,
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

      // --- 💎 --- This function now *only* loads the quiz --- 💎 ---
      // It trusts persistence to handle refreshes.
      loadAndStartQuiz: async (filter: QuizFilter) => {
        
        // --- 💎 --- THIS IS THE FIX --- 💎 ---
        // We only set loading. We *do not* wipe the state here.
        // This honors your "save on refresh" rule.
        set({ isLoading: true });
        // --- 💎 --- END OF FIX --- 💎 ---
        
        try {
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
          const totalQuestions = formattedQuestions.length;
          const newTotalTime = totalQuestions * 72;
          
          // We just set the data. We DON'T reset userAnswers, showReport, etc.
          // This will correctly load the user's saved session.
          set({
            questions: formattedQuestions,
            // Only update time if it's not already set (e.g., in a running test)
            totalTime: get().totalTime || newTotalTime,
            timeLeft: get().timeLeft || newTotalTime,
            quizTitle: data.quizTitle || 'Custom Quiz',
            quizGroupBy: data.quizGroupBy || 'subject',
            isGroupingEnabled: data.isGroupingEnabled || false,
            isLoading: false,
          });

        } catch (error: any) {
          console.error('Error loading quiz:', error);
          set({
            isLoading: false,
            quizError: {
              message: error.message || 'An unknown error occurred',
              type: 'generic', 
            },
          });
        }
      },

      // --- 💎 --- "WIPE ON MODE CHANGE" --- 💎 ---
      // This is your logic. It's correct.
      startTest: () => {
        set({
          isTestMode: true,
          showReport: false,
          userAnswers: [], // <-- WIPE
          showDetailedSolution: false, // <-- WIPE
          timeLeft: get().totalTime,
          markedForReview: new Set<string>(),
          performanceStats: null,
        });
        useQuizUIStore.getState().resetUIState();
      },

      // (submitTest is unchanged)
      submitTest: () => {
        // ... all calculation logic ...
        const { questions, userAnswers, totalTime, timeLeft } = get();
        const questionMap = new Map<string, Question>();
        questions.forEach(q => questionMap.set(q.id, q));
        let correctCount = 0;
        let incorrectCount = 0;
        const maxScore = questions.length;
        const answeredQuestions = userAnswers.length;
        userAnswers.forEach(ua => {
          const question = questionMap.get(ua.questionId);
          if (question && question.correctAnswer === ua.answer) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        });
        const unattemptedCount = maxScore - answeredQuestions;
        const finalScore = maxScore > 0 ? (correctCount / maxScore) * 100 : 0;
        const accuracy = answeredQuestions > 0 ? (correctCount / answeredQuestions) * 100 : 0;
        const timeTaken = totalTime - timeLeft;
        const avgTimePerQuestion = answeredQuestions > 0 ? timeTaken / answeredQuestions : 0;
        let pacingStatus: "Ahead" | "On Pace" | "Behind" = "On Pace";
        if (maxScore > 0 && totalTime > 0) {
          const timePerQuestionTarget = totalTime / maxScore;
          const timePerQuestionActual = answeredQuestions > 0 ? avgTimePerQuestion : 0;
          if (timePerQuestionActual > 0) {
            if (timePerQuestionActual < timePerQuestionTarget * 0.9) {
              pacingStatus = "Ahead";
            } else if (timePerQuestionActual > timePerQuestionTarget * 1.1) {
              pacingStatus = "Behind";
            }
          }
        }
        const stats: PerformanceStats = {
          maxScore: maxScore,
          correctCount: correctCount,
          incorrectCount: incorrectCount,
          unattemptedCount: unattemptedCount,
          finalScore: Math.round(finalScore),
          accuracy: Math.round(accuracy),
          avgTimePerQuestion: avgTimePerQuestion, 
          pacing: pacingStatus,
        };
        set({
          isTestMode: false,
          showReport: true,
          performanceStats: stats,
        });
      },
      
      // (resetTest is for "Practice Again")
      resetTest: () => {
        set({
          userAnswers: [],
          isTestMode: false,
          showReport: false,
          showDetailedSolution: false,
          timeLeft: get().totalTime,
          markedForReview: new Set<string>(),
          performanceStats: null,
        });
        useQuizUIStore.getState().resetUIState();
      },

      // --- 💎 --- "WIPE ON LEAVE" --- 💎 ---
      // This function will be called by the Header
      clearQuizSession: () => {
        set(initialState); 
        useQuizUIStore.getState().resetUIState();
      },

      // (handleAnswerSelect is unchanged)
      handleAnswerSelect: (questionId: string, answer: string) => {
        const { isTestMode, userAnswers } = get();
        if (isTestMode) {
          if (userAnswers.some((ua) => ua.questionId === questionId)) return; 
          set({ userAnswers: [...userAnswers, { questionId, answer }] });
        } else {
          if (userAnswers.some((ua) => ua.questionId === questionId)) return; 
          set((state) => ({
            userAnswers: [...state.userAnswers, { questionId, answer }],
            showDetailedSolution: true, 
          }));
        }
      },

      // (Rest of the store is unchanged)
      handleDetailedSolution: () => {
        const { questions } = get();
        const { currentQuestionNumberInView, openExplanationModal } = useQuizUIStore.getState();
        const questionId = questions[currentQuestionNumberInView - 1]?.id;
        if (questionId) {
          set({ showDetailedSolution: true });
          openExplanationModal(questionId);
        } else {
          console.warn("handleDetailedSolution: Could not find question for view number", currentQuestionNumberInView);
        }
      },
      setTimeLeft: (time: number) => set({ timeLeft: time }),
      toggleBookmark: (questionId: string) => {
        set((state) => {
          const newSet = new Set(state.bookmarkedQuestions);
          if (newSet.has(questionId)) newSet.delete(questionId);
          else newSet.add(questionId);
          return { bookmarkedQuestions: newSet };
        });
      },
      toggleMarkForReview: (questionId: string) => {
        set((state) => {
          const newSet = new Set(state.markedForReview);
          if (newSet.has(questionId)) newSet.delete(questionId);
          else newSet.add(questionId);
          return { markedForReview: newSet };
        });
      },
      showToast: (message: string, type: 'info' | 'warning') => set({ toast: { message, type, show: true } }),
      hideToast: () => set((state) => ({ toast: { ...state.toast, show: false } })),
      openExplanationEditor: (questionId: string | null) => set({ editingQuestionId: questionId }),
      closeExplanationEditor: () => set({ editingQuestionId: null }),
      updateQuestionExplanation: (questionId: string, newExplanation: UltimateExplanation) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, explanation: newExplanation } : q
          ),
          editingQuestionId: null,
        }));
      },
      viewAnswer: (questionId: string) => useQuizUIStore.getState().openExplanationModal(questionId),
      closeAnswerView: () => useQuizUIStore.getState().closeExplanationModal(),
      setPerformanceStats: (stats: PerformanceStats) => set({ performanceStats: stats }),
      setIsGroupingEnabled: (isGrouping: boolean) => set({ isGroupingEnabled: isGrouping }),
    }),
    {
      name: 'quiz-session',
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (value instanceof Set) return { _type: 'Set', value: Array.from(value) };
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