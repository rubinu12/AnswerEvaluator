// app/actions/topic-analysis.ts
"use server";

import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { v1, helpers } from "@google-cloud/aiplatform";

/* -------------------------------------------------
   Gemini Embedding Setup
-------------------------------------------------- */

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID!;
const LOCATION = "us-central1";
const MODEL_NAME = "text-embedding-004";
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

const clientOptions = {
  apiEndpoint: API_ENDPOINT,
  fallback: true,
};

const predictionServiceClient =
  new v1.PredictionServiceClient(clientOptions);

async function getEmbedding(text: string): Promise<number[]> {
  const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}`;

  const instance = helpers.toValue({
    content: text,
    task_type: "RETRIEVAL_DOCUMENT",
  });

  const [response] =
    await predictionServiceClient.predict({
      endpoint,
      instances: [instance!],
      parameters: helpers.toValue({
        autoTruncate: true,
      })!,
    });

  const result = helpers.fromValue(
    response.predictions![0] as any
  ) as {
    embeddings: { values: number[] };
  };

  return result.embeddings.values;
}

/* -------------------------------------------------
   Types
-------------------------------------------------- */

export type TopicAnalysisResult = {
  original: string;
  matchedId: string | null;
  matchedName: string | null;
  similarity: number;
  status: "high" | "warning" | "cold";
};

/* -------------------------------------------------
   Topic Analysis Action
-------------------------------------------------- */

export async function analyzeTopicsAction(
  suggestions: string[],
  subjectId: string | null
): Promise<TopicAnalysisResult[]> {
  const results: TopicAnalysisResult[] = [];

  for (const text of suggestions) {
    const embedding = await getEmbedding(text);
    const vectorStr = JSON.stringify(embedding);

    /**
     * IMPORTANT:
     * - We search only CANONICAL topics
     * - We scope by subject using ancestry_path
     * - We NEVER attach here — only suggest
     */
    const matchRes = await db.execute(sql`
      SELECT
        id,
        name,
        topic_type,
        (1 - (embedding <=> ${vectorStr}::vector)) AS similarity
      FROM topics
      WHERE topic_type = 'canonical'
        ${subjectId
          ? sql`AND ancestry_path ILIKE ${`%${subjectId}%`}`
          : sql``}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 1
    `);

    const bestMatch = matchRes.rows[0] as
      | {
          id: string;
          name: string;
          similarity: number;
        }
      | undefined;

    const similarity = bestMatch
      ? Number(bestMatch.similarity)
      : 0;

    let status: "high" | "warning" | "cold";

    if (similarity >= 0.92) {
      status = "high";
    } else if (similarity < 0.7) {
      status = "cold";
    } else {
      status = "warning";
    }

    results.push({
      original: text,
      matchedId: bestMatch?.id ?? null,
      matchedName: bestMatch?.name ?? null,
      similarity,
      status,
    });
  }

  return results;
}
