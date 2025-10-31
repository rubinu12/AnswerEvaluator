// lib/quizTypes.ts
import { auth } from '@/lib/firebase'; // We'll need this for auth

// --- Question & Answer Types ---

// The raw question format from our database/API
export type BackendQuestion = {
  _id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanationText: string;
  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string; // This is a composite key we create
};

// The transformed Question format our app will use
export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string;
}

// Represents a user's selected answer
export interface UserAnswer {
  questionId: string;
  answer: string;
}

// --- Quiz Configuration Types ---

// Filters used to fetch questions
export interface QuizFilter {
  exam?: string;
  year?: string;
  subject?: string;
  topic?: string;
}

// The key to group questions by (e.g., "Topic" or "Exam Year")
export type GroupByKey = 'topic' | 'examYear';

// --- State & Error Types ---

// A generic quiz error
export interface QuizError {
  message: string;
  type: 'auth' | 'generic'; // Auth error (e.g., session expired) or other
}

// For our pop-up toast notifications
export interface ToastState {
  show: boolean;
  message: string;
  type: 'info' | 'warning';
}

// The final calculated performance stats
export interface PerformanceStats {
  finalScore: number;
  accuracy: number;
  avgTimePerQuestion: number;
  pacing: 'Ahead' | 'On Pace' | 'Behind';
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  maxScore: number;
}

// --- Zustand Store Types ---

// This defines all the STATE properties
export interface QuizState {
  // Core Quiz Data
  questions: Question[];
  userAnswers: UserAnswer[];
  
  // Quiz Status
  isLoading: boolean;
  isTestMode: boolean;
  showReport: boolean;
  showDetailedSolution: boolean;
  quizError: QuizError | null;
  
  // Timer
  timeLeft: number;
  totalTime: number; // Total quiz time in seconds

  // UI & Interaction State
  currentQuestionNumberInView: number; // The question# the user is looking at
  currentViewAnswer: string | null;    // For showing a single answer's explanation
  isPageScrolled: boolean;
  isTopBarVisible: boolean;
  
  // Grouping & Sorting
  quizTitle: string;
  quizGroupBy: GroupByKey | null;
  isGroupingEnabled: boolean;
  currentGroupInView: string | null;

  // Review & Bookmarks
  bookmarkedQuestions: Set<string>;
  markedForReview: Set<string>;

  // Notifications & Stats
  toast: ToastState;
  performanceStats: PerformanceStats | null;
}

// This defines all the ACTIONS (functions)
export interface QuizActions {
  // --- Initialization & Setup ---
  loadAndStartQuiz: (filter: QuizFilter) => Promise<void>;
  
  // --- Quiz Lifecycle ---
  startTest: () => void;
  submitTest: () => void;
  resetTest: () => void; // Resets store and navigates to dashboard
  
  // --- Answer & Review ---
  handleAnswerSelect: (questionId: string, answer: string) => void;
  toggleBookmark: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  
  // --- Navigation & UI ---
  handleDetailedSolution: () => void; // Show solution mode after report
  viewAnswer: (questionId: string) => void;
  closeAnswerView: () => void;
  setCurrentQuestionNumberInView: (questionNumber: number) => void;
  setIsPageScrolled: (isScrolled: boolean) => void;
  setIsTopBarVisible: (isVisible: boolean) => void;
  setCurrentGroupInView: (groupName: string | null) => void;
  setIsGroupingEnabled: (isEnabled: boolean) => void;

  // --- Timer ---
  setTimeLeft: (timeLeft: number) => void;

  // --- Notifications ---
  showToast: (message: string, type: 'info' | 'warning') => void;
  hideToast: () => void;
  
  // --- Session Management (Coming Later) ---
  // saveSession: () => void;
  // loadSession: () => void;
}

// The final combined store type
export type QuizStore = QuizState & QuizActions;