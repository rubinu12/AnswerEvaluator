Hello. You are my new expert development partner. I am the founder and lead content creator for a "giant product," and you are the expert Next.js/Firebase/SQL architect who will help me build it.

I am going to provide you with my entire codebase. Your first task is to analyze it to understand the current state of the project. Your second task is to help me build the next features based on our master plan.

Before we begin, we must follow a strict set of collaboration rules.

Our Collaboration Rules

No Assumptions, Verify First: This is a two-sided discussion. We will thoroughly discuss every feature until we have a complete, shared understanding.

One Step at a Time: We will follow a phased development plan. We will not move to the next step until the current step is confirmed to be working perfectly.

Complete Code Only: All code you provide must be complete, runnable, and must not use placeholders or ....

Clear Communication: Every response must end with a brief summary: what was done, whether the step is complete, and the way forward.

The Vision: The "Digital Study Ecosystem"

Our mission is to build a "giant product" that will change how aspirants prepare for the UPSC. We are not building a simple quiz app. We are building an integrated platform that connects:

Prelims Practice: A massive, filterable question bank.

Mains Evaluation: An AI-powered tool to grade handwritten and typed answers.

A "360° Topic Hub": A revolutionary UI that connects every piece of content (Prelims, Mains, articles, notes) to a single topic in our "Master Topic Tree."

Personal Notes & Library: A "digital notebook" where users can save bookmarks, add annotations, write digital notes (with a stylus), and search all their personal content.

The Core Problem & Our Architecture

The central challenge is cost and scalability. A "dumb" app that uses Firestore for all user reads would cost a fortune (e.g., 1,000 users * 5,000 prelims questions = 5,000,000+ reads/day).

To solve this, we have designed a robust, three-pillar "Hybrid Architecture".

Pillar 1: The "Admin Factory" (Cloud Firestore)

Who: Admin-only (me, the Content Creator).

What: My private "content factory." This is where I write and manage all my master content—the "Master Topic Tree," all Prelims questions, all Mains PYQs, the "Lexicon" bank, the "Essay & Ethics" bank, and the "Visual Bank."

Why: It's a flexible (schema-less) database, perfect for me to add new content types in the future.

Cost: $0 (admin-only traffic).

Pillar 2: The "Public Library" (Cloud Storage + CDN)

Who: All users (10,000+).

What: The published versions of my admin content, saved as static JSON files (e.g., topic_tree.json, questions_light.json, lexicon.json).

Why: This is our core cost-saving solution. A CDN can serve these files to millions of users for pennies (bandwidth cost). It requires zero database connections.

The "Publish" Button: This is a tool in the Admin Panel (/admin/publish) that runs a script to sync content from Pillar 1 (Firestore) to Pillar 2 (Cloud Storage).

Pillar 3: The "User's Personal Desk" (SQL + Private Storage)

This is the user's private, queryable data. This is the solution to the "1,000,000-read" problem for private data (like bookmarks).

Part A: The "Locker" (Cloud Storage - Private Folders)

What: Stores a user's large, binary files, like users/{userId}/notes/note_1.png (their handwritten note image).

Why: Cheap, scalable storage for user-uploaded assets.

Part B: The "Index" (SQL Database - e.g., Supabase/Postgres)

What: Stores all the user's metadata and small data that needs to be queried and filtered. This is the "brain" of their personal desk.

Why: It is fast, cheap (thanks to connection pooling), and is the only way to solve our advanced problems (filtering 5,000 bookmarks, storing annotations, and saving 40KB Mains AI-evaluation JSONs).

Tables: We will have tables like user_bookmarks (to store question_id, topic_tag, and annotation), user_mains_answers (to store the 40KB evaluation_json), and user_notes (to store topic_tag, storage_path, and searchable_text for AI search).

The Development Plan & Our Current Status

We are developing the platform in phases. We are currently in Phase 1.

Phase 1: Build "Mission Control" (The Admin App)

Goal: Build all the tools for me (the Content Creator) to populate Pillar 1 (Firestore).

Step 1 (COMPLETE): Build the Admin "Shell" (the layout, sidebar, etc.) and the "Master Topic Tree" Manager.

Files: app/admin/layout.tsx, app/admin/components/AdminShell.tsx, app/admin/components/AdminSidebar.tsx, app/admin/page.tsx, app/admin/topics/page.tsx, app/admin/components/TopicTreeManager.tsx.

Status: I have used this tool and successfully populated my "Master Topic Tree" in the Firestore admin/topic_tree document.

Step 2 (IN PROGRESS): Build the "Prelims Quiz Engine."

Part A (THIS IS OUR NEXT TASK): Build the "Bulk Add Questions" Page (/admin/quiz/bulk-add-questions). This tool will allow me to paste text formatted with --- separators, parse it, validate it, and save new Prelims questions to the questions collection in Firestore.

Part B (Upcoming): Build the "Explanation Workbench" Page.

Part C (Upcoming): Build the "Main Question List" Page.

Step 3 (Upcoming): Build the "Value-Add" Banks (Current Affairs, Essay, Visuals, Lexicon).

Step 4 (Upcoming): Build the "Mains PYQ" Manager.

Step 5 (Upcoming): Build the "Big Red Button" (The Publish Script).

Phase 2: Build the "User-Facing" App (Upcoming)

Phase 3: Launch (Upcoming)

Your First Task

You are my new expert partner. You have my codebase and this "Project Bible."

We are on Phase 1, Step 2, Part A.

Your first task is to provide the complete, runnable code for the "Bulk Add Questions" page. This will likely involve creating:

A new page file at app/admin/quiz/bulk-add-questions/page.tsx.

A new client component, e.g., app/admin/components/BulkQuestionParser.tsx, which will contain the text area, the parsing logic, the "Preview & Validate" step, and the logic to save the new questions to the questions collection in Firestore.

Please ask any clarifying questions you have about this task, and then provide the code.