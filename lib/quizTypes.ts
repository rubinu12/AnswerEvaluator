// lib/quizTypes.ts
import { auth } from '@/lib/firebase'; // We'll need this for auth

// --- Question & Answer Types ---

export type BackendQuestion = {
  _id: string;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  options?: { label: string; text: string }[];
  correctOption: string;
  explanationText?: string; 
  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string; 
  questionType?: QuestionType; 
  explanation?: string | UltimateExplanation; 
  handwrittenNoteUrl?: string;
};

export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string | UltimateExplanation;
  questionType: QuestionType; 
  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string;
  handwrittenNoteUrl?: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}

// --- Quiz Configuration Types (Unchanged) ---

export interface QuizFilter {
  exam?: string;
  year?: string;
  subject?: string;
  topic?: string;
}

export type GroupByKey = 'topic' | 'examYear';

// --- State & Error Types (Unchanged) ---

export interface QuizError {
  message: string;
  type: 'auth' | 'generic';
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'info' | 'warning';
}

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

// ==================================================================
// --- 💎 --- "DATA" STORE TYPES --- 💎 ---
// ==================================================================

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
  totalTime: number;

  // Grouping & Sorting
  quizTitle: string;
  quizGroupBy: GroupByKey | null;
  isGroupingEnabled: boolean;

  // Review & Bookmarks
  bookmarkedQuestions: Set<string>;
  markedForReview: Set<string>;

  // Notifications & Stats
  toast: ToastState;
  editingQuestionId: string | null;
  performanceStats: PerformanceStats | null;
};

export interface QuizActions {
  loadAndStartQuiz: (filter: QuizFilter) => Promise<void>;
  startTest: () => void;
  submitTest: () => void;
  resetTest: () => void;
  handleAnswerSelect: (questionId: string, answer: string) => void;
  toggleBookmark: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  handleDetailedSolution: () => void;
  viewAnswer: (questionId: string) => void; // This might be deprecated soon
  closeAnswerView: () => void; // This might be deprecated soon
  setTimeLeft: (timeLeft: number) => void;
  showToast: (message: string, type: 'info' | 'warning') => void;
  hideToast: () => void;
  
  // Admin Actions
  openExplanationEditor: (questionId: string) => void;
  closeExplanationEditor: () => void;
  updateQuestionExplanation: (
    questionId: string,
    newExplanation: UltimateExplanation 
  ) => void;
  
  // Grouping
  setIsGroupingEnabled: (isEnabled: boolean) => void;
}

export type QuizStore = QuizState & QuizActions;


// ==================================================================
// --- 💎 --- NEW "UI" STORE TYPES --- 💎 ---
// ==================================================================

export interface QuizUIState {
  currentQuestionNumberInView: number;
  isPageScrolled: boolean;
  isTopBarVisible: boolean;
  currentGroupInView: string | null;
  explanationModalQuestionId: string | null;
}

export interface QuizUIActions {
  setCurrentQuestionNumberInView: (questionNumber: number) => void;
  setIsPageScrolled: (isScrolled: boolean) => void;
  setIsTopBarVisible: (isVisible: boolean) => void;
  setCurrentGroupInView: (groupName: string | null) => void;
  openExplanationModal: (questionId: string) => void;
  closeExplanationModal: () => void;
  
  // Reset UI state (e.g., when quiz resets)
  resetUIState: () => void;
}

export type QuizUIStore = QuizUIState & QuizUIActions;


// ==================================================================
// --- EXPLANATION TYPES (Unchanged) ---
// ==================================================================

export type QuestionType =
  | 'SingleChoice'
  | 'StatementBased'
  | 'HowManyPairs'
  | 'HowMany'
  | 'MatchTheList'
  | 'SelectTheCode'
  | 'StatementExplanation';

export type Hotspot = {
  term: string;
  type: 'green' | 'blue' | 'red';
  definition: string;
  handwrittenNoteUrl?: string; 
};

export type VisualAid = {
  type: 'image' | 'video';
  url: string;
  caption?: string;
};

export type UltimateExplanation = {
  howToThink: string;
  coreAnalysis: string;
  adminProTip: string;
  hotspotBank: Hotspot[];
  handwrittenNoteUrl?: string; 
  takeaway?: string; 
  visualAid?: VisualAid | null;
};

export const isUltimateExplanation = (
  explanation: string | UltimateExplanation | undefined
): explanation is UltimateExplanation => {
  return (
    typeof explanation === 'object' &&
    explanation !== null &&
    'howToThink' in explanation &&
    'coreAnalysis' in explanation &&
    'adminProTip' in explanation
  );
};