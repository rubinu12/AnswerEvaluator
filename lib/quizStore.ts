// lib/quizStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  QuizStore,
  QuizState,
  Question,
  QuizFilter,
  BackendQuestion,
  ToastState,
  PerformanceStats,
} from './quizTypes';
import { auth } from '@/lib/firebase'; 
import { useQuizUIStore } from './quizUIStore';

// --- Helper: Get Auth Token ---
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const initialToastState: ToastState = { message: '', type: 'info', show: false };

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
  
  // NEW: Track which data source we are using
  dataSource: 'student', // Default to 'student' (RTDB)
};

// --- Helper: Question Formatter ---
const formatBackendQuestion = (
  bq: BackendQuestion & { [key: string]: any }, 
  index: number
): Question => {
  return {
    id: bq._id || bq.id || `q-${index}`, // Handle both _id (Mongo-style) and id (RTDB)
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

export const useQuizStore = create(
  persist<QuizStore>(
    (set, get) => ({
      ...initialState,

      // --- TOGGLE SOURCE ACTION ---
      setDataSource: (source: 'admin' | 'student') => {
        set({ dataSource: source });
        // Optionally reload the quiz immediately if a filter exists
        // This requires storing the current filter in state, which we aren't doing yet.
        // For now, the user will just re-navigate or reload.
      },

      loadAndStartQuiz: async (filter: QuizFilter) => {
        set({ isLoading: true });
        const { dataSource } = get();
        
        try {
          let apiUrl = '';
          let headers = {};

          // --- DUAL MODE LOGIC ---
          if (dataSource === 'admin') {
            // Admin Mode: Fetch from Firestore (Official API)
            // This requires Auth
            const authHeaders = await getAuthHeader();
            if (!authHeaders) throw new Error("Admin mode requires login.");
            headers = { 'Content-Type': 'application/json', ...authHeaders };
            
            const queryParams = new URLSearchParams(
              filter as Record<string, string>
            ).toString();
            apiUrl = `/api/quizzes?${queryParams}`;

          } else {
            // Student Mode: Fetch from RTDB (Public API)
            // No Auth required for questions list
            headers = { 'Content-Type': 'application/json' };
            
            // Construct query params for our new get-questions API
            const queryParams = new URLSearchParams();
            if (filter.year) queryParams.append('year', filter.year);
            if (filter.subject) queryParams.append('subject', filter.subject);
            if (filter.topic) queryParams.append('topic', filter.topic);
            
            apiUrl = `/api/get-questions?${queryParams.toString()}`;
          }

          const res = await fetch(apiUrl, { method: 'GET', headers });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch quiz');
          }

          const data = await res.json();
          
          // Handle slightly different response structures
          const rawQuestions = dataSource === 'admin' ? data.questions : (data.questions || []);
          const formattedQuestions = rawQuestions.map(formatBackendQuestion);
          
          const totalQuestions = formattedQuestions.length;
          const newTotalTime = totalQuestions * 72;
          
          set({
            questions: formattedQuestions,
            totalTime: get().totalTime || newTotalTime,
            timeLeft: get().timeLeft || newTotalTime,
            quizTitle: data.quizTitle || (dataSource === 'admin' ? 'Admin Preview' : 'Practice Quiz'),
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

      // ... (Rest of actions: startTest, submitTest, etc. remain unchanged)
      startTest: () => {
        set({
          isTestMode: true,
          showReport: false,
          userAnswers: [],
          showDetailedSolution: false,
          timeLeft: get().totalTime,
          markedForReview: new Set<string>(),
          performanceStats: null,
        });
        useQuizUIStore.getState().resetUIState();
      },
      submitTest: () => {
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
      clearQuizSession: () => {
        set(initialState); 
        useQuizUIStore.getState().resetUIState();
      },
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
      updateQuestionExplanation: (questionId: string, newExplanation: any) => {
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