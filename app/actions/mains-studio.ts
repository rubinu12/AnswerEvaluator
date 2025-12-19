'use server';

import { query } from '@/lib/db';
import { generateEmbedding } from './topics'; 
import { revalidatePath } from 'next/cache';

// --- 1. TREE BUILDER (Ensures a specific path exists) ---
async function ensurePath(path: string[]): Promise<string> {
  let parentId: string | null = null;
  let currentId: string | null = null;

  if (!path || path.length === 0) throw new Error("Path is empty.");

  for (const nodeName of path) {
    if (!nodeName || typeof nodeName !== 'string') continue;

    // A. Search (Case Insensitive)
    const res = await query(
      `SELECT id FROM topics 
       WHERE name ILIKE $1 
       AND ($2::uuid IS NULL OR parent_id = $2::uuid)`,
      [nodeName, parentId]
    );

    if (res.rows.length > 0) {
      currentId = res.rows[0].id;
    } else {
      // B. Create (With Embedding)
      console.log(`[TreeBuilder] Creating Node: '${nodeName}'`);
      const slug = nodeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const embed = await generateEmbedding(nodeName); 

      if (!embed) throw new Error(`AI Embedding failed for '${nodeName}'`);

      const newTopic = await query(
        `INSERT INTO topics (paper, subject, name, parent_id, slug, embedding, keywords) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [path[0], path[1] || nodeName, nodeName, parentId, slug, embed, [nodeName]]
      );
      currentId = newTopic.rows[0].id;
    }
    parentId = currentId; // Move down the tree
  }
  
  if (!currentId) throw new Error(`Failed to resolve path: ${path.join(' -> ')}`);
  return currentId;
}

// --- 2. TAG RESOLVER (Handles "related_topics") ---
async function resolveTag(tagName: string, paper: string, subject: string): Promise<string> {
  // Strategy: 
  // 1. Search Globally: Does "Federalism" exist anywhere? If yes, use it.
  // 2. If missing: Create it under the current Question's Subject (e.g. Polity).
  
  // 1. Search
  const search = await query(`SELECT id FROM topics WHERE name ILIKE $1 LIMIT 1`, [tagName]);
  if (search.rows.length > 0) return search.rows[0].id;

  // 2. Create (Fallback)
  console.log(`[TagResolver] Creating new tag: '${tagName}' under ${subject}`);
  // We first ensure the Subject exists (Paper -> Subject)
  const subjectId = await ensurePath([paper, subject]);
  
  // Now create the tag under this Subject
  const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const embed = await generateEmbedding(tagName);
  if (!embed) throw new Error(`AI Embedding failed for tag '${tagName}'`);

  const newTag = await query(
    `INSERT INTO topics (paper, subject, name, parent_id, slug, embedding, keywords) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id`,
    [paper, subject, tagName, subjectId, slug, embed, [tagName]]
  );
  
  return newTag.rows[0].id;
}

// --- 3. MAIN ACTION: Save Questions (Strict Schema) ---
export async function saveMainsQuestions(data: {
  sourceType: string, 
  sourceRef: any,     
  questions: any[]    
}) {
  const results = { successCount: 0, errors: [] as string[] };

  try {
    for (const item of data.questions) {
      try {
        // --- A. VALIDATION ---
        if (!item.question_text) throw new Error("Missing 'question_text'");
        if (!item.main_path || !Array.isArray(item.main_path)) throw new Error("Missing 'main_path'");

        // --- B. ID RESOLUTION ---
        // 1. Main Topic (The Lead Role)
        const mainTopicId = await ensurePath(item.main_path);
        const mainTopicName = item.main_path[item.main_path.length - 1]; // Store the name for easy read

        // 2. Sub Topics (The Supporting Roles)
        const subTopicIds: string[] = [];
        if (item.related_topics && Array.isArray(item.related_topics)) {
          for (const tag of item.related_topics) {
            try {
              const tagId = await resolveTag(tag, item.paper || 'GS2', item.subject || 'Polity');
              subTopicIds.push(tagId);
            } catch (err) {
              console.warn(`Skipping tag '${tag}':`, err);
            }
          }
        }

        // --- C. DATABASE INSERT ---
        // Mapping JSON fields to DB Columns 1:1
        const qRes = await query(
          `INSERT INTO questions 
          (
            paper, 
            subject, 
            main_topic,      -- Text Name
            main_topic_id,   -- UUID Link
            sub_topic_ids,   -- UUID Array
            question_text, 
            directive, 
            marks_max, 
            word_limit,
            demand_structure, 
            source_type, 
            source_ref,
            is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
          RETURNING id`,
          [
            item.paper || 'GS2',            // $1
            item.subject || 'Polity',       // $2
            mainTopicName,                  // $3
            mainTopicId,                    // $4
            subTopicIds,                    // $5
            item.question_text,             // $6
            item.directive || 'Discuss',    // $7
            item.marks || 10,               // $8
            item.word_limit || 150,         // $9
            JSON.stringify(item.demand_structure || []), // $10
            data.sourceType,                // $11
            JSON.stringify(data.sourceRef)  // $12
          ]
        );

        // --- D. MODEL ANSWER (Optional) ---
        if (item.model_answer) {
          await query(
            `INSERT INTO model_answers (question_id, full_text, author_type)
             VALUES ($1, $2, 'AI_GENERATED')
             ON CONFLICT (question_id) DO UPDATE SET full_text = $2`,
            [qRes.rows[0].id, item.model_answer]
          );
        }

        results.successCount++;
      } catch (e: any) {
        console.error("Import Error:", e);
        results.errors.push(`Q ("${item.question_text?.substring(0,10)}..."): ${e.message}`);
      }
    }

    revalidatePath('/admin/mains');
    return { success: true, ...results };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 4. STATS (For Dashboard) ---
export async function getMainsStats() {
  try {
    const qCount = await query(`SELECT COUNT(*) FROM questions`);
    const aCount = await query(`SELECT COUNT(*) FROM model_answers`);
    const tCount = await query(`SELECT COUNT(*) FROM topics`);
    
    const totalQ = parseInt(qCount.rows[0].count);
    const totalA = parseInt(aCount.rows[0].count);

    return {
      questions: totalQ,
      answers: totalA,
      pending: totalQ - totalA,
      topics: parseInt(tCount.rows[0].count)
    };
  } catch (e) {
    return { questions: 0, answers: 0, pending: 0, topics: 0 };
  }
}