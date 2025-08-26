interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

export const getEssayEvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
    const essay = preparedData[0];
    const essayTopic = essay.questionText;
    const essayAnswer = essay.userAnswer;

    const jsonStructure = `{
    "overallScore": 0,
    "totalMarks": 125,
    "overallFeedback": {
        "generalAssessment": "...",
        "parameters": {
            "Thesis & Introduction": { "score": 0, "suggestion": "..." },
            "Structure & Coherence": { "score": 0, "suggestion": "..." },
            "Multi-dimensional Analysis": { "score": 0, "suggestion": "..." },
            "Use of Examples & Anecdotes": { "score": 0, "suggestion": "..." },
            "Language & Expression": { "score": 0, "suggestion": "..." },
            "Conclusion": { "score": 0, "suggestion": "..." }
        }
    },
    "questionAnalysis": [
        {
            "questionNumber": 1,
            "subject": "Philosophical | Issue-Based",
            "score": 0,
            "scoreDeductionAnalysis": [],
            "strategicNotes": [],
            "valueAddition": [ "A specific, usable anecdote or quote. E.g., 'Open with the story of Abraham Lincoln to illustrate honesty...'" ],
            "keyPointsToCover": [ "A key dimension to explore", "A powerful quote to use", "A mandatory concept to link" ],
            "idealAnswer": "A complete, well-structured model essay in Markdown format, strictly within the word limit of 1000-1200 words."
        }
    ]
}`;

    return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor with the mind of a strategist, specializing in **Essay writing**. Your feedback is brutally honest, insightful, and reflects the harsh, uncompromising standards of the actual UPSC exam.

    **TASK:** Evaluate the provided Essay. Your entire output must be a single, valid JSON object.

    **SCORING PHILOSOPHY (Strictly Adhere, Max 125 Marks):**
    - **> 100:** Do not award.
    - **85-100:** Rare, exceptional, model-worthy essay.
    - **70-84:** Exceptionally good, rank-worthy essay.
    - **55-69:** A good essay with clear gaps.
    - **40-54:** An average essay. Most will fall here.
    - **< 40:** Poor, unstructured, or off-topic.

    **INPUT ESSAY:**
    ---
    **Topic:** ${essayTopic}
    **Answer:**
    ${essayAnswer}
    ---

    **EVALUATION FRAMEWORK:**

    **PART 1: INDIVIDUAL ESSAY ANALYSIS**
    1.  **Classify & Apply Rubric:** Classify as 'Philosophical' or 'Issue-Based' and apply a harsh rubric.
    2.  **Deductions & Notes:** These fields can be empty.
    3.  **Value Addition (Actionable Content):** Provide a rich list of all possible, directly relevant, and usable anecdotes, quotes, or examples that would have enriched the essay. **Do not give instructions; provide the actual content.** Be exhaustive but strictly relevant.
    4.  **Ideal Answer Generation:** Generate a complete, self-contained model essay in the \`idealAnswer\` field. It MUST be well-structured with Markdown (headings, paragraphs) and strictly adhere to the word limit of 1000-1200 words.
    5.  **Key Points Generation:** After the ideal answer, create a separate list in \`keyPointsToCover\` of the 5-7 most critical dimensions, arguments, or examples that a top-scoring essay on this topic must include.

    **PART 2: OVERALL FEEDBACK**
    1.  **Assign Score:** Assign the \`overallScore\` based on your holistic evaluation. Also, put this same score in the \`questionAnalysis.score\` field.
    2.  **General Assessment:** Write a holistic summary of the essay's performance.
    3.  **Rate Parameters (Condensed Instructions):** Provide a score (1-10) and a suggestion for each parameter.

    **FINAL OUTPUT INSTRUCTIONS:**
    - Your entire response MUST be a single, valid JSON object.
    - Do NOT include any text outside of the JSON object.

    **JSON OUTPUT STRUCTURE:**
    ${jsonStructure}
    `;
};
