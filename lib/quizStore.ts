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
  activeFilter: null,
  
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

// --- 🛡️ DATA NORMALIZER 🛡️ ---
const formatBackendQuestion = (bq: BackendQuestion & { [key: string]: any }, index: number): Question => {
  
  let rawOptions = bq.options;
  if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      rawOptions = Object.values(rawOptions);
  }
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
     rawOptions = [
       { label: 'A', text: bq.optionA || '' },
       { label: 'B', text: bq.optionB || '' },
       { label: 'C', text: bq.optionC || '' },
       { label: 'D', text: bq.optionD || '' },
     ];
  }

  const formattedOptions = rawOptions.map((opt: any, idx: number) => {
      const fallbackLabel = String.fromCharCode(65 + idx); 
      return {
          label: (opt.label || fallbackLabel).toUpperCase().trim(), 
          text: opt.text || opt.value || (typeof opt === 'string' ? opt : "") 
      };
  });

  let cleanCorrect = bq.correctOption || bq.correct_option || bq.correctAnswer || bq.answer || "";
  let calculatedCorrectAnswer = cleanCorrect;

  // Check for explicit 'isCorrect' flag
  formattedOptions.forEach((opt: any) => {
      const originalOpt = rawOptions![formattedOptions.indexOf(opt)];
      if (originalOpt && (originalOpt.isCorrect === true || originalOpt.isCorrect === "true")) {
          calculatedCorrectAnswer = opt.label;
      }
  });
  
  cleanCorrect = String(calculatedCorrectAnswer).trim();
  
  const numericVal = Number(cleanCorrect);
  const isNumeric = !isNaN(numericVal) && cleanCorrect !== "" && cleanCorrect !== null;

  if (isNumeric) {
      if (formattedOptions[numericVal]) {
          cleanCorrect = formattedOptions[numericVal].label;
      } else {
          cleanCorrect = String.fromCharCode(65 + numericVal);
      }
  } else {
      cleanCorrect = String(cleanCorrect || "").trim();
      if (cleanCorrect.toLowerCase().startsWith("option")) {
          cleanCorrect = cleanCorrect.split(" ")[1] || "";
      }
      cleanCorrect = cleanCorrect.toUpperCase().replace(/[()]/g, '');
  }

  return {
    id: bq._id || bq.id || `q-${index}`,
    questionNumber: index + 1,
    text: bq.questionText || bq.question_text || bq.text || bq.question || "Error: Question text missing.",
    options: formattedOptions,
    correctAnswer: cleanCorrect,
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
        const { activeFilter, questions, dataSource } = get();

        const isSameFilter = JSON.stringify(filter) === JSON.stringify(activeFilter);
        if (isSameFilter && questions.length > 0) {
            console.log("🔄 [QuizStore] Refresh Detected. Restoring Session.");
            set({ isLoading: false });
            return; 
        }

        console.log("🚀 [QuizStore] New Quiz. Fetching...");
        set({ isLoading: true, quizError: null, activeFilter: filter });
        
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
            isTestMode: false, 
            
            isLoading: false, 
            quizError: null
          });

        } catch (error: any) {
          console.error('❌ Error loading quiz:', error);
          set({
            isLoading: false,
            quizError: { message: error.message || 'Failed to load quiz.', type: 'generic' },
          });
        }
      },

      startTest: () => {
        set({ 
            isTestMode: true, 
            showReport: false, 
            userAnswers: [], 
            showDetailedSolution: false, 
            timeLeft: get().totalTime, 
            markedForReview: new Set<string>(), 
            performanceStats: null 
        });
        useQuizUIStore.getState().resetUIState();
      },

      // 💎 UPSC SCORING ENGINE 💎
      submitTest: async () => {
        const { questions, userAnswers, totalTime, timeLeft, activeFilter, quizTitle } = get();
        
        // Constants for UPSC
        const MARKS_PER_QUESTION = 2;
        const NEGATIVE_MULTIPLIER = 1/3; // 0.33 of the marks assigned
        const NEGATIVE_MARKS = MARKS_PER_QUESTION * NEGATIVE_MULTIPLIER; // 0.666...

        let correctCount = 0;
        let incorrectCount = 0;
        
        const responses: Record<string, any> = {};
        const questionMap = new Map(questions.map(q => [q.id, q]));
        
        userAnswers.forEach(ua => {
          const q = questionMap.get(ua.questionId);
          let status = 'SKIPPED';
          
          if (q) {
              const isCorrect = q.correctAnswer?.toUpperCase() === ua.answer?.toUpperCase();
              if (isCorrect) {
                  correctCount++;
                  status = 'CORRECT';
              } else {
                  incorrectCount++;
                  status = 'WRONG';
              }
              responses[q.id] = { answer: ua.answer, status };
          }
        });

        const unattemptedCount = questions.length - (correctCount + incorrectCount);
        
        // 🧮 CALCULATION FORMULA
        // (Correct * 2) - (Wrong * 0.66)
        const positiveScore = correctCount * MARKS_PER_QUESTION;
        const negativeScore = incorrectCount * NEGATIVE_MARKS;
        const rawScore = positiveScore - negativeScore;
        
        // Round to 2 decimal places
        const finalScore = Math.round((rawScore + Number.EPSILON) * 100) / 100;
        
        // Total possible marks
        const maxScore = questions.length * MARKS_PER_QUESTION;

        const accuracy = (correctCount + incorrectCount) > 0 
            ? (correctCount / (correctCount + incorrectCount)) * 100 
            : 0;
            
        const timeTaken = totalTime - timeLeft;
        const avgTimePerQuestion = (correctCount + incorrectCount) > 0 
            ? timeTaken / (correctCount + incorrectCount) 
            : 0;
        
        let pacing: "Ahead" | "On Pace" | "Behind" = "On Pace";
        if (questions.length > 0 && totalTime > 0) {
            const target = totalTime / questions.length;
            if (avgTimePerQuestion < target * 0.9) pacing = "Ahead";
            else if (avgTimePerQuestion > target * 1.1) pacing = "Behind";
        }

        const stats: PerformanceStats = { 
            maxScore, // Now 200 (for 100 questions) instead of 100
            correctCount, 
            incorrectCount, 
            unattemptedCount, 
            finalScore, // Now 1.34 instead of percentage
            accuracy: Math.round(accuracy), 
            avgTimePerQuestion, 
            pacing 
        };

        // Update UI
        set({
          isTestMode: false, showReport: true,
          performanceStats: stats
        });

        // Send to Cloud
        try {
            const authHeaders = await getAuthHeader();
            if (authHeaders && activeFilter) {
                fetch('/api/save-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders },
                    body: JSON.stringify({
                        stats,
                        responses,
                        filter: activeFilter,
                        quizTitle
                    })
                });
                get().showToast("Result saved successfully!", "info");
            }
        } catch (e) {
            console.error("Failed to save result:", e);
            get().showToast("Failed to save result.", "warning");
        }
      },

      resetTest: () => {
        set({ userAnswers: [], isTestMode: false, showReport: false, showDetailedSolution: false, timeLeft: get().totalTime, markedForReview: new Set<string>(), performanceStats: null });
        useQuizUIStore.getState().resetUIState();
      },
      clearQuizSession: () => { 
          set(initialState); 
          useQuizUIStore.getState().resetUIState(); 
      },
      handleAnswerSelect: (questionId: string, answer: string) => {
        const { isTestMode, userAnswers } = get();
        if (userAnswers.some((ua) => ua.questionId === questionId)) return; 
        set((state) => {
            const newState: Partial<QuizState> = { userAnswers: [...state.userAnswers, { questionId, answer }] };
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
                    get().showToast("Explanation not available.", "warning");
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
      // 🚨 VERSION 11: New Scoring System
      name: 'quiz-session-v11', 
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
        activeFilter: state.activeFilter,
        isTestMode: state.isTestMode,
        showReport: state.showReport,
        showDetailedSolution: state.showDetailedSolution,
        performanceStats: state.performanceStats,
      } as unknown as QuizStore),
    }
  )
);