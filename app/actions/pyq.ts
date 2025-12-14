'use server';

import { query } from '@/lib/db';
import { generateEmbedding } from './topics'; 
import { revalidatePath } from 'next/cache';

// --- HELPER: Build the Topic Tree Path ---
// UPDATE: Return type is strictly Promise<string>. It will never return null.
async function ensurePath(path: string[]): Promise<string> {
  let parentId: string | null = null;
  let currentId: string | null = null;

  if (path.length === 0) {
    throw new Error("Critical: Attempted to build tree with an empty path.");
  }

  for (const nodeName of path) {
    if (!nodeName) continue;

    // 1. STRICT LOOKUP
    const res = await query(
      `SELECT id FROM topics 
       WHERE name ILIKE $1 
       AND ($2::uuid IS NULL OR parent_id = $2::uuid)`,
      [nodeName, parentId]
    );

    if (res.rows.length > 0) {
      currentId = res.rows[0].id;
    } else {
      // 2. CREATE NEW
      console.log(`Creating Topic: ${nodeName} (Parent: ${parentId})`);
      
      const slug = nodeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const embed = await generateEmbedding(nodeName); 

      // STRICT CHECK: If AI fails, we stop everything.
      if (!embed) {
        throw new Error(`Critical Security: AI failed to generate embedding for topic '${nodeName}'. Null not allowed.`);
      }

      const newTopic = await query(
        `INSERT INTO topics (paper, subject, name, parent_id, slug, embedding, keywords) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [path[0], path[1] || nodeName, nodeName, parentId, slug, embed, [nodeName]]
      );
      currentId = newTopic.rows[0].id;
    }
    
    parentId = currentId;
  }

  // FINAL STRICT CHECK
  if (!currentId) {
    throw new Error(`Critical: Failed to resolve any ID for path: ${path.join(' -> ')}`);
  }

  return currentId;
}

// --- MAIN ACTION ---
export async function importPYQBatch(data: {
  exam: string,
  year: number,
  paper: string,
  questions: any[]
}) {
  const results = { successCount: 0, errors: [] as string[] };

  try {
    for (const item of data.questions) {
      try {
        // A. Validate
        if (!item.main_path || !Array.isArray(item.main_path) || item.main_path.length === 0) {
          throw new Error(`Question "${item.question_text.substring(0,20)}..." has invalid 'main_path'`);
        }

        // B. Resolve Main Topic Path
        // We filter out the paper name to avoid duplicating it if it's already in the path
        const pathSuffix = item.main_path.filter((p: string) => p !== data.paper);
        const fullPath = [data.paper, ...pathSuffix];
        
        // This will now definitely return a string or throw
        const mainTopicId = await ensurePath(fullPath);

        // C. Resolve Sub Topics
        const subTopicIds: string[] = [];
        if (item.sub_paths && Array.isArray(item.sub_paths)) {
          for (const path of item.sub_paths) {
             const cleanSuffix = path.filter((p: string) => p !== data.paper);
             const cleanPath = [data.paper, ...cleanSuffix];
             
             // STRICTNESS: This ensures sId is a string.
             const sId = await ensurePath(cleanPath);
             subTopicIds.push(sId);
          }
        }

        // D. Insert Question
        const subject = fullPath.length > 1 ? fullPath[1] : fullPath[0];

        await query(
          `INSERT INTO questions 
          (paper, subject, main_topic_id, sub_topic_ids, question_text, marks_max, word_limit, demand_structure, source_type, source_ref)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PYQ', $9)`,
          [
            data.paper,
            subject,
            mainTopicId,
            subTopicIds,
            item.question_text,
            item.marks || 10,
            item.word_limit || 150,
            JSON.stringify(item.demands || []),
            JSON.stringify({ exam: data.exam, year: data.year })
          ]
        );

        results.successCount++;
      } catch (e: any) {
        results.errors.push(e.message);
      }
    }

    revalidatePath('/admin/questions');
    revalidatePath('/admin/topics');
    
    return { success: true, ...results };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}