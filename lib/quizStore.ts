import { create } from 'zustand';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Question, UserAnswer } from './quizTypes';

const SECONDS_PER_QUESTION = 72;
type QuizMode = 'practice' | 'test' | 'review';

// 1. STATE INTERFACE (includes bookmarks and grouping)
interface QuizState {
  questions: Question[];
  userAnswers: UserAnswer[];
  currentQuestionInView: number;
  isLoading: boolean;
  mode: QuizMode;
  showReportCard: boolean;
  currentViewAnswerId: string | null;
  isPageScrolled: boolean;
  isGroupingEnabled: boolean; // For subject-wise grouping
  bookmarkedQuestions: Set<string>; // For bookmarking questions
  timeLeft: number;
  initialTime: number;
  timerInterval: NodeJS.Timeout | null;
  currentQuizParams: { type: string; filter: string; value: string; } | null;
}

// 2. ACTIONS INTERFACE (includes bookmarks and grouping)
interface QuizActions {
  fetchQuestions: (params: { type: string; filter: string; value: string }) => Promise<void>;
  handleAnswerSelect: (questionId: string, selectedOptionIndex: number) => void;
  startTest: () => void;
  submitTest: () => void;
  resetTest: () => void;
  enterReviewMode: () => void;
  viewAnswer: (questionId: string) => void;
  closeAnswerView: () => void;
  setPageScrolled: (isScrolled: boolean) => void;
  setIsGroupingEnabled: (isGrouping: boolean) => void;
  toggleBookmark: (questionId: string) => void;
  setCurrentQuestionInView: (index: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
}

// 3. INITIAL STATE (includes bookmarks and grouping)
const initialState: QuizState = {
  questions: [],
  userAnswers: [],
  currentQuestionInView: 0,
  isLoading: true,
  mode: 'practice',
  showReportCard: false,
  currentViewAnswerId: null,
  isPageScrolled: false,
  isGroupingEnabled: false,
  bookmarkedQuestions: new Set(),
  timeLeft: 0,
  initialTime: 0,
  timerInterval: null,
  currentQuizParams: null,
};

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  fetchQuestions: async (params) => {
    set({ ...initialState, isLoading: true, currentQuizParams: params });
    try {
      const { type, filter, value } = params;
      // When fetching by subject, automatically enable grouping
      const isSubjectBased = filter === 'subject';
      
      const questionsRef = collection(db, 'questions');
      const q = query(
        questionsRef,
        where('type', '==', type),
        where(filter, '==', (filter === 'year' ? parseInt(value) : value.replace(/-/g, ' ')))
      );
      const querySnapshot = await getDocs(q);
      const fetchedQuestions: Question[] = [];
      querySnapshot.forEach((doc) => {
        fetchedQuestions.push({ id: doc.id, ...doc.data() } as Question);
      });
      const calculatedTime = fetchedQuestions.length * SECONDS_PER_QUESTION;
      set({ 
        questions: fetchedQuestions, 
        initialTime: calculatedTime,
        timeLeft: calculatedTime,
        isLoading: false,
        isGroupingEnabled: isSubjectBased, // Correctly sets grouping default
      });
    } catch (error) {
      console.error("Error fetching questions from Firestore:", error);
      set({ isLoading: false });
    }
  },

  handleAnswerSelect: (questionId, selectedOptionIndex) => {
    const { mode, questions } = get();
    if (mode !== 'test') return;
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    const isCorrect = question.options[selectedOptionIndex].isCorrect;
    const newAnswer: UserAnswer = { questionId, selectedOption: selectedOptionIndex, isCorrect, timeTaken: 0 };
    set(state => ({
      userAnswers: state.userAnswers.find(ua => ua.questionId === questionId)
        ? state.userAnswers.map(ua => ua.questionId === questionId ? newAnswer : ua)
        : [...state.userAnswers, newAnswer]
    }));
  },

  startTest: () => {
    set(state => ({
      mode: 'test',
      userAnswers: [],
      timeLeft: state.initialTime,
      showReportCard: false,
      currentQuestionInView: 0,
      currentViewAnswerId: null,
    }));
    get().startTimer();
  },

  submitTest: () => {
    get().stopTimer();
    set({ mode: 'practice', showReportCard: true });
  },
  
  resetTest: () => {
    get().stopTimer();
    set(initialState);
  },

  enterReviewMode: () => {
    set({ showReportCard: false, mode: 'review' });
  },

  viewAnswer: (questionId) => {
    set({ currentViewAnswerId: questionId });
  },

  closeAnswerView: () => {
    set({ currentViewAnswerId: null });
  },

  setPageScrolled: (isScrolled) => {
    set({ isPageScrolled: isScrolled });
  },

  setIsGroupingEnabled: (isGrouping) => set({ isGroupingEnabled: isGrouping }),

  toggleBookmark: (questionId) => {
    set(state => {
      const newBookmarkedQuestions = new Set(state.bookmarkedQuestions);
      if (newBookmarkedQuestions.has(questionId)) {
        newBookmarkedQuestions.delete(questionId);
      } else {
        newBookmarkedQuestions.add(questionId);
      }
      return { bookmarkedQuestions: newBookmarkedQuestions };
    });
  },

  setCurrentQuestionInView: (index) => {
    set({ currentQuestionInView: index });
  },

  startTimer: () => {
    const interval = setInterval(() => {
      set(state => {
        if (state.timeLeft <= 1) {
          clearInterval(interval);
          get().submitTest();
          return { timeLeft: 0 };
        }
        return { timeLeft: state.timeLeft - 1 };
      });
    }, 1000);
    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },
}));

