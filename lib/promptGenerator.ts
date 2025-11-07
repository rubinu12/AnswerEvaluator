// lib/promptGenerator.ts
import { Question, QuestionType } from './quizTypes';

/**
 * ==================================================================
 * --- 💎 THE "DR. TOPPER SINGH" PROMPT PERSONA 💎 ---
 * ==================================================================
 * UPDATED to the "practical, concise, and super-useful" theme.
 */
const basePromptTemplate = `
You are "Topper" Singh, a top-ranked UPSC mentor on the Mainsevaluator platform.

Your goal is to create a **practical, concise, and super-useful** explanation. Focus on high-yield facts and strategy, not long, "textbook-style" paragraphs. Your explanation is a **high-yield digital note**.

**Question:**
{{QUESTION_TEXT}}

**Options:**
{{QUESTION_OPTIONS}}

---
You will respond with **ONLY** a valid JSON object. Do not include any text before or after the \`{...}\`.

Your JSON **must** adhere to this exact schema and these "Content Quality" rules.

### Content Quality Rules

1.  **\`howToThink\`:** Your 10-second mental model. It must be SHORT and focus on identifying the **core demand or trap** of the question.
2.  **\`adminProTip\`:** Your "mentor's tip." This must be a **practical strategy** or a "deeper connection" to beat this *type* of question in the future.
3.  **\`takeaway\`:** A single, bold sentence summarizing the answer.

### JSON Formatting & "Perfect" Parser Rules

* **Rich HTML:** Use HTML tags (\`<strong>\`, \`<em>\`, \`<u>\`) and "Pen" colors:
    * \`<span style="color: red;">...\</span>\` (Traps, Incorrect)
    * \`<span style="color: green;">...\</span>\` (Correct, Positive)
    * \`<span style="color: blue;">...\</span>\` (Key Terms, Connections)
* **[Hotspots]:** You **MUST** wrap all key terms, people, concepts, etc., in square brackets [like this].
* **\`hotspotBank\`:** You **MUST** provide a **concise, high-yield** definition for *every* bracketed hotspot in the \`hotspotBank\` array.
    * \`"type": "green"\`: (Deeper Knowledge)
    * \`"type": "blue"\`: (Deeper Connections)
    * \`"type": "red"\`: (Deeper Traps)
* **"NO JARGON" RULE:** Do not create hotspots for basic, obvious terms (e.g., "UPSC", "India").

---
### Strict JSON Schema for This Question Type:
{{SCHEMA_DEFINITION}}
`;

/**
 * Helper to format question options for the prompt.
 * (This is your original function, unchanged)
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
 * --- 💎 PROMPT LIBRARY (UPGRADED TO 5 TYPES) 💎 ---
 * ==================================================================
 */

/**
 * 1. Schema for: [SingleChoice]
 * UPDATED: Removed 'coreConceptAnalysis' for the concise theme.
 */
const getSingleChoiceSchema = (question: Question): string => {
  const optionsPrompt = question.options
    .map(
      (opt) =>
        `    { "option": "${opt.label}", "text": "${opt.text}", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>concise HTML</strong> string with [hotspots]. (e.g., 'Okay, standard MCQ. What's the core concept? What's the obvious trap?')",
  "singleChoiceAnalysis": {
    "optionAnalysis": [
  ${optionsPrompt}
    ],
    "finalAnswer": "A"
  },
  "adminProTip": "A <strong>practical & concise HTML</strong> string with [hotspots].",
  "takeaway": "A <strong>single, bold HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "A concise, high-yield definition." }
  ]
}
`;
};

/**
 * 2. Schema for: [HowMany]
 * (This is your original function, just with an updated 'howToThink' and 'proTip')
 * It still uses the 'question.options' hack, which is what you wanted.
 */
const getHowManySchema = (question: Question): string => {
  // "options" for this type hold the items/statements/pairs
  const itemsPrompt = question.options
    .map(
      (opt) =>
        ` 	{ "item": "${
          opt.text // This assumes opt.text is "1. Statement 1..."
        }", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>concise HTML</strong> string with [hotspots]. (e.g., 'This is a 'How Many' question. <span style=\\"color: red;\\">Elimination won't work</span>. I must be 100% accurate on every item.')",
  "howManyAnalysis": {
    "itemAnalysis": [
  ${itemsPrompt}
    ],
    "conclusion": {
      "countSummary": "A <strong>concise HTML</strong> string summarizing the count. (e.g., 'So, <span style=\\"color: green;\\"><strong>two (2)</strong></span> of the three items are correct.')",
      "optionAnalysis": "A <strong>concise HTML</strong> string analyzing the final A,B,C,D options. (e.g., 'A. Only one: ❌, B. Only two: ✅')"
    }
  },
  "adminProTip": "A <strong>practical & concise HTML</strong> string with [hotspots]. (e.g., 'This pattern tests precision. There is no partial credit.')",
  "takeaway": "A <strong>single, bold HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "A concise, high-yield definition." }
  ]
}
`;
};

/**
 * 3. Schema for: [MatchTheList]
 * (This is your original function, just with updated concise prompts)
 */
const getMatchTheListSchema = (question: Question): string => {
  // This schema was (and still is) hardcoded.
  // To make this dynamic, we would need to know how your 'Question'
  // object stores List I and List II.
  const schema = `
{
  "howToThink": "A <strong>concise HTML</strong> string with [hotspots]. (e.g., 'Match question. I'll find the one pair I know for sure, then use it to eliminate options.')",
  "matchTheListAnalysis": {
    "itemAnalysis": [
 	  {
 		"item": "A. [Item A text]",
 		"correctMatch": "[Match 2 text]",
 		"analysis": "✅ <span style=\\"color: green;\\">[Concise fact].</span>"
 	  },
 	  {
 		"item": "B. [Item B text]",
 		"correctMatch": "[Match 4 text]",
 		"analysis": "✅ <span style=\\"color: green;\\">[Concise fact].</span>"
 	  }
    ],
    "conclusion": {
      "correctCombination": "A <strong>concise HTML</strong> summary. (e.g., 'The correct combination is: A-2, B-4, C-1, D-3.')",
      "optionAnalysis": "A <strong>concise HTML</strong> analysis of the final A,B,C,D options."
    }
  },
  "adminProTip": "A <strong>practical & concise HTML</strong> string with [hotspots]. (e.g., 'You often only need to know 2 of the 4 pairs to find the answer.')",
  "takeaway": "A <strong>single, bold HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "A concise, high-yield definition." }
  ]
}
`;
  return schema;
};

/**
 * 4. NEW Schema for: [SelectTheCode]
 * (e.g., "1 and 2 only")
 * This uses the SAME logic as your 'getHowManySchema'
 */
const getSelectTheCodeSchema = (question: Question): string => {
  // We re-use your "hack": 'options' holds the items to be analyzed.
  const itemsPrompt = question.options
    .map(
      (opt) =>
        ` 	{ "item": "${
          opt.text // This assumes opt.text is "1. Statement 1..."
        }", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>concise HTML</strong> string with [hotspots]. (e.g., 'Select-the-Code. I'll find one item I know is wrong to [eliminate] options first.')",
  "multiSelectAnalysis": {
    "itemAnalysis": [
  ${itemsPrompt}
    ],
    "conclusion": {
      "correctItemsSummary": "A <strong>concise HTML</strong> summary. (e.g., 'Statements 1 and 3 are correct.')",
      "optionAnalysis": "A <strong>concise HTML</strong> analysis of the final A,B,C,D options."
    }
  },
  "adminProTip": "A <strong>practical & concise HTML</strong> string with [hotspots]. (e.g., 'Always use the [Elimination Technique] here. Find the 'weakest link' first.')",
  "takeaway": "A <strong>single, bold HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "A concise, high-yield definition." }
  ]
}
`;
};

/**
 * 5. NEW Schema for: [StatementExplanation]
 * (e.g., "Statement I / Statement II")
 * This also uses the 'question.options' hack.
 */
const getStatementExplanationSchema = (question: Question): string => {
  // We re-use your "hack": 'options' holds the two statements.
  const statementsPrompt = question.options
    .map(
      (opt) =>
        ` 	{ "id": "${opt.label}", "text": "${opt.text}", "isCorrect": false, "analysis": "❌ <span style=\\"color: red;\\">...</span>" }`
    )
    .join(',\n');

  return `
{
  "howToThink": "A <strong>concise HTML</strong> string with [hotspots]. (e.g., 'A-R question. Step 1: Check S-I (T/F). Step 2: Check S-II (T/F). Step 3: Check the '[Because Test]'.')",
  "statementAnalysis": {
    "statements": [
  ${statementsPrompt}
    ],
    "relationshipAnalysis": "A <strong>concise HTML</strong> string explaining the logical link. (e.g., 'Does S-I happen *because* of S-II? Yes/No...')",
    "optionAnalysis": "A <strong>concise HTML</strong> analysis of the final A,B,C,D options."
  },
  "adminProTip": "A <strong>practical & concise HTML</strong> string with [hotspots]. (e.g., 'The [Because Test] is everything. If S-II is true but not the *reason*, the answer is B.')",
  "takeaway": "A <strong>single, bold HTML</strong> string.",
  "hotspotBank": [
    { "term": "...", "type": "green", "definition": "A concise, high-yield definition." }
  ]
}
`;
};

/**
 * ==================================================================
 * --- 💎 THE MAIN EXPORTED FUNCTION (UPGRADED) 💎 ---
 * ==================================================================
 */
export const generateDetailedPrompt = (
  question: Question,
  selectedType: QuestionType
): string => {
  let schemaDefinition = '';
  const questionOptions = formatOptions(question);

  // Use the ADMIN-SELECTED 5-way type
  switch (selectedType) {
    case 'SingleChoice':
      schemaDefinition = getSingleChoiceSchema(question);
      break;

    // This block now contains all our new types
    // We assume your admin logic will feed the "items"
    // into the 'question.options' array for these types.
    case 'HowMany':
    case 'HowManyPairs':
    case 'StatementBased': // Keeping your old types
      schemaDefinition = getHowManySchema(question);
      break;
    
    // --- NEWLY ADDED ---
    case 'SelectTheCode':
      schemaDefinition = getSelectTheCodeSchema(question);
      break;

    // --- NEWLY ADDED ---
    case 'StatementExplanation':
      schemaDefinition = getStatementExplanationSchema(question);
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