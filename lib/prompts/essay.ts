// lib/prompts/essay.ts

interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

/**
 * Generates the master evaluation prompt for a UPSC Essay.
 * This prompt instructs the AI to first classify the essay type (Philosophical or Issue-Based)
 * and then apply a context-specific evaluation framework.
 * @param preparedData - A structured array containing the essay topic and the user's answer.
 * @returns A string containing the full, intelligent prompt for the AI.
 */
export const getEssayEvaluationPrompt = (preparedData: PreparedQuestion[]): string => {
  // Assuming only one essay is evaluated at a time.
  const essay = preparedData[0]; 
  const questionsAndAnswersString = `--- ESSAY TOPIC (${essay.maxMarks} Marks) ---\nTopic: ${essay.questionText}\nAnswer:\n${essay.userAnswer}`;

  const jsonStructure = `{
  "overallScore": "...",
  "totalMarks": "...",
  "essayType": "Philosophical or Issue-Based",
  "overallFeedback": {
    "generalAssessment": "...",
    "criticalErrorAnalysis": {
        "hasCriticalErrors": boolean,
        "penalty": "...",
        "details": ["...", "..."]
    },
    "scoreDeductionAnalysis": [
      { "pointsDeducted": "...", "reason": "...", "explanation": "..." }
    ]
  },
  "detailedAnalysis": { 
    "strengths": ["...", "..."], 
    "improvements": ["...", "..."] 
  },
  "answerFramework": {
    "introduction": "A concise, high-impact model introduction.",
    "body": ["Key heading or thematic argument 1.", "Key heading or thematic argument 2.", "..."],
    "conclusion": "A forward-looking model conclusion."
  },
  "writingStrategyNotes": [
      "A specific, actionable tip on how to structure this essay.",
      "A reminder about a common trap or a way to add extra marks for this specific topic type."
  ],
  "topicTags": ["...", "..."]
}`;

  return `
    **ROLE:** You are an AI impersonating a top-tier UPSC Mentor specializing in **Essay evaluation**. Your feedback is insightful, strategic, and brutally honest, designed to create top-rankers.

    **TASK:** Your primary task is to first **classify the essay topic** and then provide a comprehensive evaluation based on the appropriate framework. Your entire response must be a single, valid JSON object.

    **INPUT:**
    ---
    ${questionsAndAnswersString}
    ---

    **STEP 1: CLASSIFY THE ESSAY TOPIC**
    First, analyze the topic and determine if it is:
    - **A) Philosophical/Abstract:** Based on quotes, ideas, or abstract concepts. Tests interpretation and articulation.
    - **B) Issue-Based/Thematic:** Grounded in concrete socio-economic, political, or technical issues. Tests knowledge and analytical frameworks.
    Set the "essayType" field in the JSON output to your classification.

    **STEP 2: APPLY THE CORRECT EVALUATION FRAMEWORK**

    --- IF PHILOSOPHICAL ---
    * **Focus:** Interpretation, originality, logical flow, and quality of illustrations.
    * **Content (40%):** How well is the core philosophy understood and articulated? Is the thesis original and consistent? Are the examples (from history, literature, life) powerful and relevant?
    * **Structure (30%):** Is the introduction captivating? Does the essay flow logically from one idea to the next? Is the conclusion thought-provoking?
    * **Language (30%):** Is the language lucid and persuasive? Penalize heavily for grammatical or spelling errors that change the meaning of a sentence.

    --- IF ISSUE-BASED ---
    * **Focus:** Multidimensional analysis, factual accuracy, and practical solutions.
    * **Content (40%):** Does the analysis cover the most relevant dimensions (e.g., political, social, economic, ethical) for THIS SPECIFIC TOPIC? Are arguments supported by data, reports, or facts? Are the suggested solutions practical and well-reasoned?
    * **Structure (30%):** Is the introduction contextual? Does the body move from problem analysis to solutions? Is the conclusion optimistic and forward-looking?
    * **Language (30%):** Is the language formal and objective? Penalize heavily for grammatical or spelling errors that change the meaning of a sentence or misrepresent a fact.

    **STEP 3: GENERATE THE JSON OUTPUT**
    - **Scoring:** Be strict. A score above 50% is good; above 60% is exceptional.
    - **Critical Error Analysis:** Identify any grammatical or spelling mistakes that significantly alter the meaning of a sentence. Note them, specify the penalty, and set "hasCriticalErrors" to true if any exist.
    - **Do NOT include \`questionText\` or \`userAnswer\` in your JSON output.** Populate all fields in the structure below.

    ${jsonStructure}
  `;
};