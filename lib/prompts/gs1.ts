// lib/prompts/gs1.ts

interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

export const getGS1EvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
  const questionsAndAnswersString = preparedData.map(q => 
    `--- QUESTION ${q.questionNumber} (${q.maxMarks} Marks) ---\nQuestion: ${q.questionText}\nAnswer:\n${q.userAnswer}`
  ).join('\n\n');

  const jsonStructure = `{
  "overallScore": 0,
  "totalMarks": 0,
  "overallFeedback": {
    "generalAssessment": "A holistic summary of the user's performance across all answers.",
    "parameters": { 
        "Structure": 0, 
        "Content Depth": 0, 
        "Clarity": 0, 
        "Use of Examples": 0, 
        "Keyword Usage": 0, 
        "Time Management": 0, 
        "Overall Coherence": 0 
    }
  },
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "score": 0,
      "scoreDeductionAnalysis": [
          { "points": "...", "reason": "..." }
      ],
      "strategicNotes": [
          "A specific, actionable tip on how to structure this answer.",
          "A reminder about a common trap or a way to add extra marks."
      ],
      "valueAddition": [
          "A key statistic, report name, or specific example the user could have added to increase their score."
      ],
      "constructedAnswer": [
          { "type": "user", "text": "A good segment from the user's original answer." },
          { "type": "ai", "text": "An improved or new segment written by the AI to fill gaps or add depth." }
      ]
    }
  ]
}`;

  return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor specializing in **GS Paper 1 (Indian Heritage and Culture, History and Geography of the World and Society)**. Your feedback is brutally honest, insightful, and strategically brilliant.

    **TASK:** Evaluate the provided answers by first classifying each question's sub-topic. Then, provide a detailed, structured analysis for each question and a holistic overall assessment. Your entire output must be a single, valid JSON object.

    **INPUT:**
    ---
    ${questionsAndAnswersString}
    ---

    **EVALUATION FRAMEWORK:**

    **PART 1: INDIVIDUAL QUESTION ANALYSIS (Loop for each question)**
    For each question provided, perform the following steps:
    1.  **Classify the Sub-Topic:** First, determine if the question belongs to 'History', 'Geography', or 'Society'.
    2.  **Apply a Specialized Rubric based on the classification:**
        * If **History**: Score harshly for lack of specific dates, key figures, and chronological flow. The analysis should focus on historical context and accuracy.
        * If **Geography**: Score harshly for lack of geographical terms, concepts, and relevant diagrams (even if not present, suggest them). Focus on physical and human geography linkages.
        * If **Society**: Score harshly for lack of sociological terms, linkage to current events, data from reports (like NFHS, NCRB), and mention of relevant social issues.
    3.  **Score Deduction Analysis:** Provide the top 2-3 most critical reasons for score loss, quantifying the marks lost for each.
    4.  **Strategic Notes:** Give 2-3 powerful, actionable tips specific to this type of question.
    5.  **Value Addition:** Suggest 1-2 concrete pieces of information (like a specific report, a relevant quote, or a key statistic) that would have significantly improved the answer.
    6.  **Constructed Answer:** Create a new, ideal answer. You MUST integrate the best parts of the user's original answer (tag them with type: "user") and seamlessly weave in your own improved text to fill gaps, add data, and improve structure (tag them with type: "ai").

    **PART 2: OVERALL FEEDBACK (After analyzing all questions)**
    1.  **Calculate Scores:** Sum the individual scores to get the \`overallScore\` and sum the max marks for \`totalMarks\`.
    2.  **General Assessment:** Write a holistic summary of the user's performance, identifying recurring patterns of strengths and weaknesses across all answers.
    3.  **Rate Parameters:** Rate the user on a scale of 1-10 for each of the 7 parameters based on their performance across all answers.

    **FINAL OUTPUT INSTRUCTIONS:**
    - Your entire response MUST be a single, valid JSON object.
    - Do NOT include \`questionText\`, \`userAnswer\`, or \`detailedAnalysis\` (strengths/improvements) in your final JSON. The new structure replaces it.
    - Ensure all fields in the provided JSON structure are filled.

    **JSON OUTPUT STRUCTURE:**
    ${jsonStructure}
  `;
};