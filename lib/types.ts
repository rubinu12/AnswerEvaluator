// lib/types.ts

// ==================================================================
// --- 1. META & TOPIC TREE (The Header) ---
// ==================================================================
export interface TopicTree {
    mainTopic: string;
    subTopics: string[];
}

export interface MetaData {
    wordCount: number;
    wordLimit: number;
    overLimit: boolean;
    directiveLabel: string;
    topicTree: TopicTree;
}

// ==================================================================
// --- 2. THE 4 PILLARS OF EVALUATION (Replaces Old Mentor's Pen) ---
// ==================================================================

// 🟣 PURPLE PEN: Administrative Compression (Language)
// Role: Replace wordy/layman phrases with technical administrative terms.
export interface VocabularySwap {
    original: string;
    replacement: string;
}

// 🔴 RED PEN: Logic & Accuracy Filter (Logic Checks)
// Role: Catch contradictions, factual errors, and logical gaps.
export interface LogicCheck {
    originalText: string;     // The problematic text
    critique: string;         // Explanation of why it is wrong/weak
    severity: 'critical' | 'structural'; // 'critical' = factual error/contradiction. 'structural' = weak argument/vague.
    tag: 'factually_incorrect' | 'contradiction' | 'demand_miss' | 'vague' | 'irrelevant'; // For categorization
}

// 🟢 GREEN PEN: Value Injection (Content Injections)
// Role: Inject specific Data, Cases, Articles, or Committees.
export interface ContentInjection {
    locationInAnswer: string; // The text to hook onto (e.g., "poverty levels")
    injectionContent: string; // The content to add: "Insert: NITI Aayog MPI Report (11%)..."
    type: 'data' | 'case' | 'committee' | 'law' | 'scholar' | 'example'; // For database/icons
    source?: string;          // Optional: "NITI Aayog", "Puttaswamy Judgment"
}

// 🔵 BLUE PEN: Strategic Praise (Reinforcement)
// Role: Highlight strong analysis or good interlinking.
export interface StrategicPraise {
    appreciatedText: string;
    comment: string;          // "Good interlinking of Article 21 with Environmental norms."
}

// ==================================================================
// --- 3. THE DEMAND MAP (Marks & Verdict) ---
// ==================================================================
export interface Demand {
    topic: string;
    weightage: number; // percentage (0-100)
    status: 'hit' | 'partial' | 'miss';
    mentorComment: string;
}

export interface DirectiveAnalysis {
    verb: string;
    description: string;
    fulfillment: 'met' | 'missed';
}

export interface QuestionDeconstruction {
    directive: DirectiveAnalysis;
    demands: Demand[];
    identifiedKeywords: string[];
}

// ==================================================================
// --- 4. THE BLIND SPOT DETECTOR ---
// ==================================================================
export interface BlindSpotDimension {
    name: string;
    status: 'miss'; // Blind spots are always 'missed' dimensions
    comment: string;
}

export interface BlindSpotAnalysis {
    dimensions: BlindSpotDimension[];
    overallVerdict: string;
}

// ==================================================================
// --- 5. THE COACH'S BLUEPRINT (Architectural View) ---
// ==================================================================
export interface BlueprintSectionIntro {
    critique: string;
    strategy: string;
    content: string; // The model introduction text
}

export interface BlueprintSectionBody {
    critique: string;
    coreArgument: string;
    keyPoints: string[]; // The bullet points
}

export interface BlueprintSectionConclusion {
    critique: string;
    strategy: string;
    content: string; // The model conclusion text
}

export interface CoachBlueprint {
    introduction: BlueprintSectionIntro;
    body: BlueprintSectionBody;
    conclusion: BlueprintSectionConclusion;
}

// ==================================================================
// --- 6. FEEDBACK & SCORING ---
// ==================================================================
export interface ScoreBreakdown {
    intro: number;
    body: number;
    conclusion: number;
    total: number;
}

export interface FeedbackParameter {
    score: number; // 1-10
    suggestion: string;
}

export interface OverallFeedbackParameters {
    structure: FeedbackParameter;
    content: FeedbackParameter;
    presentation: FeedbackParameter;
}

export interface OverallFeedback {
    headline: string;
    description: string;
    parameters: OverallFeedbackParameters;
}

// ==================================================================
// --- 7. THE ACTION PLAN ---
// ==================================================================
export interface ActionPlan {
    read: string;
    rewrite: string;
}

export interface InterdisciplinaryConnection {
  paper: string;   // e.g. "GS3" or "GS4"
  topic: string;   // e.g. "Environment" or "Public Ethics"
  content: string; // e.g. "Link federalism to forest rights..."
}

export interface InterdisciplinaryContext {
  summary: string; // "Strong economic focus; missed ethical angle."
  tag: string;     // "Polity + Economy"
  used: InterdisciplinaryConnection[] | null; 
  suggested: InterdisciplinaryConnection[];
}

// ==================================================================
// --- 8. MASTER QUESTION ANALYSIS (Root Object) ---
// ==================================================================
export interface QuestionAnalysis {
    // 1. Meta Data (Header)
    meta: MetaData;

    // 2. Identity & Inputs (Provided by App, not AI)
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    subject: string;
    
    // 3. Scoring
    score: number;
    scoreBreakdown: ScoreBreakdown;

    // 4. Core AI Analysis Layers
    questionDeconstruction: QuestionDeconstruction;
    overallFeedback: OverallFeedback;
    coachBlueprint: CoachBlueprint;
    
    // --- THE 4 PILLARS (REFACTORED) ---
    vocabularySwaps: VocabularySwap[];    // Purple
    logicChecks: LogicCheck[];            // Red
    contentInjections: ContentInjection[];// Green
    strategicPraise: StrategicPraise[];   // Blue
    
    // --- REMOVED OLD FIELDS ---
    // mentorsPen: MentorsPenData; (Deleted)
    // topperArsenal: TopperArsenalItem[]; (Deleted)

    blindSpotAnalysis: BlindSpotAnalysis;
    actionPlan: ActionPlan;
    interdisciplinaryContext: InterdisciplinaryContext;
}

// ==================================================================
// --- 9. APP LEVEL TYPES ---
// ==================================================================
export interface EvaluationData {
    subject: string;
    overallScore: number;
    totalMarks: number;
    submittedOn: string;
    overallFeedback: OverallFeedback; 
    questionAnalysis: QuestionAnalysis[];
}

export interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    wordLimit?: number;
    directive?: string;
    subject?: string;
    topic?: string;
}

export interface EvaluationCompletePayload {
    analysis: Omit<EvaluationData, 'subject' | 'submittedOn'>;
    preparedData: PreparedQuestion[];
    subject: string;
}