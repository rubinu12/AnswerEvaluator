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
import { decryptExplanation } from './cryptoClient'; 

const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const initialToastState: ToastState = { message: '', type: 'info', show: false };
let cachedMasterKey: string | null = null; 

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
  dataSource: 'student', 
};

// --- 🛡️ FINAL DATA NORMALIZER 🛡️ ---
const formatBackendQuestion = (bq: BackendQuestion & { [key: string]: any }, index: number): Question => {
  
  // 1. PREPARE OPTIONS
  let rawOptions = bq.options;
  if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      rawOptions = Object.values(rawOptions);
  }
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
     rawOptions = [
       { label: 'A', text: bq.optionA || bq.option_a || '' },
       { label: 'B', text: bq.optionB || bq.option_b || '' },
       { label: 'C', text: bq.optionC || bq.option_c || '' },
       { label: 'D', text: bq.optionD || bq.option_d || '' },
     ];
  }

  // 2. FORMAT OPTIONS
  const formattedOptions = rawOptions.map((opt: any, idx: number) => {
      const fallbackLabel = String.fromCharCode(65 + idx); // 0->A, 1->B
      return {
          label: (opt.label || fallbackLabel).toUpperCase().trim(), 
          text: opt.text || opt.value || (typeof opt === 'string' ? opt : "") 
      };
  });

  // 3. 🧠 SMART ANSWER RESOLVER 🧠
  let rawCorrect = bq.correctOption || bq.correct_option || bq.correctAnswer || bq.answer || "";
  
  // Step A: Clean the string first (Remove "Option", "Ans", parens)
  let cleanCorrect = String(rawCorrect).trim().replace(/[()]/g, '');
  if (cleanCorrect.toLowerCase().startsWith("option")) {
      cleanCorrect = cleanCorrect.split(" ")[1] || cleanCorrect;
  }
  
  // Step B: Check if the *cleaned* value is a Number (e.g. "3" or 3)
  // We use formattedOptions length to ensure we don't index out of bounds
  const numericValue = Number(cleanCorrect);
  const isNumeric = !isNaN(numericValue) && cleanCorrect !== "";
  
  if (isNumeric) {
      // It's an index! (0, 1, 2, 3)
      // Check if we have a valid label for this index
      if (formattedOptions[numericValue]) {
          cleanCorrect = formattedOptions[numericValue].label; // Use the actual label "D"
      } else {
          // Fallback: Convert 3 -> D
          cleanCorrect = String.fromCharCode(65 + numericValue);
      }
  } else {
      // It's a Letter (A, B, C, D) -> Just normalize casing
      cleanCorrect = cleanCorrect.toUpperCase();
  }

  return {
    id: bq._id || bq.id || `q-${index}`,
    questionNumber: index + 1,
    text: bq.questionText || bq.question_text || bq.text || bq.question || "Error: Question text missing.",
    options: formattedOptions,
    correctAnswer: cleanCorrect, // Now definitively "A", "B", "C", or "D"
    explanation: bq.explanation || bq.explanationText || 'Tap "View Solution" to load explanation.', 
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

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setDataSource: (source: 'admin' | 'student') => { set({ dataSource: source }); },

      loadAndStartQuiz: async (filter: QuizFilter) => {
        set({ isLoading: true, quizError: null });
        const { dataSource } = get();
        
        try {
          let apiUrl = '';
          let headers = {};

          if (dataSource === 'admin') {
            const authHeaders = await getAuthHeader();
            if (!authHeaders) throw new Error("Admin mode requires login.");
            headers = { 'Content-Type': 'application/json', ...authHeaders };
            const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
            apiUrl = `/api/quizzes?${queryParams}`;
          } else {
            headers = { 'Content-Type': 'application/json' };
            const queryParams = new URLSearchParams();
            console.log("🔧 [QuizStore] Building URL with Filter:", filter);
            if (filter.year) queryParams.append('year', filter.year);
            if (filter.subject) queryParams.append('subject', filter.subject);
            if (filter.topic) queryParams.append('topic', filter.topic);
            apiUrl = `/api/get-questions?${queryParams.toString()}`;
          }

          const res = await fetch(apiUrl, { method: 'GET', headers });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); 
            throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
          }

          const data = await res.json();
          const rawQuestions = dataSource === 'admin' ? data.questions : (data.questions || []);
          
          if (rawQuestions.length === 0) {
             console.warn("⚠️ API returned 0 questions.");
             set({ isLoading: false, questions: [], quizError: { message: "No questions found.", type: 'generic' } });
             return;
          }

          const formattedQuestions = rawQuestions.map(formatBackendQuestion);
          const newTotalTime = formattedQuestions.length * 72;
          
          set({
            questions: formattedQuestions,
            totalTime: get().totalTime || newTotalTime,
            timeLeft: get().timeLeft || newTotalTime,
            quizTitle: data.quizTitle || (dataSource === 'admin' ? 'Admin Preview' : 'Practice Quiz'),
            quizGroupBy: data.quizGroupBy || 'subject',
            isGroupingEnabled: data.isGroupingEnabled || false,
            userAnswers: [],
            showReport: false,
            showDetailedSolution: false,
            bookmarkedQuestions: new Set(),
            markedForReview: new Set(),
            performanceStats: null,
            isLoading: false, 
            quizError: null
          });

        } catch (error: any) {
          console.error('❌ Error loading quiz:', error);
          set({ isLoading: false, quizError: { message: error.message || 'Failed to load quiz.', type: 'generic' } });
        }
      },

      startTest: () => {
        set({ isTestMode: true, showReport: false, userAnswers: [], showDetailedSolution: false, timeLeft: get().totalTime, markedForReview: new Set<string>(), performanceStats: null });
        useQuizUIStore.getState().resetUIState();
      },

      submitTest: () => {
         const { questions, userAnswers, totalTime, timeLeft } = get();
        let correctCount = 0;
        let incorrectCount = 0;
        const maxScore = questions.length;
        const answeredQuestions = userAnswers.length;
        const questionMap = new Map(questions.map(q => [q.id, q]));
        
        userAnswers.forEach(ua => {
          const q = questionMap.get(ua.questionId);
          if (q && q.correctAnswer?.toUpperCase() === ua.answer?.toUpperCase()) correctCount++;
          else incorrectCount++;
        });
        
        const unattemptedCount = maxScore - answeredQuestions;
        const finalScore = maxScore > 0 ? (correctCount / maxScore) * 100 : 0;
        const accuracy = answeredQuestions > 0 ? (correctCount / answeredQuestions) * 100 : 0;
        const timeTaken = totalTime - timeLeft;
        const avgTime = answeredQuestions > 0 ? timeTaken / answeredQuestions : 0;
        let pacing: "Ahead" | "On Pace" | "Behind" = "On Pace";
        if (maxScore > 0 && totalTime > 0) {
            const target = totalTime / maxScore;
            if (avgTime < target * 0.9) pacing = "Ahead";
            else if (avgTime > target * 1.1) pacing = "Behind";
        }
        set({
          isTestMode: false, showReport: true,
          performanceStats: { maxScore, correctCount, incorrectCount, unattemptedCount, finalScore: Math.round(finalScore), accuracy: Math.round(accuracy), avgTimePerQuestion: avgTime, pacing }
        });
      },

      resetTest: () => {
        set({ userAnswers: [], isTestMode: false, showReport: false, showDetailedSolution: false, timeLeft: get().totalTime, markedForReview: new Set<string>(), performanceStats: null });
        useQuizUIStore.getState().resetUIState();
      },

      clearQuizSession: () => { set(initialState); useQuizUIStore.getState().resetUIState(); },

      handleAnswerSelect: (questionId: string, answer: string) => {
        const { isTestMode, userAnswers } = get();
        if (userAnswers.some((ua) => ua.questionId === questionId)) return; 
        set((state) => {
            const newState: Partial<QuizState> = {
                userAnswers: [...state.userAnswers, { questionId, answer }]
            };
            if (!isTestMode) newState.showDetailedSolution = true;
            return newState;
        });
      },

      viewAnswer: async (questionId: string) => {
        const { questions, dataSource } = get();
        const question = questions.find(q => q.id === questionId);
        useQuizUIStore.getState().openExplanationModal(questionId);
        if (!question) return;
        const needsFetch = dataSource === 'student' && typeof question.explanation === 'string';
        if (needsFetch) {
            try {
                if (!cachedMasterKey) {
                    const authHeaders = await getAuthHeader();
                    if (!authHeaders) throw new Error("Authentication required.");
                    const keyRes = await fetch('/api/get-key', { headers: authHeaders });
                    if (!keyRes.ok) throw new Error("Failed to retrieve security key.");
                    const keyData = await keyRes.json();
                    cachedMasterKey = keyData.key;
                }
                const bucket = "answer-evaluator.firebasestorage.app"; 
                const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || bucket;
                const encodedPath = encodeURIComponent(`explanations/${questionId}.dat`);
                const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodedPath}?alt=media`;
                const fileRes = await fetch(fileUrl);
                if (!fileRes.ok) {
                    console.warn(`Explanation file missing for ${questionId}`);
                    get().showToast("Explanation not available yet.", "warning");
                    return;
                }
                const encryptedData = await fileRes.text();
                const decryptedJson = await decryptExplanation(encryptedData, cachedMasterKey!);
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === questionId ? { ...q, explanation: decryptedJson } : q
                    ),
                }));
            } catch (error) {
                console.error("Decryption Failed:", error);
                get().showToast("Solution unavailable.", "warning");
            }
        }
      },

      handleDetailedSolution: () => {
        const { questions } = get();
        const { currentQuestionNumberInView } = useQuizUIStore.getState();
        const questionId = questions[currentQuestionNumberInView - 1]?.id;
        if (questionId) get().viewAnswer(questionId);
      },

      closeAnswerView: () => useQuizUIStore.getState().closeExplanationModal(),
      setTimeLeft: (t) => set({ timeLeft: t }),
      toggleBookmark: (id) => set(s => { const n = new Set(s.bookmarkedQuestions); n.has(id)?n.delete(id):n.add(id); return {bookmarkedQuestions:n}}),
      toggleMarkForReview: (id) => set(s => { const n = new Set(s.markedForReview); n.has(id)?n.delete(id):n.add(id); return {markedForReview:n}}),
      showToast: (m, t) => set({ toast: { message: m, type: t, show: true } }),
      hideToast: () => set(s => ({ toast: { ...s.toast, show: false } })),
      openExplanationEditor: (id) => set({ editingQuestionId: id }),
      closeExplanationEditor: () => set({ editingQuestionId: null }),
      updateQuestionExplanation: (id, expl) => set(s => ({ questions: s.questions.map(q => q.id === id ? {...q, explanation: expl} : q), editingQuestionId: null })),
      setPerformanceStats: (stats: any) => set({ performanceStats: stats }),
      setIsGroupingEnabled: (enabled) => set({ isGroupingEnabled: enabled }),
    }),
    {
      // 🚨 VERSION 4: FINAL CLEAN CACHE
      name: 'quiz-session-v4', 
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => { if (value instanceof Set) return { _type: 'Set', value: Array.from(value) }; return value; },
        reviver: (key, value) => { if (typeof value === 'object' && value !== null && (value as any)._type === 'Set') return new Set((value as any).value); return value; },
      }),
      partialize: (state) => ({
        questions: state.questions,
        userAnswers: state.userAnswers,
        timeLeft: state.timeLeft,
        totalTime: state.totalTime,
        bookmarkedQuestions: state.bookmarkedQuestions,
        markedForReview: state.markedForReview,
        dataSource: state.dataSource,
      })as unknown as QuizStore,
    }
  )
);