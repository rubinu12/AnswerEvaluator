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
  
  // --- 💎 MODIFIED 💎 ---
  // This still points to "UltimateExplanation" but that type's
  // *contents* will be our new soulful model.
  explanation?: string | UltimateExplanation; 

  // --- 💎 ADDED 💎 ---
  // As requested, for your handwritten notes.
  handwrittenNoteUrl?: string;
};

// The transformed Question format our app will use
export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  
  // --- 💎 MODIFIED 💎 ---
  // This still points to "UltimateExplanation". No broken imports.
  explanation: string | UltimateExplanation;
  
  questionType: QuestionType; 

  year?: number;
  subject?: string;
  topic?: string;
  exam?: string;
  examYear?: string;

  // --- 💎 ADDED 💎 ---
  // As requested, for your handwritten notes.
  handwrittenNoteUrl?: string;
}

// Represents a user's selected answer
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

// --- Zustand Store Types (Unchanged) ---
// Your store and actions already use "UltimateExplanation" by name,
// so they will automatically work with the new structure.

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

  // --- 💎 MODAL SHEET LOGIC (AS DISCUSSED) 💎 ---
  explanationModalQuestionId: string | null; // <-- NEW
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
  
  // This function now correctly expects the *new* structure
  // of UltimateExplanation, without breaking its name.
  updateQuestionExplanation: (
    questionId: string,
    newExplanation: UltimateExplanation 
  ) => void;

  // --- 💎 MODAL SHEET LOGIC (AS DISCUSSED) 💎 ---
  openExplanationModal: (questionId: string) => void; // <-- NEW
  closeExplanationModal: () => void; // <-- NEW
}

export type QuizStore = QuizState & QuizActions;

// ==================================================================
// --- 💎 "PERFECTED" ULTIMATE EXPLANATION TYPES (SURGICALLY MODIFIED) 💎 ---
// ==================================================================

/**
 * Question Types (Unchanged from your file)
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
 * We'll make this optional in the main type for now to prevent crashes.
 */
export type VisualAid = {
  type: 'image' | 'video';
  url: string;
  caption?: string;
};

// --- "Perfect" Schema-Specific Analysis Types ---
//
// --- 💎 DELETED 💎 ---
// All 5 of the old, "soulless" types are GONE:
// - SingleChoiceAnalysis
// - HowManyAnalysis
// - MatchTheListAnalysis
// - MultiSelectAnalysis
// - StatementAnalysis
//
// ==================================================================


/**
* The "Perfect" Ultimate Explanation JSON structure.
* --- 💎 SURGICALLY MODIFIED 💎 ---
*
* We KEEP THE NAME "UltimateExplanation" to prevent app-wide crashes.
* We GUT THE CONTENTS and replace them with our new "soulful" schema.
*
*/
export type UltimateExplanation = {
  // --- 💎 NEW "SOULFUL" SCHEMA 💎 ---
  howToThink: string;    // Rich HTML ("🧠 Initial Thoughts")
  coreAnalysis: string;  // Rich HTML ("🎯 Core Analysis / Mental Model")
  adminProTip: string;   // Rich HTML ("✍️ Mentor's Pro-Tip")
  hotspotBank: Hotspot[];

  // --- 💎 KEPT FOR STABILITY 💎 ---
  // Kept your old fields as *optional* to prevent the app from
  // crashing in places we haven't refactored yet.
  // The new prompt won't generate these, but old data won't break.
  takeaway?: string; 
  visualAid?: VisualAid | null;
};

/**
 * "Perfect" Helper type guard.
 * --- 💎 MODIFIED 💎 ---
 * We KEEP THE NAME but change the LOGIC to check for our new keys.
 */
export const isUltimateExplanation = (
  explanation: string | UltimateExplanation | undefined
): explanation is UltimateExplanation => {
  return (
    typeof explanation === 'object' &&
    explanation !== null &&
    'howToThink' in explanation &&
    'coreAnalysis' in explanation && // <-- Checks for the new "soul"
    'adminProTip' in explanation
  );
};