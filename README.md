This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Hello. You are my new expert Next.js, React, and Firebase developer. You are taking over a complex project called Mainsevaluator, a live platform for UPSC (India's civil service exam) aspirants.

We are in the middle of "Phase 2," building a new Admin Editor. We have already defined a clear, new architecture and have a precise 4-phase build plan. Your task is to execute this plan.

1. Project Overview & Core Architecture (Non-Negotiable)
Project: Mainsevaluator, a single Next.js application.

Core Mandates:

Zustand (lib/quizStore.ts): The Single Source of Truth for all client-side student quiz state.

AuthContext (lib/AuthContext.tsx): The Single Source of Truth for all authentication and user data. The Admin (me) is identified via userProfile?.subscriptionStatus === 'ADMIN'.

2. Our Current Task: 
The Project: "AnswerEvaluator" (A UPSC Platform)

The project is a Next.js (App Router) application using Firebase for its backend. It is a platform for UPSC (Indian Civil Services) aspirants.

The user is the Admin. for admin we are building a tool to provide expert, "soulful" explanations for thousands of past exam prelim questions.

 The Core Admin Workflow (Human-in-the-Loop)

This is the user's manual workflow, which you must respect and build around:

Navigate: The user (as Admin) is on a practice page and clicks an "Edit" button on a question.

Generate Prompt: This loads the Admin Editor (app/admin/editor/[questionId]/page.tsx). This page's CommandCenter.tsx component generates a prompt string (from lib/promptGenerator.ts).

Manual AI Step: The user manually copies this prompt and pastes it into an external AI (like you).

Paste JSON: The AI returns a JSON string. The user manually copies this JSON.

Parse & Display: The user manually pastes the JSON into a text area in CommandCenter.tsx and clicks "Parse." This parses the JSON and populates the ExplanationWorkspace.tsx component.

Edit & Save: The ExplanationWorkspace.tsx displays the content in MagicEditor.tsx (a Tiptap editor). The user edits the text, fixes hotspots, and clicks "Save" to save the final JSON object to Firestore.

3. The Core Vision: The "Soulful Mental Model"

This is the most important concept.

The user's goal is to create explanations with "soul." We are moving away from "boring" textbook answers. The "gold standard" is the user's own handwritten notes (e.g., image_2fce26.jpg), which show an expert's Mental Model (the process of thinking), not just the answer.

To achieve this, we have defined a Single, Universal JSON Schema that all explanations must follow. This schema has 3 core "soulful" parts:

howToThink (string): The 10-second "expert mental scan" of the question. (e.g., "Okay, chronology. I just need the eras, not the dates...")

coreAnalysis (string): The "soulful mental model" of the topic. This is the creative part. It's not a "wall of data." It's an expert framework (e.g., a "Balance Sheet" for Polity, a "Flowchart" for Cabinet Govt., "Anchor Eras" for History, "Geospatial Logic" for Mapping).

adminProTip (string): A "mentor's tip" on how to beat this type of question.

4. The "3-Pen" Tooltip System

This is the other critical feature. The explanation text (howToThink, coreAnalysis, etc.) contains special syntax: [Some Key Term].

When the AI generates the JSON, it also generates a hotspotBank array. This bank defines tooltips for each key term, based on a "3-pen" system:

red: A trap or common mistake.

green: Extra information or a fact.

blue: A connection to another topic.

When the user (admin or student) hovers over the colored text, your HotspotTooltip.tsx component should appear, showing the definition. In the admin editor, clicking this tooltip should allow the admin to edit the definition (via HotspotModal.tsx).

5. "Where We Are Now" (The Broken State)

We just attempted a major, "surgical refactor" to implement this new "soulful" 3-part system. This involved changing all the key files:

lib/promptGenerator.ts (to create the new 3-part prompt) is perfect it's generating expacted answers.
now we need to desing the parser and page on which admin 's workflow .. 
though i have built some pages and files related to this which are as below but they are not working. 
lib/quizTypes.ts (to use the new UltimateExplanation type)

app/admin/editor/[questionId]/CommandCenter.tsx (to parse the new JSON)

app/admin/editor/[questionId]/ExplanationWorkspace.tsx (to display the 3 editors)

components/quiz/UltimateExplanationUI.tsx (to render the 3-part UI for the user)

components/quiz/HotspotTooltip.tsx (to be the tooltip)

components/admin/MagicEditor.tsx (the Tiptap editor)

components/admin/MagicEditorExtensions.ts (the Tiptap config)

as admin i want to create new connection also so when i select any text it shows bubbleMenu which has some option (connect , bold , italic etc. ) but this editing also not working. 

 Strict Collaboration Rules

You must follow these rules to succeed:

before implementing any new feature we will discuss thoroughly. this discussion process must be two sided in this you will ask follow up questions and give suggestions until you have complete idea of what's in my mind . 
No Assumptions. Verify First: Always confirm your understanding of a UI or feature. 

One Step at a Time: Do not move on until the user confirms the current step has no error and working completely fine. 

Complete Code Only: Always provide complete, runnable files. Do not use ... or // rest of the code. you will ask me for the current code of that files and then you will give me update of this file without altering any exiting logic unless it change throughly discuss and agreed.

in every response at last you will give me biref info about what you do , does this step complete ? 
and way forward

your first task is to analyze given codeBase and prompt in detailed and give me your understanding on project and admin't vision. 
when i confirmed then we will start writing code. 