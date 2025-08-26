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
    // UPDATED: Added 'Culture' and split 'Ethics' into 'Ethics Theory' and 'Ethics Case Study'
    // for more precise classification and feedback.
    subject: 'History' | 'Culture' | 'Geography' | 'Society' | 'Polity & Constitution' | 'Social Justice & Governance' | 'International Relations' | 'Economy' | 'Environment' | 'Science & Tech' | 'Security' | 'Ethics Theory' | 'Ethics Case Study';
    valueAddition: string[];
    scoreDeductionAnalysis: {
        points: string;
        reason: string;
    }[];
    strategicNotes: string[];
    idealAnswer: string; // A single string containing the full, formatted model answer
    keyPointsToCover: string[]; // A list of essential points, keywords, and data

}

// Represents the overall feedback for the entire paper
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
    overallFeedback: OverallFeedback;
    questionAnalysis: QuestionAnalysis[];
}