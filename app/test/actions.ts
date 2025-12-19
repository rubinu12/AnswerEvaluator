'use server';

import { query } from '@/lib/db';

/* =====================================================
   TOPIC HELPERS
===================================================== */

// Fetch a single topic (used for level inference & ancestry)
export async function getTopicById(id: string) {
  const res = await query(
    `SELECT id, name, slug, level, ancestry_path
     FROM topics
     WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

// Fetch all topics for dropdowns
export async function getAllTopics() {
  const res = await query(
    `SELECT id, name, level, ancestry_path
     FROM topics
     ORDER BY ancestry_path`
  );
  return res.rows;
}

/* =====================================================
   ADD TOPIC (GS2 → Polity for test)
===================================================== */

export async function addTopic(
  name: string,
  paper: string,
  subject: string,
  level: number,
  parentId?: string | null
) {
  const rawSlug = `${paper}-${subject}-${name}`.toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // ancestry defaults to slug
  let ancestry = slug;

  if (parentId) {
    const parent = await getTopicById(parentId);
    if (!parent) {
      throw new Error(`Parent topic with id ${parentId} not found`);
    }
    ancestry = `${parent.ancestry_path}.${slug}`;
  }

  await query(
    `
    INSERT INTO topics
      (name, slug, level, topic_type, primary_parent_id, ancestry_path)
    VALUES
      ($1, $2, $3, 'canonical', $4::uuid, $5)
    ON CONFLICT (slug) DO NOTHING
    `,
    [
      name,
      slug,
      level,
      parentId ? parentId : null,
      ancestry
    ]
  );
}

/* =====================================================
   QUESTIONS
===================================================== */

export async function addQuestion(
  paper: string,
  subject: string,
  question_text: string,
  directive: string,
  marks_max: number
) {
  // 👇 If paper or subject is missing → DB NOT NULL constraint should fail
  const res = await query(
    `
    INSERT INTO questions
      (paper, subject, question_text, directive, marks_max, source_type)
    VALUES
      ($1, $2, $3, $4, $5, 'PYQ')
    RETURNING id
    `,
    [paper, subject, question_text, directive, marks_max]
  );

  return res.rows[0].id;
}

/* =====================================================
   QUESTION ↔ TOPIC MAPPING
===================================================== */

export async function attachTopicToQuestion(
  questionId: string,
  topicId: string,
  role: 'PRIMARY' | 'SECONDARY'
) {
  await query(
    `
    INSERT INTO question_topics
      (question_id, topic_id, role)
    VALUES
      ($1, $2, $3)
    ON CONFLICT DO NOTHING
    `,
    [questionId, topicId, role]
  );
}

/* =====================================================
   DEMANDS
===================================================== */

export async function addDemand(
  questionId: string,
  order: number,
  title: string,
  expectation: string,
  max_marks: number
) {
  await query(
    `
    INSERT INTO question_demands
      (question_id, demand_order, demand_title, expectation, max_marks)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [questionId, order, title, expectation, max_marks]
  );
}

/* =====================================================
   SEARCH (keyword → topics + demands)
===================================================== */

export async function searchQuestions(queryText: string) {
  const res = await query(
    `
      SELECT
        q.id,
        q.paper,
        q.subject,
        q.question_text,

        json_agg(
          DISTINCT jsonb_build_object(
            'topic', t.name,
            'role', qt.role
          )
        ) AS topics,

        json_agg(
          DISTINCT jsonb_build_object(
            'order', d.demand_order,
            'title', d.demand_title,
            'marks', d.max_marks
          ) ORDER BY d.demand_order
        ) AS demands

      FROM questions q
      LEFT JOIN question_topics qt ON qt.question_id = q.id
      LEFT JOIN topics t ON t.id = qt.topic_id
      LEFT JOIN question_demands d ON d.question_id = q.id

      WHERE q.question_text ILIKE $1
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT 20
    `,
    [`%${queryText}%`]
  );

  return res.rows;
}
