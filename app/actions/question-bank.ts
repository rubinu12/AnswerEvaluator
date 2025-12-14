'use server';

import { query } from '@/lib/db';
import { findClosestTopic } from './topics'; // Uses your Vector Search
import { revalidatePath } from 'next/cache';

// --- 1. SINGLE ADD ---
export async function createQuestionOnly(formData: any) {
  try {
    // Resolve Topic
    let topicId = null;
    if (formData.topicName) {
      const match = await findClosestTopic(formData.topicName);
      topicId = match?.id || null;
    }

    const res = await query(
      `INSERT INTO questions 
      (paper, subject, main_topic_id, question_text, marks_max, word_limit, demand_structure, source_type, source_ref)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        formData.paper,
        formData.subject || 'Polity',
        topicId,
        formData.questionText,
        formData.marks,
        formData.words,
        JSON.stringify(formData.demands),
        formData.sourceType,
        formData.sourceRef
      ]
    );

    revalidatePath('/admin/questions');
    return { success: true, id: res.rows[0].id };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 2. BULK IMPORT (The Power Feature) ---
export async function bulkImportQuestions(questionsData: any[], globalSource?: any) {
  const results = { successCount: 0, errors: [] as string[] };

  try {
    for (const item of questionsData) {
      // A. Resolve Topic ID using Vector Search
      // If the JSON has a topic name, we find the UUID. 
      const topicMatch = await findClosestTopic(item.topic_name);
      const topicId = topicMatch ? topicMatch.id : null;

      if (!topicId) {
        results.errors.push(`Skipped "${item.question_text.substring(0, 20)}...": Topic "${item.topic_name}" not found.`);
        continue; 
      }

      // B. Determine Source
      // Use item's specific source if present, otherwise use the global dropdown setting
      const sourceType = item.source_type || globalSource?.type || 'DAILY';
      const sourceRef = item.source_ref || globalSource?.ref || { date: new Date().toISOString() };

      // C. Insert
      await query(
        `INSERT INTO questions 
        (paper, subject, main_topic_id, question_text, marks_max, word_limit, demand_structure, source_type, source_ref)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          item.paper || 'GS2',
          item.subject || 'Polity',
          topicId,
          item.question_text,
          item.marks || 10,
          item.word_limit || 150,
          JSON.stringify(item.demands || []),
          sourceType,
          sourceRef
        ]
      );

      results.successCount++;
    }

    revalidatePath('/admin/questions');
    return { success: true, ...results };

  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return { success: false, error: error.message };
  }
}

// --- 3. FETCH RECENT ---
export async function getRecentQuestions() {
  const res = await query(`
    SELECT q.id, q.question_text, q.paper, q.source_type, q.created_at, t.name as topic_name
    FROM questions q
    LEFT JOIN topics t ON q.main_topic_id = t.id
    ORDER BY q.created_at DESC LIMIT 20
  `);
  return res.rows;
}