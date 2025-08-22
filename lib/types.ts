// lib/types.ts

// Represents a single segment in the "Constructed Answer"
export interface ConstructedAnswerSegment {
    type: 'user' | 'ai';
    text: string;
}

// Represents the analysis for a single question or essay
export interface QuestionAnalysis {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
    score: number;
    valueAddition: string[];
    scoreDeductionAnalysis: {
        points: string;
        reason: string;
    }[];
    strategicNotes: string[];
    constructedAnswer: ConstructedAnswerSegment[];
}

// Represents the overall feedback for the entire paper
export interface OverallFeedback {
    generalAssessment: string;
    parameters: {
        [key: string]: number; // e.g., { "Structure": 3, "Content Depth": 4, ... }
    };
}

// Represents the entire evaluation data object that the page will use
export interface EvaluationData {
    subject: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay';
    overallScore: number;
    totalMarks: number;
    submittedOn: string;
    overallFeedback: OverallFeedback;
    questionAnalysis: QuestionAnalysis[];
}