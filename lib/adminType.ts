// lib/adminTypes.ts
// We are ADDING two new types to our existing admin types file.

// This defines the structure for our "Master Topic Tree"
export interface TopicNode {
  id: string; // A unique ID for this topic (e.g., 'gs1', 'modern-history')
  name: string; // The display name (e.g., 'Modern History')
  children: TopicNode[]; // A list of sub-topics (Level 2 or Level 3)
}

// The entire tree is an array of Level 1 nodes (e.g., [GS1, GS2, GS3, GS4])
export type TopicTree = TopicNode[];

// --- NEWLY ADDED TYPES ---

// This represents a question as it is stored in the "questions" collection
// This is based on your original API routes and data structure.
export interface FirestoreQuestion {
  id: string; // The document ID
  questionText: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  // These are the IDs from your topic tree, e.g., "prelim", "prelim-polity"
  subject: string; // This will store the Level 1 ID (e.g., 'prelim')
  topic: string;   // This will store the Level 2 ID (e.g., 'prelim-polity')
  year: number;
  exam?: string;
  examYear?: string;
  type?: 'prelims' | 'mains';
}

// This is a "merged" type we will use on the list page.
// It combines the question with its explanation status.
export interface MergedQuestion extends FirestoreQuestion {
  hasExplanation: boolean;
}