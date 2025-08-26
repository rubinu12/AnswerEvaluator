interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

export const getGS2EvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
    const questionsAndAnswersString = preparedData.map(q =>
        `--- QUESTION ${q.questionNumber} (${q.maxMarks} Marks) ---\nQuestion: ${q.questionText}\nAnswer:\n${q.userAnswer}`
    ).join('\n\n');

    const jsonStructure = `{
    "overallScore": 0,
    "totalMarks": 0,
    "overallFeedback": {
        "generalAssessment": "...",
        "parameters": {
            "Structure & Presentation": { "score": 0, "suggestion": "..." },
            "Content Relevance & Accuracy": { "score": 0, "suggestion": "..." },
            "Analytical Depth": { "score": 0, "suggestion": "..." },
            "Use of Keywords & Articles": { "score": 0, "suggestion": "..." },
            "Interlinking Concepts": { "score": 0, "suggestion": "..." },
            "Conclusion & Way Forward": { "score": 0, "suggestion": "..." }
        }
    },
    "questionAnalysis": [
        {
            "questionNumber": 1,
            "subject": "Polity & Constitution | Social Justice & Governance | International Relations",
            "score": 0,
            "scoreDeductionAnalysis": [ { "points": "...", "reason": "..." } ],
            "strategicNotes": [ "..." ],
            "valueAddition": [ "A specific, usable Article, SC judgment, or report name. E.g., 'Cite the Indra Sawhney case (1992) for the 50% reservation ceiling.'" ],
            "keyPointsToCover": [ "A non-negotiable Article", "A critical SC judgment", "A mandatory policy to mention" ],
            "idealAnswer": "A complete, well-structured model answer in Markdown format, strictly within the word limit."
        }
    ]
}`;

    return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor with the mind of a strategist, specializing in **GS Paper 2**. Your feedback is brutally honest, insightful, and reflects the harsh, uncompromising standards of the actual UPSC exam.

    **TASK:** Evaluate the provided GS Paper 2 answers. Your entire output must be a single, valid JSON object.

    **SCORING PHILOSOPHY (Strictly Adhere):**
    - **8-10 Marks:** Do not award.
    - **6-7 Marks:** Rare, exceptional answers.
    - **5-6 Marks:** Exceptionally good, rank-worthy answers.
    - **4-5 Marks:** Good answers with clear gaps.
    - **3-4 Marks:** Average answers. Most will fall here.
    - **0-2 Marks:** Poor answers.

    **INPUT:**
    ---
    ${questionsAndAnswersString}
    ---

    **EVALUATION FRAMEWORK:**

    **PART 1: INDIVIDUAL QUESTION ANALYSIS**
    1.  **Classify & Apply Rubric:** Classify the sub-topic ('Polity & Constitution', 'Social Justice & Governance', or 'International Relations') and apply a harsh rubric.
    2.  **Deductions & Notes:** Provide critical score deductions and strategic notes. deduct marks for if words are below or above the word limit.
    3.  **Value Addition (Actionable Content):** Provide a rich list of all possible, directly relevant, and usable pieces of information (SC judgments, Articles, report names). **Do not give instructions; provide the actual content.** Be exhaustive but strictly relevant.
    4.  **Ideal Answer Generation:** Generate a complete, self-contained model answer in the \`idealAnswer\` field. It MUST be well-structured with Markdown (headings, bullet points) and strictly adhere to the word limit (150 words for 10 marks, 250 for 15 marks).
    5.  **Key Points Generation:** After the ideal answer, create a separate list in \`keyPointsToCover\` of the 5-7 most critical, non-negotiable elements (Articles, judgments, policies) that a top-scoring answer must include.

    **PART 2: OVERALL FEEDBACK**
    1.  **Calculate Scores & General Assessment.**
    2.  **Rate Parameters (Condensed Instructions):** Provide a score (1-10) and a suggestion for each parameter.

    **FINAL OUTPUT INSTRUCTIONS:**
    - Your entire response MUST be a single, valid JSON object.
    - Do NOT include any text outside of the JSON object.

    **JSON OUTPUT STRUCTURE:**
    ${jsonStructure}
    `;
};
