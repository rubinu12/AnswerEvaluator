"use server";

import { db, pool } from "@/lib/db";
import { 
  prelimQuestions, 
  prelimQuestionStatements, 
  prelimQuestionTopics, 
  topics 
} from "@/lib/schema";
import { v1, helpers } from '@google-cloud/aiplatform';
import { eq, and, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * AI PLATFORM CONFIGURATION
 * Exact copy of your working logic in topics.ts
 */
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL_NAME = 'text-embedding-004';
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

const clientOptions = { apiEndpoint: API_ENDPOINT, fallback: true };
const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);

/**
 * INTERNAL EMBEDDING GENERATOR
 * Uses the exact parameters from topics.ts
 */
async function getEmbedding(text: string): Promise<number[]> {
  const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}`;
  const instance = helpers.toValue({ content: text, task_type: 'RETRIEVAL_DOCUMENT' });
  const [response] = await predictionServiceClient.predict({
    endpoint,
    instances: [instance!],
    parameters: helpers.toValue({ autoTruncate: true })!,
  });
  const result = helpers.fromValue(response.predictions![0] as any) as {
    embeddings: { values: number[] }
  };
  return result.embeddings.values;
}

/**
 * SCOPED TOPIC DISCOVERY
 * Search logic: Only searches within the specified parent's lineage.
 * If match < 0.85, it flags for provisional creation.
 */
async function resolveScopedTopic(tx: any, name: string, parentId: string, level: number, contextNames: { paper: string; subject: string }) {
  const embedding = await getEmbedding(`Paper: ${contextNames.paper}, Subject: ${contextNames.subject}, Topic: ${name}`);
  const vectorStr = JSON.stringify(embedding);

  // 1. Search for existing match under the parent
  // We use raw SQL with pgvector because Drizzle vector support depends on specific plugins
  const matchRes = await tx.execute(sql`
    SELECT id, name, ancestry_path, (1 - (embedding <=> ${vectorStr}::vector)) as similarity
    FROM topics
    WHERE primary_parent_id = ${parentId} AND level = ${level}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT 1
  `);

  const bestMatch = matchRes.rows[0];

  if (bestMatch && Number(bestMatch.similarity) > 0.85) {
    return { id: bestMatch.id, ancestryPath: bestMatch.ancestry_path, isNew: false };
  }

  // 2. No Match found: Prepare Provisional Seeding
  const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const parentRes = await tx.select({ path: topics.ancestryPath, slug: topics.slug }).from(topics).where(eq(topics.id, parentId)).limit(1);
  const parent = parentRes[0];
  
  const newPath = `${parent.path}.${cleanSlug}`;
  const newSlug = `${parent.slug}-${cleanSlug}`;

  const [newTopic] = await tx.insert(topics).values({
    name,
    slug: newSlug,
    level,
    primaryParentId: parentId,
    ancestryPath: newPath,
    topicType: 'provisional',
    isNavigable: true,
    embedding: embedding // customType handles JSON.stringify
  }).returning({ id: topics.id, ancestryPath: topics.ancestryPath });

  return { id: newTopic.id, ancestryPath: newTopic.ancestryPath, isNew: true };
}

/**
 * BULK IMPORT PRELIMS
 * Unified Drizzle transaction handling hierarchy discovery and data seeding.
 */
export async function bulkImportPrelims(jsonBatch: any[]) {
  try {
    return await db.transaction(async (tx) => {
      const results = [];

      for (const item of jsonBatch) {
        // 1. Resolve L2 Subject (Manual Entry Required)
        const [l2Subject] = await tx.select().from(topics)
          .where(and(eq(topics.level, 2), ilike(topics.name, item.subject)))
          .limit(1);
        
        if (!l2Subject) throw new Error(`Subject '${item.subject}' not found. Please populate Level 2 manually.`);

        // 2. Resolve L3 Macro Topic under L2
        const l3 = await resolveScopedTopic(tx, item.l3_topic, l2Subject.id, 3, { paper: item.paper, subject: item.subject });

        // 3. Resolve L4 Micro Topic under L3
        const l4 = await resolveScopedTopic(tx, item.l4_topic, l3.id, 4, { paper: item.paper, subject: item.subject });

        // 4. Insert Main Question
        const [question] = await tx.insert(prelimQuestions).values({
          paper: item.paper,
          year: item.year,
          source: item.source,
          questionType: item.question_type,
          questionText: item.question_text,
          optionA: item.options.A,
          optionB: item.options.B,
          optionC: item.options.C,
          optionD: item.options.D,
          correctOption: item.correct_option,
          weightage: item.metadata.weightage,
          complexity: item.metadata.complexity,
        }).returning({ id: prelimQuestions.id });

        // 5. Insert Statements (if type: 'statements')
        if (item.question_type === 'statements' && item.statements) {
          await tx.insert(prelimQuestionStatements).values(
            item.statements.map((s: any) => ({
              questionId: question.id,
              statementNumber: s.number,
              statementText: s.text,
              correctTruth: s.is_true
            }))
          );
        }

        // 6. Final Topic Mapping (Linked to the deepest resolved node - L4)
        await tx.insert(prelimQuestionTopics).values({
          questionId: question.id,
          topicId: l4.id
        });

        results.push(question.id);
      }
      
      revalidatePath("/admin/quiz");
      return { success: true, count: results.length };
    });
  } catch (error: any) {
    console.error("Bulk Import Critical Failure:", error);
    return { success: false, error: error.message };
  }
}