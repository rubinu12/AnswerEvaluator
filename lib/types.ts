// lib/types.ts

// --- "Mentor's Pen" Types ---
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
    bluePen: BluePenFeedback[]; // General positive feedback comments
}

// --- New "AI Mentor" Analysis Types ---
export interface QuestionDeconstruction {
    coreDemands: {
        demand: string;
        userFulfillment: 'Fully Addressed' | 'Partially Addressed' | 'Not Addressed';
        mentorComment: string;
    }[];
    identifiedKeywords: string[];
}

export interface StructuralAnalysis {
    introduction: string;
    body: string;
    conclusion: string;
}

export interface StrategicDebrief {
    modelAnswerStructure: string;
    contentGaps: string[];
    toppersKeywords: string[];
    mentorsFinalVerdict: string;
}

// Represents the NEW, DETAILED analysis for a single question
export interface QuestionAnalysis {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    score: number;
    subject: 'History' | 'Culture' | 'Geography' | 'Society' | 'Polity & Constitution' | 'Social Justice & Governance' | 'International Relations' | 'Economy' | 'Environment' | 'Science & Tech' | 'Security' | 'Ethics Theory' | 'Ethics Case Study';
    
    questionDeconstruction: QuestionDeconstruction;
    structuralAnalysis: StructuralAnalysis;
    mentorsPen: MentorsPenData;
    strategicDebrief: StrategicDebrief;
    idealAnswer: string;
}

// Represents the overall feedback for the entire paper (RE-INTRODUCED)
export interface OverallFeedback {
    generalAssessment: string;
    parameters: {
        [key: string]: {
            score: number;
            suggestion: string;
        };
    };
}

// Represents the entire evaluation data object that the page will use
export interface EvaluationData {
    subject: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay';
    overallScore: number;
    totalMarks: number;
    submittedOn: string;
    overallFeedback: OverallFeedback; // It's back
    questionAnalysis: QuestionAnalysis[];
}

// Represents the data extracted before sending for full evaluation
export interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

// Represents the payload received from the server upon evaluation completion
export interface EvaluationCompletePayload {
    analysis: Omit<EvaluationData, 'subject' | 'submittedOn'>;
    preparedData: PreparedQuestion[];
    subject: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay';
}