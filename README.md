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

2. Our Current Task: The "Ultimate Explanation" Admin Editor
We are building the Admin workflow for adding "Ultimate Explanations" to Prelims questions.

The "Scrapped" Architecture (What We Abandoned): We have already scrapped a previous design. That design was flawed:

It used a "cramped" 2-tab layout ("Edit" and "Preview"). This was clunky.

It was built on an "illogical" and "repetitive" JSON data structure that used a single coreAnalysis field, which was not flexible enough for different question types.

We have already deleted coreAnalysis from our type definitions. Any file still referencing it is broken and must be upgraded.

The New, Superior Architecture (Our "Playground" Vision): We are now building a true, intuitive WYSIWYG ("What You See Is What You Get") editor.

Location: The new dedicated Admin Page at app/admin/editor/[questionId]/page.tsx.

Layout ("The Playground"): The ExplanationWorkspace.tsx component (Row 2) will NOT have tabs. It will be a single, interactive "Playground".

Editing Mechanism: The admin will edit content directly on this "Playground" view. All content blocks (howToThink, adminProTip, takeaway, and all individual analysis blocks) will be rendered using our Tiptap-based <MagicEditor /> component, but styled to be "borderless" so they look exactly like the final student preview. When the admin clicks on any text, it becomes an active editor, and the Tiptap Floating Toolbar appears.

3. The "Master Plan": New Data Schema (The Source of Truth)
To support this new editor, we have created a new "Master Plan" for our data.

Core Type File: lib/quizTypes.ts defines the new UltimateExplanation type.

Schema Structure: The UltimateExplanation object now contains:

Common Fields: howToThink (HTML), adminProTip (HTML), takeaway (HTML), visualAid (optional), and hotspotBank (array).

Schema-Specific Blocks: It must contain exactly one of the following objects to store the analysis for that question type:

singleChoiceAnalysis

howManyAnalysis

matchTheListAnalysis

4. The "Hotspot" Workflow (The Most Critical Feature)
This is the most complex and important part of the editor. We are building a system for the admin to have full control over "Deeper Connections," or "Hotspots."

AI Generation: The "Dr. Topper Singh" AI prompts (in lib/promptGenerator.ts) have been upgraded to generate this new JSON schema, including populating the hotspotBank array.

Full Admin Control (Add/Edit/Delete): The admin must be able to edit the AI's output.

The Tool: The Tiptap Floating Toolbar (in components/admin/MagicEditorExtensions.ts) will have a new [Connect] button.

To Add a Hotspot: The admin selects text in the "Playground," clicks [Connect], and a new modal (HotspotModal.tsx) opens.

To Edit/Delete a Hotspot: The admin clicks on an existing hotspot in the "Playground." The same HotspotModal.tsx opens, pre-filled with that hotspot's data, and shows "Edit" and "Delete" buttons.

"Pen-Based" Hotspot Types: The HotspotModal.tsx will allow the admin to set the hotspot type, which is non-negotiable:

green: For "Deeper Knowledge" (core extra info).

blue: For "Deeper Connections" (inter-topic or Current Affairs links).

red: For "Deeper Traps" (common misconceptions or warnings).

5. Project Status: Files Already Completed
We have already completed the "backend" and "type definition" work:

lib/quizTypes.ts: Has been "perfectly" upgraded to the new UltimateExplanation "Master Plan" schema (scrapping coreAnalysis and adding the new analysis blocks and hotspotBank).

lib/promptGenerator.ts: Has been "perfectly" upgraded to generate prompts for the three new schemas ([SingleChoice], [HowMany], [MatchTheList]) and the hotspotBank.

app/api/questions/[questionId]/route.ts: The PATCH route has been "perfectly" upgraded to save this new UltimateExplanation structure and granularly update Firestore. It also includes FieldValue.delete() to remove the old coreAnalysis field from documents.

6. Your First Task: Execute Our 4-Phase Build Plan
We are now ready to build the client-side "Playground" editor. You must follow this exact 4-phase plan.

Phase 1: Build the "Playground" Layout.

File: app/admin/editor/[questionId]/ExplanationWorkspace.tsx

Action: Remove the 2-tab layout. Render the howToThink, adminProTip, and takeaway fields as "borderless" <MagicEditor /> instances.

Phase 2: Build the "Analysis" Editors.

File: app/admin/editor/[questionId]/ExplanationWorkspace.tsx

Action: Add logic to conditionally render the analysis block (e.g., singleChoiceAnalysis). This logic must loop over the items in the analysis (e.g., optionAnalysis) and render a <MagicEditor /> for each individual analysis string.

Phase 3: Build the "Hotspot [Connect]" Workflow (Add/Edit/Delete).

Files: components/admin/MagicEditorExtensions.ts and a new components/admin/HotspotModal.tsx.

Action: Add the [Connect] button to the toolbar. Build the new modal. Implement the logic to create new hotspots and to click/edit/delete existing hotspots, ensuring the Tiptap editor and the React hotspotBank state are always in sync.

Phase 4: Add Image Uploaders.

Files: components/admin/HotspotModal.tsx and app/admin/editor/[questionId]/ExplanationWorkspace.tsx.

Action: Add an image uploader inside the HotspotModal.tsx (for handwritten notes on a hotspot). Add a separate image uploader in the ExplanationWorkspace.tsx (for the main question visualAid).

Your first task is to confirm you understand this entire handoff and are ready to begin implementing Phase 1.
