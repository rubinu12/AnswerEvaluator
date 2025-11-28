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
    topic: string; // e.g., "Context: Definition of NGOs"
    weightage: number; // e.g., 15 (represents 15%)
    status: 'hit' | 'partial' | 'miss';
    mentorComment: string; // Concise feedback: "You missed Article 163."
}

export interface DirectiveAnalysis {
    verb: string; // e.g., "Critically Analyze"
    description: string; // "Requires both pros and cons + judgment"
    fulfillment: 'met' | 'missed'; // Did the user follow the verb?
}

export interface QuestionDeconstruction {
    directive: DirectiveAnalysis;
    demands: Demand[];
    identifiedKeywords: string[]; 
}

// ==================================================================
// --- 3. THE BLIND SPOT DETECTOR (PESTLE+) ---
// ==================================================================
export type DimensionStatus = 'hit' | 'miss' | 'partial' | 'unused';

export type DimensionName = 
    | 'Political' | 'Economic' | 'Societal' | 'Technological' | 'Legal' | 'Environmental' 
    | 'Historical' | 'Cultural' | 'Geographical' | 'Administrative' | 'Ethical' | 'International';

export interface BlindSpotDimension {
    name: DimensionName;
    status: DimensionStatus;
    comment?: string; // "You missed the FCRA Act here."
}

export interface BlindSpotAnalysis {
    dimensions: BlindSpotDimension[];
    overallVerdict: string; // "1 Critical Miss: Legal Dimension"
}

// ==================================================================
// --- 4. THE COACH'S BLUEPRINT (Architect View) ---
// ==================================================================
export interface CoachBlueprint {
    introduction: {
        strategy: string; // e.g. "Define + Quantify"
        content: string;  // Instructions on what to write
    };
    body: {
        coreArgument: string; // e.g. "The Twin-Pillar Approach"
        keyPoints: string[];  // Bullet points of arguments
    };
    conclusion: {
        strategy: string; // e.g. "Way Forward"
        content: string; 
    };
}

// ==================================================================
// --- 5. VALUE ADDS (Language & Flashcards) ---
// ==================================================================
export interface VocabularySwap {
    original: string;    // "Government stopped money"
    replacement: string; // "Regulatory tightening via FCRA"
}

export interface TopperArsenalItem {
    type: 'data' | 'committee' | 'quote' | 'phrase' | 'judgment';
    content: string; // "Only 10% of NGOs file returns."
    source?: string; // "CBI Report"
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
    generalAssessment: string; // Used for "Verdict" card
    parameters: {
        structure: { score: number; suggestion: string };
        content: { score: number; suggestion: string };
        presentation: { score: number; suggestion: string };
    };
}

// ==================================================================
// --- 7. MASTER QUESTION ANALYSIS (The Core Object) ---
// ==================================================================
export interface QuestionAnalysis {
    // Identity & User Content
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    score: number;
    scoreBreakdown: ScoreBreakdown; 
    
    subject: 'History' | 'Culture' | 'Geography' | 'Society' | 'Polity & Constitution' | 'Social Justice & Governance' | 'International Relations' | 'Economy' | 'Environment' | 'Science & Tech' | 'Security' | 'Ethics Theory' | 'Ethics Case Study';

    // Analysis Layers
    questionDeconstruction: QuestionDeconstruction; // Receipt
    blindSpotAnalysis: BlindSpotAnalysis;           // Detector
    coachBlueprint: CoachBlueprint;                 // Architect View
    mentorsPen: MentorsPenData;                     // Annotations
    
    // Feedback & Action Plan
    overallFeedback: OverallFeedback;               // Verdict & Next Steps

    // Value Adds
    vocabularySwap: VocabularySwap[];               
    topperArsenal: TopperArsenalItem[];             
    
    // Legacy/Fallback
    idealAnswer?: string; 
}

// ==================================================================
// --- 8. SYSTEM / APP TYPES ---
// ==================================================================
export interface EvaluationData {
    subject: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay';
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
    wordLimit?: number; // Optional override
    
    // [NEW] Metadata fields from Smart Transcription
    directive?: string; 
    subject?: 'Polity' | 'Governance' | 'Social Justice' | 'IR';
}

export interface EvaluationCompletePayload {
    analysis: Omit<EvaluationData, 'subject' | 'submittedOn'>;
    preparedData: PreparedQuestion[];
    subject: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay';
}