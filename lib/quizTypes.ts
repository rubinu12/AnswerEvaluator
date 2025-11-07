// lib/quizTypes.ts
import { auth } from '@/lib/firebase'; // We'll need this for auth

// --- Question & Answer Types ---

// The raw question format from our database/API
export type BackendQuestion = {
  _id: string;
  questionText: string;
  
  // This supports both your old data (optionA) and new (options)
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  options?: { label: string; text: string }[];

  correctOption: string;
  explanationText?: string; // Made optional
  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string; 
  
  questionType?: QuestionType; 
  explanation?: string | UltimateExplanation; 
};

// The transformed Question format our app will use
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
}

// Represents a user's selected answer
export interface UserAnswer {
  questionId: string;
  answer: string;
}

// --- Quiz Configuration Types ---

export interface QuizFilter {
  exam?: string;
  year?: string;
  subject?: string;
  topic?: string;
}

export type GroupByKey = 'topic' | 'examYear';

// --- State & Error Types ---

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

// --- Zustand Store Types ---

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

  // UI & Interaction State
  currentQuestionNumberInView: number;
  currentViewAnswer: string | null; 
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
  editingQuestionId: string | null;
  performanceStats: PerformanceStats | null;
}

export interface QuizActions {
  loadAndStartQuiz: (filter: QuizFilter) => Promise<void>;
  startTest: () => void;
  submitTest: () => void;
  resetTest: () => void;
  handleAnswerSelect: (questionId: string, answer: string) => void;
  toggleBookmark: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  handleDetailedSolution: () => void;
  viewAnswer: (questionId: string) => void;
  closeAnswerView: () => void;
  setCurrentQuestionNumberInView: (questionNumber: number) => void;
  setIsPageScrolled: (isScrolled: boolean) => void;
  setIsTopBarVisible: (isVisible: boolean) => void;
  setCurrentGroupInView: (groupName: string | null) => void;
  setIsGroupingEnabled: (isEnabled: boolean) => void;
  setTimeLeft: (timeLeft: number) => void;
  showToast: (message: string, type: 'info' | 'warning') => void;
  hideToast: () => void;
  openExplanationEditor: (questionId: string) => void;
  closeExplanationEditor: () => void;
  updateQuestionExplanation: (
    questionId: string,
    newExplanation: UltimateExplanation
  ) => void;
}

export type QuizStore = QuizState & QuizActions;

// ==================================================================
// --- 💎 "PERFECTED" ULTIMATE EXPLANATION TYPES (UPGRADED) 💎 ---
// ==================================================================

/**
 * --- UPDATED: Added your two new types ---
 */
export type QuestionType =
  | 'SingleChoice'
  | 'StatementBased'
  | 'HowManyPairs'
  | 'HowMany'
  | 'MatchTheList'
  | 'SelectTheCode' // <-- NEW
  | 'StatementExplanation'; // <-- NEW

/**
 * Pen-Based Hotspot. (Unchanged)
 */
export type Hotspot = {
  term: string;
  type: 'green' | 'blue' | 'red';
  definition: string;
};

/**
 * Visual aid (map, diagram) (Unchanged)
 */
export type VisualAid = {
  type: 'image' | 'video';
  url: string;
  caption?: string;
};

// --- "Perfect" Schema-Specific Analysis Types ---

/**
 * --- UPDATED: 'SingleChoice' (Concise) ---
 * Based on your new prompt:
 * - REMOVED 'coreConceptAnalysis'
 * - ADDED 'text' to optionAnalysis
 * - ADDED 'finalAnswer'
 */
export type SingleChoiceAnalysis = {
  optionAnalysis: {
    option: string; // e.g., "A"
    text: string; // e.g., "Silver Iodide..."
    isCorrect: boolean;
    analysis: string; // Rich HTML
  }[];
  finalAnswer: string; // e.g., "A"
};

/**
 * 'HowMany' (Unchanged from before, matches your new prompt)
 */
export type HowManyAnalysis = {
  itemAnalysis: {
    item: string; // e.g., "1. Lake Tanganyika"
    isCorrect: boolean;
    analysis: string; // Rich HTML
  }[];
  conclusion: {
    countSummary: string; // Rich HTML
    optionAnalysis: string; // Rich HTML
  };
};

/**
 * --- UPDATED: 'MatchTheList' (New Schema) ---
 * Based on your new prompt:
 * - REPLACED 'correctMatches' with 'itemAnalysis'
 * - REPLACED 'conclusion' string with a 'conclusion' object
 */
export type MatchTheListAnalysis = {
  itemAnalysis: {
    item: string; // e.g., "A. [Item A text]"
    correctMatch: string; // e.g., "[Match 2 text]"
    analysis: string; // Rich HTML
  }[];
  conclusion: {
    correctCombination: string; // Rich HTML
    optionAnalysis: string; // Rich HTML
  };
};

/**
 * --- NEW: 'SelectTheCode' ---
 * Based on your 'getSelectTheCodeSchema'
 */
export type MultiSelectAnalysis = {
  itemAnalysis: {
    item: string; // e.g., "1. Statement 1"
    isCorrect: boolean;
    analysis: string; // Rich HTML
  }[];
  conclusion: {
    correctItemsSummary: string; // Rich HTML
    optionAnalysis: string; // Rich HTML
  };
};

/**
 * --- NEW: 'StatementExplanation' ---
 * Based on your 'getStatementExplanationSchema'
 */
export type StatementAnalysis = {
  statements: {
    id: string; // e.g., "A" or "I"
    text: string; // e.g., "Statement I text..."
    isCorrect: boolean; // True/False analysis
    analysis: string; // Rich HTML
  }[];
  relationshipAnalysis: string; // Rich HTML for the "[Because Test]"
  optionAnalysis: string; // Rich HTML for the final A,B,C,D
};


/**
* The "Perfect" Ultimate Explanation JSON structure.
* --- UPDATED to include all 5 schemas ---
*/
export type UltimateExplanation = {
  howToThink: string; // Rich HTML
  
  // --- Only ONE of these will be present ---
  singleChoiceAnalysis?: SingleChoiceAnalysis;
  howManyAnalysis?: HowManyAnalysis;
  matchTheListAnalysis?: MatchTheListAnalysis;
  multiSelectAnalysis?: MultiSelectAnalysis; // <-- NEW
  statementAnalysis?: StatementAnalysis; // <-- NEW

  // --- Common Fields ---
  adminProTip: string; // Rich HTML
  takeaway: string; // Rich HTML
  visualAid?: VisualAid | null;
  hotspotBank?: Hotspot[];
};

/**
 * "Perfect" Helper type guard. (Unchanged)
 */
export const isUltimateExplanation = (
  explanation: string | UltimateExplanation | undefined
): explanation is UltimateExplanation => {
  return (
    typeof explanation === 'object' &&
    explanation !== null &&
    'howToThink' in explanation &&
    'adminProTip' in explanation &&
    'takeaway' in explanation
  );
};