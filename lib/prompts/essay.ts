// lib/prompts/essay.ts

interface PreparedQuestion {
    questionNumber: number;
    questionText: string; // For essays, this will be the topic
    userAnswer: string;
    maxMarks: number;
}

/**
 * Generates the master evaluation prompt for a UPSC Essay.
 * This prompt contains internal logic to classify the essay type (Philosophical vs. Issue-Based)
 * and then apply a specialized evaluation framework.
 * @param preparedData - A structured array containing the single essay.
 * @returns A string containing the full, dynamic prompt for the AI.
 */
export const getEssayEvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
  // Since it's an essay, we expect only one item in the array.
  const essay = preparedData[0];
  const essayTopic = essay.questionText;
  const essayAnswer = essay.userAnswer;

  const jsonStructure = `{
  "essayTopic": "${essayTopic}",
  "essayType": "...", // Should be "Philosophical" or "Issue-Based"
  "overallScore": 0,
  "totalMarks": 125,
  "overallFeedback": {
    "generalAssessment": "A holistic view of the essay's quality, flow, and impact, tailored to its type.",
    "keyStrengths": ["...", "..."],
    "areasForImprovement": ["...", "..."]
  },
  "detailedAnalysis": {
    "introduction": {
      "assessment": "Critique of the introduction's effectiveness (hook, context, thesis statement).",
      "score": 0 // Score out of 15
    },
    "bodyAndStructure": {
      "assessment": "Analysis of the argument flow, coherence, use of evidence/examples, and multi-dimensional analysis.",
      "score": 0 // Score out of 75
    },
    "conclusion": {
      "assessment": "Critique of the conclusion's effectiveness (summary, forward-looking statement).",
      "score": 0 // Score out of 15
    },
    "languageAndExpression": {
      "assessment": "Feedback on grammar, vocabulary, clarity, and style.",
      "score": 0 // Score out of 20
    }
  },
  "modelFramework": {
    "introduction": "A model introduction for this topic.",
    "body": [
      "Key argument/dimension 1 with examples.",
      "Key argument/dimension 2 with examples.",
      "..."
    ],
    "conclusion": "A model conclusion."
  }
}`;

  return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor specializing in **Essay writing**. Your feedback is insightful, strategic, and brutally honest to help the aspirant improve. You must evaluate the essay based on its type: Philosophical or Issue-Based.

    **TASK:**
    1.  **Classify the Essay:** First, determine if the provided essay topic is 'Philosophical' or 'Issue-Based'.
    2.  **Evaluate Based on Type:** Apply the specific evaluation criteria for the classified type.
    3.  **Provide Feedback:** Generate a comprehensive evaluation in a single, valid JSON object.

    **INPUT ESSAY:**
    ---
    **Topic:** ${essayTopic}
    **Answer:**
    ${essayAnswer}
    ---

    **EVALUATION FRAMEWORK:**

    **Step 1: CLASSIFY THE ESSAY TOPIC.**
    - **Philosophical Topics** are abstract, dealing with concepts, ethics, and interpretations (e.g., "The hand that rocks the cradle rules the world").
    - **Issue-Based Topics** are concrete, dealing with socio-economic, political, or technical issues (e.g., "The role of technology in agriculture").
    - Your first task is to decide which category this essay falls into. The rest of your evaluation will depend on this choice.

    **Step 2: APPLY THE CORRECT EVALUATION CRITERIA.**

    **If the essay is PHILOSOPHICAL, evaluate based on:**
    -   **Introduction (15 marks):** How well does it decode the topic, establish a clear thesis, and engage the reader?
    -   **Body & Structure (75 marks):** Assess the depth of interpretation, the coherence of arguments, the use of diverse anecdotes/examples (from history, literature, personal experience), and the logical flow between paragraphs. The structure should be thematic and multi-dimensional.
    -   **Conclusion (15 marks):** Does it synthesize the arguments and provide a powerful, thought-provoking closing statement?
    -   **Language & Expression (20 marks):** Clarity, vocabulary, and eloquence.

    **If the essay is ISSUE-BASED, evaluate based on:**
    -   **Introduction (15 marks):** Does it clearly introduce the issue, provide context (with data if possible), and state the essay's scope?
    -   **Body & Structure (75 marks):** Assess the use of facts, data, reports, and examples. The analysis must be multi-dimensional (social, political, economic, technological, environmental, etc.). Arguments should be well-structured and balanced.
    -   **Conclusion (15 marks):** Does it summarize the key points and offer balanced, forward-looking, and practical solutions?
    -   **Language & Expression (20 marks):** Clarity, precision, and formal tone.

    **Step 3: SCORING (Max 125 Marks).**
    -   Be a strict, critical evaluator.
    -   **< 40:** Poor. Lacks structure and content.
    -   **40-60:** Average. Basic structure but lacks depth or data.
    -   **61-80:** Good. Well-structured with decent content.
    -   **81-100:** Excellent. Shows deep understanding, strong structure, and good data/examples.
    -   **> 100:** Exceptional. Reserved for truly outstanding essays.
    -   The final "overallScore" must be the sum of the scores from the "detailedAnalysis" sections.

    **Step 4: GENERATE JSON OUTPUT.**
    - Your entire response must be a single, valid JSON object.
    - Do NOT include any text or formatting outside of the JSON structure.

    **JSON OUTPUT STRUCTURE:**
    ${jsonStructure}
  `;
};