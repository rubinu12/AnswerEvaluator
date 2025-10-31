// Defines the structure for a single answer option in a multiple-choice question.
export interface Option {
  text: string;
  isCorrect: boolean;
}

// Defines the structure for a single quiz question.
// This will be the shape of the documents in our 'questions' collection in Firestore.
export interface Question {
  id?: string; // The document ID from Firestore (optional because it's not present on new questions)
  questionText: string;
  options: Option[];
  subject: string;
  topic: string;
  year: number;
  type: 'prelims' | 'mains' | 'csat'; // To distinguish between different exam types
}

// Defines the structure for a user's answer during a quiz.
export interface UserAnswer {
  questionId: string;
  selectedOption: number; // The index of the selected option
  isCorrect: boolean;
  timeTaken: number; // Time spent on this specific question
}

// Defines the structure for the final result of a quiz attempt.
// This will be stored in a sub-collection under the user's profile.
export interface TestResult {
  id?: string; // The document ID from Firestore
  userId: string;
  date: number; // Using a timestamp for easy sorting
  score: number;
  totalQuestions: number;
  timeTaken: number; // Total time for the quiz in seconds
  answers: UserAnswer[]; // An array of all the user's answers
  
  // Store the context of the quiz for easier display in user's history
  quizType: string; // e.g., 'prelims'
  quizFilter: string; // e.g., 'year'
  quizValue: string; // e.g., '2023'
}