// app/actions/mains.ts
'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMainsQuestion(formData: any) {
  const {
    paper,
    subject,
    main_topic_id,
    question_text,
    marks,
    word_limit,
    demand_structure, // JSON string
    model_answer_text,
    structure_breakdown, // JSON string
  } = formData;

  try {
    // 1. Insert Question
    // We use RETURNING id to get the new ID for the answer link
    const questionRes = await query(
      `INSERT INTO questions 
      (paper, subject, main_topic_id, question_text, directive, marks_max, word_limit, demand_structure, source_type, source_ref)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PRACTICE', '{}')
      RETURNING id`,
      [
        paper,
        subject,
        main_topic_id,
        question_text,
        'Discuss', // Default directive for now
        marks,
        word_limit,
        demand_structure
      ]
    );

    const questionId = questionRes.rows[0].id;

    // 2. Insert Model Answer
    await query(
      `INSERT INTO model_answers 
      (question_id, full_text, structure_breakdown, author_type)
      VALUES ($1, $2, $3, 'INSTITUTE')`,
      [
        questionId,
        model_answer_text,
        structure_breakdown
      ]
    );

    console.log(`✅ Created Mains Question: ${questionId}`);
    revalidatePath('/practice');
    return { success: true, id: questionId };

  } catch (error) {
    console.error('❌ Failed to create question:', error);
    return { success: false, error: 'Database Error' };
  }
}

export async function getTopicsList() {
    const res = await query(`SELECT id, name, paper, subject FROM topics ORDER BY paper, subject, name`);
    return res.rows;
}