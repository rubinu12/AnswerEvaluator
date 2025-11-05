import { Question, QuestionType } from './quizTypes';

/**
 * ==================================================================
 * --- 💎 THE "DR. TOPPER SINGH" PROMPT PERSONA 💎 ---
 * ==================================================================
 * This is the base template for all prompts.
 * It sets the "Content-First" tone and all our mandatory rules.
 * It has been UPDATED to remove references to the old 'coreAnalysis'.
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
    * *Example:* "Okay, this is a map question. The keyword is '[Equator]'. I must mentally check which of the three water bodies it crosses. I know [Lake Victoria] is on it, but [Lake Tanganyika] is south... this looks like a 'none' question. Done."

2.  **Schema-Specific Analysis:** Depending on the question type, you will provide a "perfect" analysis using fields like \`singleChoiceAnalysis\`, \`howManyAnalysis\`, or \`matchTheListAnalysis\`. This is the **Red/Green/Blue Pen Analysis** and is the *most important part*.

3.  **\`adminProTip\`:** This is the **Mentor's Pro-Tip**. This is the *real alpha*. It must be a *deeper insight or hidden theme* that is different from \`howToThink\` or the main analysis.
    * *Example:* "UPSC loves 'Location vs. Continent' traps. They know you remember the [Equator] passes through [Brazil], so they use [Patos Lagoon] in southern [Brazil] to catch you. Always pinpoint the *exact* location, not just the continent."

4.  **\`takeaway\`:** A simple, bold summary of the final answer.
    * *Example:* "Therefore, the correct answer is D. None."

### JSON Formatting & "Perfect" Parser Rules

* **Rich HTML:** Use HTML tags (\`<strong>\`, \`<em>\`, \`<u>\`) for emphasis.
* **Pen Theme:** You **MUST** use our "Pen" colors in all HTML strings.
    * \`<span style="color: red;">...\</span>\` for traps, pitfalls, or incorrect keywords.
    * \`<span style="color: green;">...\</span>\` for the correct answer or key positive terms.
    * \`<span style="color: blue;">...\</span>\` for key terms or names.

* **"PERFECT" HOTSPOT ARCHITECTURE (MANDATORY):**
    This is our "perfect" two-part system for "Deeper Connections."

    1.  **[Hotspots] in Text:** In *all* HTML strings (\`howToThink\`, \`analysis\`, \`adminProTip\`, etc.), you **MUST** wrap all key terms, people, places, court cases, and concepts in **square brackets [like this]**.
        * **Good:** "This was part of the [Non-Cooperation Movement]."
        * **Bad:** "This was part of the Non-Cooperation Movement."

    2.  **\`hotspotBank\` (MANDATORY):** You **MUST** then provide a "perfect" definition for *every* bracketed hotspot in the \`hotspotBank\` array at the root of the JSON.

    3.  **"Pen-Based" Hotspot Types (MANDATORY):**
        Each object in the \`hotspotBank\` **MUST** have a \`term\`, \`type\`, and \`definition\`.
        * \`"type": "green"\`: **"Deeper Knowledge."** Use this for core "extra info" to build a perfect study note.
        * \`"type": "blue"\`: **"Deeper Connections."** Use this for Current Affairs links or inter-topic linkages (e.g., GS-1 to GS-3).
        * \`"type": "red"\`: **"Deeper Traps."** Use this for "Mentor's Warnings" about common pitfalls, similar-sounding terms, or misconceptions.

    4.  **"NO JARGON" RULE:** You **MUST NOT** create hotspots for basic, obvious terms (e.g., "Equator", "UPSC", "India") unless it is a "perfect" **Red Pen Trap** (e.g., a common misconception about the term).

* **DO NOT** include a \`visualAid\` field. The admin will upload this manually.

---
### Strict JSON Schema for This Question Type:
{{SCHEMA_DEFINITION}}
`;

/**
 * Helper to format question options for the prompt.
 */
const formatOptions = (question: Question): string => {
  if (!question.options || question.options.length === 0) {
    return 'No options provided.';
  }
  return question.options
    .map((opt) => `${opt.label}. ${opt.text}`)
    .join('\n');
};

/**
 * ==================================================================
 * --- 💎 PROMPT LIBRARY (ONE FOR EACH "PERFECT" TYPE) 💎 ---
 * ==================================================================
 */

/**
 * "Perfect" Schema for: [SingleChoice]
 * (e.g., "Artificial rainfall uses...")
 * THIS IS THE FIX. It now generates the correct 'singleChoiceAnalysis' object.
 */
const getSingleChoiceSchema = (question: Question): string => {
  const optionsPrompt = question.options
    .map(
      (opt) =>
        `    { "option": "${opt.label}. ${
          opt.text
        }", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "singleChoiceAnalysis": {
    "coreConceptAnalysis": "A <strong>rich HTML</strong> string explaining the *core concept* of the question *before* analyzing the options. (e.g., 'What is [Cloud Seeding]?').",
    "optionAnalysis": [
  ${optionsPrompt}
    ]
  },
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "..." },
    { "term": "...", "type": "red", "definition": "..." },
    { "term": "...", "type": "blue", "definition": "..." }
  ]
}
`;
};

/**
 * "Perfect" Schema for: [HowMany]
 * (e.g., "...how many of them does the equator pass?")
 */
const getHowManySchema = (question: Question): string => {
  // "options" for this type hold the items/statements/pairs
  const itemsPrompt = question.options
    .map(
      (opt) =>
        `    { "item": "${
          opt.text
        }", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots].",
  "howManyAnalysis": {
    "itemAnalysis": [
  ${itemsPrompt}
    ],
    "conclusion": {
      "countSummary": "A <strong>rich HTML</strong> string summarizing the count. (e.g., 'So, out of the three water bodies, <span style=\\"color: red;\\"><strong>zero (0)</strong></span> pass through the [Equator].')",
      "optionAnalysis": "A <strong>rich HTML</strong> string analyzing the final options. (e.g., 'Based on this: A. Only one: ❌, B. Only two: ❌, D. None: ✅')"
    }
  },
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "..." },
    { "term": "...", "type": "red", "definition": "..." },
    { "term": "...", "type": "blue", "definition": "..." }
  ]
}
`;
};

/**
 * "Perfect" Schema for: [MatchTheList]
 * (e.g., "List I vs List II")
 */
const getMatchTheListSchema = (question: Question): string => {
  const schema = `
{
  "howToThink": "A <strong>rich HTML</strong> string with [hotspots]. (e.g., 'Okay, a Match question. I'll check each item from List I and find its correct match from List II.')",
  "matchTheListAnalysis": {
    "correctMatches": [
      {
        "itemA": "List I: Item A",
        "correctMatchB": "List II: Item 3",
        "analysis": "✅ <span style=\\"color: green;\\">Correctly Matched.</span> A <strong>detailed HTML analysis</strong> of why Item A matches Item 3, full of [hotspots]."
      },
      {
        "itemA": "List I: Item B",
        "correctMatchB": "List II: Item 1",
        "analysis": "✅ <span style=\\"color: green;\\">Correctly Matched.</span> A <strong>detailed HTML analysis</strong> of why Item B matches Item 1, full of [hotspots]."
      },
      {
        "itemA": "List I: Item C",
        "correctMatchB": "List II: Item 2",
        "analysis": "✅ <span style=\\"color: green;\\">Correctly Matched.</span> A <strong>detailed HTML analysis</strong> of why Item C matches Item 2, full of [hotspots]."
      }
    ],
    "conclusion": "A <strong>rich HTML</strong> string summarizing the final code. (e.g., 'Based on our matching, the correct code is A-3, B-1, C-2. Therefore, option (C) is the correct answer.')"
  },
  "adminProTip": "A <strong>rich HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>rich HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "..." },
    { "term": "...", "type": "red", "definition": "..." },
    { "term": "...", "type": "blue", "definition": "..." }
  ]
}
`;
  return schema;
};

/**
 * ==================================================================
 * --- 💎 THE MAIN EXPORTED FUNCTION 💎 ---
 * ==================================================================
 */
export const generateDetailedPrompt = (
  question: Question,
  selectedType: QuestionType
): string => {
  let schemaDefinition = '';
  const questionOptions = formatOptions(question);

  // Use the ADMIN-SELECTED type
  switch (selectedType) {
    case 'SingleChoice':
      schemaDefinition = getSingleChoiceSchema(question);
      break;

    // Map all old types to our new "HowMany" schema
    case 'StatementBased':
    case 'HowManyPairs':
    case 'HowMany':
      schemaDefinition = getHowManySchema(question);
      break;

    case 'MatchTheList':
      schemaDefinition = getMatchTheListSchema(question);
      break;

    default:
      schemaDefinition = getSingleChoiceSchema(question);
  }

  // Inject the specific parts into the base template
  return basePromptTemplate
    .replace('{{QUESTION_TEXT}}', question.text)
    .replace('{{QUESTION_OPTIONS}}', questionOptions)
    .replace('{{SCHEMA_DEFINITION}}', schemaDefinition);
};
