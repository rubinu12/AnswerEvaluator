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
  
  // --- 💎 UPGRADE: NEW FIELDS 💎 ---
  questionType?: QuestionType; // Optional for backward compatibility
  explanation?: string | UltimateExplanation; // This will replace explanationText
};

// The transformed Question format our app will use
export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  
  // --- 💎 UPGRADE: EXPLANATION FIELD 💎 ---
  explanation: string | UltimateExplanation;
  
  // --- 💎 UPGRADE: QUESTION TYPE 💎 ---
  questionType: QuestionType; // We will default to 'SingleChoice' if missing

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
  
  // --- 💎 "SCRAPPED" MODAL STATE 💎 ---
  // This is for the old "cramped" modal we "scrapped"
  editingQuestionId: string | null;

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
  
  // --- 💎 "SCRAPPED" MODAL ACTIONS 💎 ---
  openExplanationEditor: (questionId: string) => void;
  closeExplanationEditor: () => void;
  updateQuestionExplanation: (
    questionId: string,
    newExplanation: UltimateExplanation
  ) => void;
  
  // --- Session Management (Coming Later) ---
  // saveSession: () => void;
  // loadSession: () => void;
}

// The final combined store type
export type QuizStore = QuizState & QuizActions;

// ==================================================================
// --- 💎 6. "PERFECTED" ULTIMATE EXPLANATION TYPES 💎 ---
// These are our new "Master Plan" types, "perfectly" upgraded.
// ==================================================================

/**
 * Defines the 4 types of questions our app supports.
 * "PERFECT" FIX 2: Added 'HowMany' to the union.
 */
export type QuestionType =
  | 'SingleChoice' // 4 options, 1 correct (A, B, C, D)
  | 'StatementBased' // Kept for mapping, maps to 'HowMany'
  | 'HowManyPairs' // Kept for mapping, maps to 'HowMany'
  | 'HowMany' // Our new "perfect" general type for "how many..." questions
  | 'MatchTheList'; // List I vs List II (A-1, B-2, C-3)

/**
 * "Perfected" Pen-Based Hotspot.
 * This "perfectly" matches our new "Master Plan".
 */
export type Hotspot = {
  term: string; // The bracketed [term]
  type: 'green' | 'blue' | 'red'; // Our "Pen-Based" types
  definition: string; // The HTML explanation for the hover-card
};

/**
 * The visual aid (map, diagram)
 */
export type VisualAid = {
  type: 'image' | 'video';
  url: string; // URL to the image/video
  caption?: string;
};

// --- "Perfect" Schema-Specific Analysis Types ---
// We have "scrapped" the old "cramped" CoreAnalysisItem types.

/**
 * "Perfect" Schema for: [SingleChoice]
 */
export type SingleChoiceAnalysis = {
  coreConceptAnalysis: string; // Rich HTML
  optionAnalysis: {
    option: string; // e.g., "(a) Silver Iodide..."
    isCorrect: boolean;
    analysis: string; // Rich HTML
  }[];
};

/**
 * "Perfect" Schema for: [HowMany]
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
 * "Perfect" Schema for: [MatchTheList]
 */
export type MatchTheListAnalysis = {
  correctMatches: {
    itemA: string; // e.g., "List I: Item A"
    correctMatchB: string; // e.g., "List II: Item 3"
    analysis: string; // Rich HTML
  }[];
  conclusion: string; // Rich HTML
};

/**
* The "Perfect" Ultimate Explanation JSON structure.
* This is the "masterpiece" object our "Strict & Robust Parser" will
* validate and our "WYSIWYG Workspace" will edit.
*/
export type UltimateExplanation = {
  howToThink: string; // Rich HTML
  
  // --- "Perfect" Schemas (Only ONE will be present) ---
  singleChoiceAnalysis?: SingleChoiceAnalysis;
  howManyAnalysis?: HowManyAnalysis;
  matchTheListAnalysis?: MatchTheListAnalysis;

  // --- "Perfect" Common Fields ---
  adminProTip: string; // Rich HTML
  takeaway: string; // Rich HTML
  visualAid?: VisualAid | null;
  hotspotBank?: Hotspot[];
};

/**
 * "Perfect" Helper type guard to check if an explanation
 * is our new Ultimate type.
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