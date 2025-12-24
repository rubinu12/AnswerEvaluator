"use server";

import { db } from "@/lib/db";
import { 
  prelimQuestions, 
  prelimQuestionStatements, 
  prelimQuestionPairs,
  prelimQuestionTopics, 
  topics 
} from "@/lib/schema";
import { v1, helpers } from '@google-cloud/aiplatform';
import { sql, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL_NAME = 'text-embedding-004';
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

const clientOptions = { apiEndpoint: API_ENDPOINT, fallback: true };
const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);

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
 * Resolves a list of suggested topics against the database.
 * Returns metadata for the UI to display confidence colors.
 */
export async function analyzeTopicsAction(suggestions: string[], subjectId: string | null) {
  const results = [];
  for (const text of suggestions) {
    const embedding = await getEmbedding(text);
    const vectorStr = JSON.stringify(embedding);

    // Scoped search: find matches within the specified subject if provided
    const matchRes = await db.execute(sql`
      SELECT id, name, topic_type, (1 - (embedding <=> ${vectorStr}::vector)) as similarity
      FROM topics
      ${subjectId ? sql`WHERE primary_parent_id = ${subjectId}` : sql``}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 1
    `);

    const bestMatch = matchRes.rows[0];
    const similarity = bestMatch ? Number(bestMatch.similarity) : 0;

    results.push({
      original: text,
      matchedId: bestMatch?.id || null,
      matchedName: bestMatch?.name || "No Match Found",
      similarity,
      // Logic: < 0.10 is Cold Start, >= 0.92 is High Confidence
      status: similarity >= 0.92 ? 'high' : similarity < 0.10 ? 'cold' : 'warning'
    });
  }
  return results;
}

export async function commitBatchAction(jsonBatch: any[]) {
  try {
    return await db.transaction(async (tx) => {
      for (const item of jsonBatch) {
        const [question] = await tx.insert(prelimQuestions).values({
          paper: item.meta.paper,
          year: item.meta.year,
          source: item.meta.source,
          questionType: item.meta.question_type,
          questionText: item.question.question_text,
          optionA: item.question.options.find((o: any) => o.label === 'A')?.text,
          optionB: item.question.options.find((o: any) => o.label === 'B')?.text,
          optionC: item.question.options.find((o: any) => o.label === 'C')?.text,
          optionD: item.question.options.find((o: any) => o.label === 'D')?.text,
          correctOption: item.question.correct_option,
          weightage: item.question.weightage,
        }).returning({ id: prelimQuestions.id });

        if (item.meta.question_type === 'statement') {
          await tx.insert(prelimQuestionStatements).values(
            item.question.statements.map((s: any) => ({
              questionId: question.id,
              statementNumber: s.idx,
              statementText: s.text,
              correctTruth: s.is_statement_true
            }))
          );
        } else if (item.meta.question_type === 'pair') {
          await tx.insert(prelimQuestionPairs).values(
            item.question.pairs.map((p: any) => ({
              questionId: question.id,
              col1: p.col_1,
              col2: p.col_2,
              correctMatch: p.is_correct ? 'TRUE' : 'FALSE'
            }))
          );
        }

        // Link resolved topics
        for (const t of item.resolvedTopics) {
          if (t.matchedId) {
            await tx.insert(prelimQuestionTopics).values({
              questionId: question.id,
              topicId: t.matchedId
            });
          }
        }
      }
      revalidatePath("/admin/prelims");
      return { success: true };
    });
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}