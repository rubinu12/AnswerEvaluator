// lib/promptGenerator.ts
import { Question, QuestionType } from './quizTypes';

/**
 * ==================================================================
 * --- 💎 THE "DR. TOPPER SINGH" PROMPT PERSONA 💎 ---
 * ==================================================================
 * This is the base template for all prompts.
 * It sets the "Content-First" tone and all our mandatory rules.
 */
const basePromptTemplate = `
You are **Dr. "Topper" Singh**, India's most respected (and witty) UPSC Prelims educator. You are creating the "Ultimate Explanation" for a question on the **Mainsevaluator** platform.

Your goal is to create an explanation so good, it becomes a study note in itself. The content must be **extremely rich, insightful, and make deep connections**. Your explanations are inspired by the handwritten notes of a top-tier mentor—they are personal, opinionated, and full of "pro-tips."

**Question:**
{{QUESTION_TEXT}}

**Options:**
{{QUESTION_OPTIONS}}

---
You will respond with **ONLY** a valid JSON object. Do not include any text before or after the \`{...}\`.

Your JSON **must** adhere to this exact schema and these "Content Quality" rules.

### Content Quality Rules

1.  **\`howToThink\`:** This is the **Topper's Mental Model**. The *first 10 seconds* of thought. It must be a short, expert-level "first-glance" analysis.
    * *Example:* "Okay, this is a map question. The keyword is 'Congo Basin'. I must mentally check which of the four countries overlaps with the Congo River system. Nigeria is Niger, South Sudan is Nile. Cameroon is the only one in the Congo. Done."

2.  **\`coreAnalysis\`:** This is the **Red/Green/Blue Pen Analysis**. This is the *most important part* and **MUST** be an array of objects matching the schema below.
    * You **must** analyze *all* relevant options/statements.
    * For **incorrect** options (❌), you must explain *why* it's wrong and what "future question" it could be.
    * For the **correct** option (✅), you must explain *why* it's right.

3.  **\`adminProTip\`:** This is the **Mentor's Pro-Tip**. This is the *real alpha*. It must be a *deeper insight or hidden theme* that is different from \`howToThink\`.
    * *Example:* "UPSC loves to test river basins. Notice all the distractors are from *different* major basins. This wasn't just a map question; it was a *basin* question. They will do this again with the Danube or Mekong."

4.  **\`takeaway\`:** A simple, bold summary of the final answer.
    * *Example:* "Therefore, Cameroon is the only country listed that is part of the Congo Basin."

### JSON Formatting & Parser Rules

* \`coreAnalysis\` is **MANDATORY** and **MUST** be an array of objects.
* **Rich HTML:** Use HTML tags (\`<strong>\`, \`<em>\`, \`<u>\`) for emphasis.
* **Pen Theme:** You **MUST** use our "Pen" colors.
    * \`<span style="color: red;">...\</span>\` for traps, pitfalls, or incorrect keywords.
    * \`<span style="color: green;">...\</span>\` for the correct answer or key positive terms.
    * \`<span style="color: blue;">...\</span>\` for key terms or names.
* **Deeper Connections (Hotspots):** This is **MANDATORY**. In *all* \`analysis\`, \`howToThink\`, and \`adminProTip\` strings, you **MUST** wrap all key terms, people, places, court cases, and concepts in **square brackets [like this]**. This is critical for our parser.
    * **Good:** "This was part of the [Non-Cooperation Movement]."
    * **Bad:** "This was part of the Non-Cooperation Movement."
* **DO NOT** include a \`visualAid\` field. The admin will upload this manually.

---
### Strict JSON Schema for This Question Type:
{{SCHEMA_DEFINITION}}
`;

/**
 * Helper to format question options for the prompt.
 */
const formatOptions = (question: Question): string => {
  return question.options
    .map((opt) => `${opt.label}. ${opt.text}`)
    .join('\n');
};

/**
 * ==================================================================
 * --- 💎 PROMPT LIBRARY (ONE FOR EACH TYPE) 💎 ---
 * ==================================================================
 */

const getSingleChoiceSchema = (question: Question): string => {
  const optionsPrompt = question.options
    .map(
      (opt) =>
        `    { "option": "${opt.label}. ${opt.text}", "isCorrect": false, "analysis": "...", "hotspots": [] }`
    )
    .join(',\n');
  
  return `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "coreAnalysis": [
${optionsPrompt}
  ],
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string."
}
`;
};

const getStatementBasedSchema = (question: Question): string => {
  // Statements are stored in the "options" array for this type
  const statementsPrompt = question.options
    .map(
      (opt) =>
        `    { "statement": "${opt.text}", "isCorrect": false, "analysis": "...", "hotspots": [] }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "coreAnalysis": [
${statementsPrompt}
  ],
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string."
}
`;
};

const getHowManyPairsSchema = (question: Question): string => {
  // Pairs are stored in the "options" array for this type
  const pairsPrompt = question.options
    .map(
      (opt) =>
        `    { "pair": "${opt.text}", "isCorrect": false, "analysis": "...", "hotspots": [] }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "coreAnalysis": [
${pairsPrompt}
  ],
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string."
}
`;
};

const getMatchTheListSchema = (question: Question): string => {
  // We provide a generic schema as the lists are in the questionText
  const schema = `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "coreAnalysis": [
    { "list1_item": "A. ...", "list2_item": "1. ...", "analysis": "This is a correct match because...", "hotspots": [] },
    { "list1_item": "B. ...", "list2_item": "2. ...", "analysis": "This is a correct match because...", "hotspots": [] },
    { "list1_item": "C. ...", "list2_item": "3. ...", "analysis": "This is a correct match because...", "hotspots": [] }
  ],
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string."
}
`;
  return schema;
};

/**
 * ==================================================================
 * --- 💎 THE MAIN EXPORTED FUNCTION 💎 ---
 * ==================================================================
 * This is what our new Admin Page will call.
 */
export const generateDetailedPrompt = (
  question: Question,
  selectedType: QuestionType
): string => {
  let schemaDefinition = '';
  const questionOptions = formatOptions(question);

  // Use the ADMIN-SELECTED type, not the one from the question object
  switch (selectedType) {
    case 'SingleChoice':
      schemaDefinition = getSingleChoiceSchema(question);
      break;
    case 'StatementBased':
      schemaDefinition = getStatementBasedSchema(question);
      break;
    case 'HowManyPairs':
      schemaDefinition = getHowManyPairsSchema(question);
      break;
    case 'MatchTheList':
      schemaDefinition = getMatchTheListSchema(question);
      break;
    default:
      // Fallback to SingleChoice if type is unknown
      schemaDefinition = getSingleChoiceSchema(question);
  }

  // Inject the specific parts into the base template
  return basePromptTemplate
    .replace('{{QUESTION_TEXT}}', question.text)
    .replace('{{QUESTION_OPTIONS}}', questionOptions)
    .replace('{{SCHEMA_DEFINITION}}', schemaDefinition);
};