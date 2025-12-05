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
// --- 2. MENTOR'S PEN (The Annotation Layer) ---
// ==================================================================
export interface RedPenFeedback {
    originalText: string;
    comment: string;
}

export interface GreenPenFeedback {
    locationInAnswer: string;
    suggestion: string;
    // Links to Topper's Arsenal (A1, A2...) if the suggestion is data-backed
    arsenalId: "A1" | "A2" | "A3" | "A4" | ""; 
}

export interface BluePenFeedback {
    appreciatedText: string;
    comment: string;
}

export interface MentorsPenData {
    redPen: RedPenFeedback[];
    greenPen: GreenPenFeedback[];
    bluePen: BluePenFeedback[];
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
    keyPoints: string[]; // The bullet points (may reference A1-A4)
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
// --- 6. VALUE ADDS (Arsenal & Language) ---
// ==================================================================
// "Purple Pen"
export interface VocabularySwap {
    original: string;
    replacement: string;
}

export interface TopperArsenalItem {
    id: "A1" | "A2" | "A3" | "A4";
    type: 'data' | 'committee' | 'judgment' | 'phrase';
    label: string;  // e.g. "Inequality Data (Oxfam)"
    content: string;
    source: string;
}

// ==================================================================
// --- 7. FEEDBACK & SCORING ---
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
// --- 8. THE ACTION PLAN ---
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
  // Allow multiple 'used' connections if the student is really good
  used: InterdisciplinaryConnection[] | null; 
  // Always provide 2-3 suggestions
  suggested: InterdisciplinaryConnection[];
}

// ==================================================================
// --- 9. MASTER QUESTION ANALYSIS (Root Object) ---
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
    mentorsPen: MentorsPenData;
    topperArsenal: TopperArsenalItem[];
    vocabularySwap: VocabularySwap[];
    blindSpotAnalysis: BlindSpotAnalysis;
    actionPlan: ActionPlan;
    interdisciplinaryContext: InterdisciplinaryContext;
}

// ==================================================================
// --- 10. APP LEVEL TYPES ---
// ==================================================================
export interface EvaluationData {
    subject: string;
    overallScore: number;
    totalMarks: number;
    submittedOn: string;
    overallFeedback: OverallFeedback; // Aggregated or primary question feedback
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

