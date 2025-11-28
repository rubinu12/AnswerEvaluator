import { PreparedQuestion } from '@/lib/types';
import { getGS1EvaluationPrompt } from './gs1';
import { generateGS2Prompt } from './gs2'; // [UPDATED] Importing the new engine
import { getGS3EvaluationPrompt } from './gs3';
import { getGS4EvaluationPrompt } from './gs4';
import { getEssayEvaluationPrompt } from './essay';

/**
 * Selects and returns the appropriate subject-specific evaluation prompt.
 * @param subject The subject chosen by the user (e.g., 'GS1', 'Essay').
 * @param preparedData The array of questions and user answers.
 * @returns A string containing the full, expert-level prompt for the specified subject.
 */
export const getPromptForSubject = (
  subject: string, 
  preparedData: PreparedQuestion[]
): string => {
    
    // Helper to get the first question safely
    const currentQuestion = preparedData[0];

    switch (subject.toUpperCase()) {
        case 'GS1':
            console.log("Using GS1 Evaluation Prompt.");
            return getGS1EvaluationPrompt(preparedData);
            
        case 'GS2':
            console.log("Using GS2 Evaluation Prompt.");
            
            // [UPDATED Logic]
            // We extract metadata from the transcription (if available) or use defaults
            const directive = currentQuestion.directive || 'analyze';
            const subSubject = currentQuestion.subject || 'default'; // e.g., 'Governance'
            const topic = 'General'; // Placeholder until Topic Tree integration

            // Call the new Prompt Engine with specific arguments
            return generateGS2Prompt(
                currentQuestion, 
                directive, 
                subSubject, 
                topic
            );

        case 'GS3':
            console.log("Using GS3 Evaluation Prompt.");
            return getGS3EvaluationPrompt(preparedData);
            
        case 'GS4':
            console.log("Using GS4 Evaluation Prompt.");
            return getGS4EvaluationPrompt(preparedData);
            
        case 'ESSAY':
            console.log("Using Essay Evaluation Prompt.");
            return getEssayEvaluationPrompt(preparedData);
            
        default:
            console.warn(`No specific evaluation prompt for subject "${subject}". Using default (GS1).`);
            return getGS1EvaluationPrompt(preparedData);
    }
};