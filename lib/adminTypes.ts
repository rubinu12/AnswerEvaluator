// lib/adminTypes.ts
// This file holds types specific to the admin panel.

// --- EXISTING TYPES ---

// This defines the structure for our "Master Topic Tree"
export interface TopicNode {
  id: string; // A unique ID for this topic (e.g., 'gs1', 'modern-history')
  name: string; // The display name (e.g., 'Modern History')
  children: TopicNode[]; // A list of sub-topics (Level 2 or Level 3)
}

// The entire tree is an array of Level 1 nodes (e.g., [GS1, GS2, GS3, GS4])
export type TopicTree = TopicNode[];

// This defines one option in a multiple-choice question
export interface Option {
  text: string;
  isCorrect: boolean;
}

// --- UPDATED TYPES (FIXED) ---

// This defines the core data structure in the 'questions' collection
export interface FirestoreQuestion {
  id: string; // The document ID
  questionText: string;
  options: Option[];
  subject: string; // The L1 topic ID (e.g., 'prelim')
  topic: string; // The L2 topic ID (e.g., 'polity')
  
  // --- NEW AND CORRECTED FIELDS ---
  exam: string;  // e.g., "UPSC CSE", "UPPSC"
  year: number;  // e.g., 2023
  type: 'prelims'; // This is *only* for the prelims engine. This is now fixed.
  // --- END ---
  
  // Optional fields from our "Bulk Add" parser
  questionType?: string; // e.g., 'Statement-Based'
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  paperQuestionNumber?: number; // e.g., 12
}

// This is the "in-memory" type for the admin panel,
// merging question data with its explanation status.
export type MergedQuestion = FirestoreQuestion & {
  hasExplanation: boolean;
};