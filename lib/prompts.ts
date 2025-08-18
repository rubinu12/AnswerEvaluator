// lib/prompts.ts

/**
 * Generates the master evaluation prompt for the AI.
 * @param questionsAndAnswers - A string containing the cleaned and formatted text of the user's answers.
 * @param subject - The subject of the paper, e.g., "GS Paper 1".
 * @returns A string containing the full prompt to be sent to the generative AI model.
 */
export const getEvaluationPrompt = (questionsAndAnswers: string, subject: string): string => {
  const jsonStructure = `{
  "overallScore": "...",
  "totalMarks": "...",
  "overallFeedback": {
    "contextualCompetence": { "strengths": ["...", "..."], "improvements": ["...", "..."] },
    "contentCompetence": { "strengths": ["...", "..."], "improvements": ["...", "..."] },
    "languageCompetence": { "strengths": ["...", "..."], "improvements": ["...", "..."] },
    "structureCompetence": { "strengths": ["...", "..."], "improvements": ["...", "..."] },
    "conclusionCompetence": { "strengths": ["...", "..."], "improvements": ["...", "..."] }
  },
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "questionText": "...",
      "score": "...",
      "maxMarks": "...",
      "userAnswer": "The full, verbatim text of the user's answer for this specific question, formatted with simple Markdown (** for headings, - for lists).",
      "detailedAnalysis": {
        "strengths": ["...", "..."],
        "improvements": ["...", "..."]
      },
      "keywords": {
        "missed": ["...", "..."],
        "suggestion": "..."
      },
      "topicTags": ["...", "..."]
    }
  ]
}`;

  return `
    **ROLE:** You are an expert evaluator for the UPSC (Union Public Service Commission) Mains examination in India. Your analysis is sharp, insightful, and constructive. You have a deep understanding of the subject matter, the nuances of the exam, and the expectations of examiners.

    **TASK:** Evaluate the provided answer sheet for the subject: **${subject}**. You must analyze each question and answer, provide an overall assessment, and return your complete evaluation in a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON object itself.

    **INPUT:** The following text contains the questions and the user's handwritten answers, which have been cleaned by a previous AI step.
    ---
    ${questionsAndAnswers}
    ---

    **EVALUATION CRITERIA & INSTRUCTIONS:**

    1.  **SCORING:**
        * Assign a score to each question based on its quality. Be strict and adhere to UPSC standards. A 4/10 is an average answer. A 6/10 is a very good answer. Scores above 7/10 are rare.
        * Calculate the total score and total maximum marks based on the questions present.

    2.  **OVERALL FEEDBACK:** Analyze the entire answer sheet and provide feedback on five key competencies. For each, list 1-2 distinct points for strengths and 1-2 for areas of improvement.
        * **Contextual Competence:** Did the aspirant understand the core demand of each question?
        * **Content Competence:** Was the content relevant, accurate, and supported by specific examples?
        * **Language Competence:** Was the language clear, concise, and free of errors?
        * **Structured Presentation Competence:** Were the answers well-structured with logical flow, headings, and diagrams?
        * **Conclusion Competence:** Did the conclusions effectively summarize and provide a forward-looking perspective?

    3.  **DETAILED QUESTION ANALYSIS (for each question):**
        * **Identify the Question:** Accurately extract the full text of the question.
        * **Capture User's Answer:** For the 'userAnswer' field, you MUST include the full, verbatim text of the user's answer for that specific question, extracted directly from the provided input text. You MUST also format this text using simple Markdown: use double asterisks for headings (e.g., **Necessity:**) and hyphens for bullet points (e.g., - To cleanse the electoral roll...). Ensure proper line breaks are preserved. Do not summarize it.
        * **Detailed Analysis:** Provide 2-3 specific, bullet-point strengths and 2-3 actionable areas for improvement. Be specific (e.g., instead of "more examples needed," suggest *what kind* of examples).
        * **Keywords & Examples:**
            * Identify 3-4 crucial keywords or specific concepts the user missed.
            * Provide one "Mindblowing Example"—a specific, less-common example or a deeper insight the user could have included to make their answer stand out.
        * **Topic Tagging:** Generate an array of 5-7 descriptive topic tags covering the subject, historical period, key figures, and themes for our vector search feature.

    4.  **JSON OUTPUT FORMAT:** You must structure your entire response as a single, valid JSON object. Do not deviate from this format.

    ${jsonStructure}
  `;
};