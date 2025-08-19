// lib/prompts/index.ts

import { getGS1EvaluationPrompt } from './gs1';
import { getGS2EvaluationPrompt } from './gs2';
import { getGS3EvaluationPrompt } from './gs3';
import { getGS4EvaluationPrompt } from './gs4';
import { getEssayEvaluationPrompt } from './essay';

interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

export const getPromptForSubject = (subject: string, preparedData: PreparedQuestion[]): string => {
    switch (subject) {
        case 'GS1':
            return getGS1EvaluationPrompt(preparedData);
        case 'GS2':
            return getGS2EvaluationPrompt(preparedData);
        case 'GS3':
            return getGS3EvaluationPrompt(preparedData);
        case 'GS4':
            return getGS4EvaluationPrompt(preparedData);
        case 'Essay':
            return getEssayEvaluationPrompt(preparedData);
        default:
            console.warn(`No specific prompt for subject "${subject}", falling back to GS1.`);
            return getGS1EvaluationPrompt(preparedData);
    }
};