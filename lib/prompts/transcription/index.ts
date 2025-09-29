// lib/prompts/transcription/index.ts

import { getGS1TranscriptionPrompt } from './gs1';
import { getGS2TranscriptionPrompt } from './gs2';
import { getGS3TranscriptionPrompt } from './gs3';
import { getGS4TranscriptionPrompt } from './gs4';
import { getEssayTranscriptionPrompt } from './essay';

/**
 * Selects and returns the appropriate subject-specific transcription prompt.
 * @param subject The subject chosen by the user (e.g., 'GS1', 'Essay').
 * @returns A string containing the full, expert-level prompt for the specified subject.
 */
export const getTranscriptionPrompt = (subject: string): string => {
    switch (subject.toLowerCase()) {
        case 'gs1':
            console.log("Using GS1 Transcription Prompt.");
            return getGS1TranscriptionPrompt();
        case 'gs2':
            console.log("Using GS2 Transcription Prompt.");
            return getGS2TranscriptionPrompt();
        case 'gs3':
            console.log("Using GS3 Transcription Prompt.");
            return getGS3TranscriptionPrompt();
        case 'gs4':
            console.log("Using GS4 Transcription Prompt.");
            return getGS4TranscriptionPrompt();
        case 'essay':
            console.log("Using Essay Transcription Prompt.");
            return getEssayTranscriptionPrompt();
        default:
            // Fallback to a robust default if the subject is unknown or not specified.
            // GS1 is a good general-purpose default.
            console.warn(`No specific transcription prompt for subject "${subject}". Using default (GS1).`);
            return getGS1TranscriptionPrompt();
    }
};