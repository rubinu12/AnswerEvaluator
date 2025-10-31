// lib/quizStore.ts
import { create } from 'zustand';
import {
  QuizStore,
  QuizState,
  Question,
  BackendQuestion,
  UserAnswer,
  QuizFilter
} from './quizTypes'; // We use the types from Step 1
import { auth } from '@/lib/firebase';
// We cannot use the 'useRouter' hook inside the store.
// We will handle navigation inside the components themselves.

// --- Helper: Get Auth Token ---
// We'll need this for API calls
const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { 'Authorization': `Bearer ${token}` };
};

// --- Initial State Definition ---
// This is the default state when the app loads
const initialState: QuizState = {
  // Core Data
  questions: [],
  userAnswers: [],
  
  // Status
  isLoading: true,
  isTestMode: false,
  showReport: false,
  showDetailedSolution: false,
  quizError: null,
  
  // Timer
  timeLeft: 0,
  totalTime: 0,
  
  // UI & Interaction
  currentQuestionNumberInView: 1,
  currentViewAnswer: null,
  isPageScrolled: false,
  isTopBarVisible: true,
  
  // Grouping
  quizTitle: '',
  quizGroupBy: null,
  isGroupingEnabled: false, // Default to false (PYQ style)
  currentGroupInView: null,

  // Review
  bookmarkedQuestions: new Set<string>(),
  markedForReview: new Set<string>(),

  // Notifications
  toast: { show: false, message: '', type: 'info' },
  performanceStats: null,
};

// --- Create the Zustand Store ---
export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  // --- ACTIONS ---

  // --- Initialization ---
  loadAndStartQuiz: async (filter: QuizFilter) => {
    // This is where we will fetch questions from our API
    // We will implement this in a future feature
    console.log("loadAndStartQuiz called with filter:", filter);
    set({ ...initialState, isLoading: true, quizError: null }); // Reset the store
    
    // TEMPORARY: Just to see it working, we'll set loading to false
    // In the next step, we will add the real fetch logic here.
    setTimeout(() => {
       set({ isLoading: false });
       // We'll add a dummy question to test
       const dummyQuestion: Question = {
         id: "123", questionNumber: 1, text: "This is a dummy question. Does the UI connect?",
         options: [
           { label: "A", text: "Yes" },
           { label: "B", text: "No" },
           { label: "C", text: "Maybe" },
           { label: "D", text: "I don't know" }
         ],
         correctAnswer: "A", explanation: "The explanation will go here.",
         subject: "Polity", topic: "Dummy Topic", exam: "UPSC", year: 2024, examYear: "UPSC-2024"
       };
       set({ 
         questions: [dummyQuestion], 
         quizTitle: "Test Quiz", 
         quizGroupBy: 'topic', 
         isGroupingEnabled: false, // PYQ style
         totalTime: 120, // 2 minutes
         timeLeft: 120,
         isLoading: false, // Make sure loading is false
       });
    }, 1500);
  },

  // --- Quiz Lifecycle ---
  startTest: () => {
    // This will run when the "Start Test" button is clicked
    console.log("startTest action called");
    set((state) => ({
      isTestMode: true,
      showReport: false,
      showDetailedSolution: false,
      userAnswers: [],
      markedForReview: new Set<string>(),
      timeLeft: state.totalTime, // Reset timer to the full amount
    }));
  },

  submitTest: () => {
    // This will run when the "Submit Test" button is clicked
    console.log("submitTest action called");
    set({ isTestMode: false, showReport: true });
    // We will add logic to calculate results here
  },
  
  resetTest: () => {
    // This will run when "Back to Dashboard" is clicked
    console.log("resetTest action called");
    set({ ...initialState, isLoading: false }); // Reset to default
    // We will call router.push('/dashboard') from the component
  },

  // --- Answer & Review ---
  handleAnswerSelect: (questionId: string, answer: string) => {
    // This runs when a user clicks an answer (A, B, C, D)
    console.log(`handleAnswerSelect: ${questionId} = ${answer}`);
    set((state) => {
      // Find and replace the answer if it already exists
      const newUserAnswers = state.userAnswers.filter(
        (ua) => ua.questionId !== questionId
      );
      newUserAnswers.push({ questionId, answer });
      
      return { userAnswers: newUserAnswers };
    });
  },

  toggleBookmark: (questionId: string) => {
    console.log(`toggleBookmark: ${questionId}`);
    set((state) => {
      const newBookmarked = new Set(state.bookmarkedQuestions);
      if (newBookmarked.has(questionId)) {
        newBookmarked.delete(questionId);
      } else {
        newBookmarked.add(questionId);
      }
      return { bookmarkedQuestions: newBookmarked };
    });
  },

  toggleMarkForReview: (questionId: string) => {
    console.log(`toggleMarkForReview: ${questionId}`);
    set((state) => {
      const newMarked = new Set(state.markedForReview);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return { markedForReview: newMarked };
    });
  },

  // --- Navigation & UI ---
  handleDetailedSolution: () => {
    console.log("handleDetailedSolution action called");
    set({ showReport: false, showDetailedSolution: true });
  },
  viewAnswer: (questionId: string) => {
    // This is for "Practice Mode" as you described
    console.log(`viewAnswer: ${questionId}`);
    set({ currentViewAnswer: questionId });
  },
  closeAnswerView: () => {
    console.log("closeAnswerView action called");
    set({ currentViewAnswer: null });
  },
  setCurrentQuestionNumberInView: (questionNumber: number) => {
    set({ currentQuestionNumberInView: questionNumber });
  },
  setIsPageScrolled: (isScrolled: boolean) => {
    set({ isPageScrolled: isScrolled });
  },
  setIsTopBarVisible: (isVisible: boolean) => {
    set({ isTopBarVisible: isVisible });
  },
  setCurrentGroupInView: (groupName: string | null) => {
    set({ currentGroupInView: groupName });
  },
  setIsGroupingEnabled: (isEnabled: boolean) => {
    set({ isGroupingEnabled: isEnabled });
  },

  // --- Timer ---
  setTimeLeft: (timeLeft: number) => {
    set({ timeLeft });
  },

  // --- Notifications ---
  showToast: (message: string, type: 'info' | 'warning' = 'info') => {
    set({ toast: { show: true, message, type } });
  },
  hideToast: () => {
    set({ toast: { show: false, message: '', type: 'info' } });
  },
}));