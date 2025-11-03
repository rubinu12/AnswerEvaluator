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
  
  // --- 💎 1. UPGRADE: ADDING NEW FIELDS TO BACKEND TYPE 💎 ---
  // We add our new types here.
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
  
  // --- 💎 2. UPGRADE: MODIFYING EXPLANATION FIELD 💎 ---
  // This will now hold either the old string OR our new object.
  explanation: string | UltimateExplanation;
  
  // --- 💎 3. UPGRADE: ADDING QUESTION TYPE 💎 ---
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
  
  // --- 💎 4. UPGRADE: ADDING ADMIN MODAL STATE 💎 ---
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
  
  // --- 💎 5. UPGRADE: ADDING ADMIN MODAL ACTIONS 💎 ---
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
// --- 💎 6. ADDING NEW "ULTIMATE EXPLANATION" TYPES 💎 ---
// These are all the new types we designed together.
// ==================================================================

// Defines the 4 types of questions our app supports
export type QuestionType =
  | 'SingleChoice' // 4 options, 1 correct (A, B, C, D)
  | 'StatementBased' // 2-4 statements, "How many" (Only 1, Only 2, etc.)
  | 'HowManyPairs' // 3-4 pairs, "How many *pairs* are correct"
  | 'MatchTheList'; // List I vs List II (A-1, B-2, C-3)

// A single hotspot (text or text + image)
export type Hotspot = {
  term: string; // The term that is highlighted
  explanation: string; // The text explanation (can be rich HTML)
  handwrittenNoteUrl?: string; // Optional URL to the admin's handwritten note image
};

// Base for all core analysis items
interface CoreAnalysisItemBase {
  analysis: string; // Rich text (HTML) analysis
  hotspots?: Hotspot[]; // Hotspots *within* this analysis text
}

// Type 1: StatementBased ("How many are correct?")
export interface CoreAnalysisStatement extends CoreAnalysisItemBase {
  statement: string; // The text of the statement (can be rich HTML)
  isCorrect: boolean;
}

// Type 2: SingleChoice ("Congo Basin")
export interface CoreAnalysisOption extends CoreAnalysisItemBase {
  option: string; // e.g., "(a) Cameroon"
  isCorrect: boolean;
}

// Type 3: HowManyPairs ("Ports")
export interface CoreAnalysisPair extends CoreAnalysisItemBase {
  pair: string; // e.g., "1. Kamarajar Port: First major port..."
  isCorrect: boolean;
}

// Type 4: MatchTheList ("Texts & Authors")
export interface CoreAnalysisMatch extends CoreAnalysisItemBase {
  list1_item: string; // e.g., "A. Ashtadhyayi"
  list2_item: string; // e.g., "3. Panini"
  // isCorrect is implied, as we only show correct matches
}

// A discriminated union of all possible analysis types
export type CoreAnalysisItem =
  | CoreAnalysisStatement
  | CoreAnalysisOption
  | CoreAnalysisPair
  | CoreAnalysisMatch;

// The visual aid (map, diagram)
export type VisualAid = {
  type: 'image' | 'video';
  url: string; // URL to the image/video
  caption?: string;
};

// The complete JSON structure for the "Ultimate Explanation"
export type UltimateExplanation = {
  howToThink: string; // Rich HTML
  
  // coreAnalysis is optional to make our parser "robust"
  coreAnalysis?: CoreAnalysisItem[]; 
  
  visualAid?: VisualAid | null;
  adminProTip?: string; // Rich HTML
  takeaway: string; // Rich HTML
};

// Helper type guard to check if an explanation is the new Ultimate type
export const isUltimateExplanation = (
  explanation: string | UltimateExplanation | undefined
): explanation is UltimateExplanation => {
  return (
    typeof explanation === 'object' &&
    explanation !== null &&
    'howToThink' in explanation &&
    // We only check for the bare minimum, as `coreAnalysis` is optional
    'takeaway' in explanation 
  );
};