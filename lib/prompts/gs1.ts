// lib/prompts/gs1.ts

interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

/**
 * Generates the master evaluation prompt for the AI, specialized for GS Paper 1.
 * @param preparedData - A structured array of questions and answers.
 * @returns A string containing the full prompt for the AI.
 */
export const getGS1EvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
  const questionsAndAnswersString = preparedData.map(q => 
    `--- QUESTION ${q.questionNumber} (${q.maxMarks} Marks) ---\nQuestion: ${q.questionText}\nAnswer:\n${q.userAnswer}`
  ).join('\n\n');

  const jsonStructure = `{
  "overallScore": "...",
  "totalMarks": "...",
  "overallFeedback": {
    "generalAssessment": "...",
    "scoreDeductionAnalysis": [
      { "pointsDeducted": "...", "reason": "...", "explanation": "..." }
    ]
  },
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "score": "...",
      "detailedAnalysis": { 
        "strengths": ["...", "..."], 
        "improvements": ["...", "..."] 
      },
      "answerFramework": {
        "introduction": "A concise, high-impact model introduction.",
        "body": ["Key heading 1.", "Key heading 2.", "..."],
        "conclusion": "A forward-looking model conclusion."
      },
      "writingStrategyNotes": [
          "A specific, actionable tip on how to structure this answer.",
          "A reminder about a common trap or a way to add extra marks."
      ],
      "topicTags": ["...", "..."]
    }
  ]
}`;

  return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor specializing in **GS Paper 1 (Indian Heritage and Culture, History and Geography of the World and Society)**. Your feedback is brutally honest and strategically brilliant.

    **TASK:** Evaluate the provided answers and provide a strategic guide for each question in a single, valid JSON object.

    **INPUT:**
    ---
    ${questionsAndAnswersString}
    ---

    **EVALUATION INSTRUCTIONS:**

    1.  **BRUTALLY STRICT SCORING (GS1 CONTEXT):**
        * Score harshly. A 3.5/10 is a common score for answers lacking specific historical dates, geographical examples, or sociological terms.
        * A 5/10 is a decent answer. A score above 6/10 is exceptional and requires justification.

    2.  **ANALYSIS (FOR EACH QUESTION):**
        * **\`detailedAnalysis\`:** Provide sharp, direct strengths and weaknesses.
        * **\`answerFramework\`:** Deconstruct the ideal answer. For History, emphasize chronological flow. For Geography, emphasize diagrams and maps. For Society, emphasize linking concepts to current events.
        * **\`writingStrategyNotes\`:** Provide powerful, meta-level tips specific to GS1, such as, "For this Art & Culture question, you must cite specific architectural terms (e.g., 'amalaka', 'garbhagriha') to show depth."

    3.  **JSON OUTPUT:** Your entire response must be a single, valid JSON object. **Do NOT include \`questionText\`, \`userAnswer\`, \`wordCount\`, or \`maxMarks\` in your JSON output.**

    ${jsonStructure}
  `;
};