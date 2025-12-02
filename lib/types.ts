// lib/types.ts

// ==================================================================
// --- 1. MENTOR'S PEN (The Annotation Layer) ---
// ==================================================================
export interface RedPenFeedback {
    originalText: string;
    comment: string;
}

export interface GreenPenFeedback {
    locationInAnswer: string;
    suggestion: string;
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
// --- 2. THE DYNAMIC RECEIPT (Mark Breakdown) ---
// ==================================================================
export interface Demand {
    topic: string; 
    weightage: number; 
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
// --- 3. THE BLIND SPOT DETECTOR (PESTLE+) ---
// ==================================================================
// [RESTORED] This type is required by your UI components
export type DimensionStatus = 'hit' | 'miss' | 'partial' | 'unused';

export interface BlindSpotDimension {
    name: string; 
    status: DimensionStatus; // [UPDATED] Uses the exported type
    comment: string; 
}

export interface BlindSpotAnalysis {
    dimensions: BlindSpotDimension[];
    overallVerdict: string; 
}

// ==================================================================
// --- 4. THE COACH'S BLUEPRINT (Skeleton View) ---
// ==================================================================
export interface CoachBlueprint {
    introduction: {
        critique: string; 
        strategy: string; 
        content: string;  
    };
    body: {
        critique: string; 
        coreArgument: string; 
        keyPoints: string[];  
    };
    conclusion: {
        critique: string; 
        strategy: string; 
        content: string; 
    };
}

// ==================================================================
// --- 5. VALUE ADDS (Language & Flashcards) ---
// ==================================================================
export interface VocabularySwap {
    original: string;    
    replacement: string; 
}

export interface TopperArsenalItem {
    type: 'data' | 'committee' | 'quote' | 'phrase' | 'judgment';
    content: string; 
    source?: string; 
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

export interface OverallFeedback {
    // [UPDATED] Replaced 'generalAssessment' with high-impact fields
    headline: string;      
    description: string;   
    parameters: {
        structure: { score: number; suggestion: string };
        content: { score: number; suggestion: string };
        presentation: { score: number; suggestion: string };
    };
}

// ==================================================================
// --- 7. THE ACTION PLAN (Directives) ---
// ==================================================================
export interface ActionPlan {
    read: string;    
    rewrite: string; 
}

// ==================================================================
// --- 8. MASTER QUESTION ANALYSIS (The Core Object) ---
// ==================================================================
export interface QuestionAnalysis {
    // Identity & User Content
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    score: number;
    scoreBreakdown: ScoreBreakdown; 
    
    subject: string;

    // Analysis Layers
    questionDeconstruction: QuestionDeconstruction; 
    blindSpotAnalysis: BlindSpotAnalysis;           
    coachBlueprint: CoachBlueprint;                 
    mentorsPen: MentorsPenData;                     
    
    // [NEW] The Action Plan
    actionPlan: ActionPlan;

    // Feedback & Action Plan
    overallFeedback: OverallFeedback;               

    // Value Adds
    vocabularySwap: VocabularySwap[];               
    topperArsenal: TopperArsenalItem[];             
    
    // Legacy/Fallback
    idealAnswer?: string; 
}

// ==================================================================
// --- 9. SYSTEM / APP TYPES ---
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
}

export interface EvaluationCompletePayload {
    analysis: Omit<EvaluationData, 'subject' | 'submittedOn'>;
    preparedData: PreparedQuestion[];
    subject: string;
}