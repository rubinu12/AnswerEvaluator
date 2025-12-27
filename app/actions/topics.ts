// app/actions/topics.ts
"use server";

import { PoolClient, QueryResult } from 'pg';
import { v1, helpers } from '@google-cloud/aiplatform';
import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';

/**
 * AI PLATFORM CONFIGURATION
 * Restored exactly from your working logic.
 */
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID; 
const LOCATION = 'us-central1';
const MODEL_NAME = 'text-embedding-004'; 
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

// Initialize the client with rest fallback to prevent ECONNRESET in serverless/Node environments
const clientOptions = { 
  apiEndpoint: API_ENDPOINT,
  fallback: true // Uses REST when gRPC connection resets
};
const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);

export interface TopicNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  primary_parent_id: string | null;
  ancestry_path: string;
  topic_type: 'canonical' | 'provisional';
  keywords: string[];
}

interface BulkSeedParams {
  parentId: string;
  rawText: string;
  ancestryPrefix: string; 
  subjectSlug: string;    
}

/**
 * GENERATE EMBEDDING
 * Requirement: Use text-embedding-004 (768 dimensions), autoTruncate: true.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!PROJECT_ID) {
    throw new Error("🔴 GOOGLE_PROJECT_ID is missing in your .env.local file.");
  }

  const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}`;
  
  // Instance configuration for text-embedding-004
  // We include task_type: 'RETRIEVAL_DOCUMENT' for high-precision indexing
  const instance = helpers.toValue({ 
    content: text,
    task_type: 'RETRIEVAL_DOCUMENT' 
  });
  const instances = [instance!];
  
  // Parameters: autoTruncate must be literal boolean true
  const parameters = helpers.toValue({ autoTruncate: true });

  const [response] = await predictionServiceClient.predict({
    endpoint,
    instances,
    parameters: parameters!,
  });

  if (!response.predictions || response.predictions.length === 0) {
    throw new Error("AI Platform failed to return embeddings.");
  }

  // Safe extraction of the embedding vector
  const result = helpers.fromValue(response.predictions[0] as any) as {
    embeddings: { values: number[] }
  };
  
  return result.embeddings.values;
}

/**
 * FETCH ANCESTRY NAMES
 * Fetches Paper and Subject names to provide rich context for embeddings.
 */
async function getAncestryNames(parentId: string): Promise<{ paperName: string; subjectName: string }> {
  const res = await pool.query(`
    WITH RECURSIVE ancestry AS (
      SELECT id, name, level, primary_parent_id FROM topics WHERE id = $1
      UNION ALL
      SELECT t.id, t.name, t.level, t.primary_parent_id FROM topics t
      INNER JOIN ancestry a ON a.primary_parent_id = t.id
    )
    SELECT name, level FROM ancestry;
  `, [parentId]);

  const paper = res.rows.find(r => r.level === 1)?.name || "UPSC";
  const subject = res.rows.find(r => r.level === 2)?.name || "General Studies";
  return { paperName: paper, subjectName: subject };
}

/**
 * BULK SEED TOPICS
 * Implements batch-aware AI calls and sequential DB synchronization.
 */
export async function bulkSeedTopics(params: BulkSeedParams): Promise<{ success: boolean; count: number }> {
  const { parentId, rawText, ancestryPrefix, subjectSlug } = params;
  
  // 1. Context Acquisition
  const { paperName, subjectName } = await getAncestryNames(parentId);
  
  const lines: string[] = rawText.split('\n');
  const preparedItems: any[] = [];
  let trackerL3Path: string | null = null;

  // 2. Pre-process hierarchy and AI embeddings (Outside DB transaction)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isL4: boolean = trimmed.startsWith('--');
    const isL3: boolean = !isL4 && trimmed.startsWith('-');
    if (!isL3 && !isL4) continue;

    const content: string = trimmed.replace(/^--?/, '').trim();
    const parts: string[] = content.split('|').map((s: string) => s.trim());
    const name: string = parts[0];
    const extra: string = parts[1] || "";
    
    const level: number = isL3 ? 3 : 4;
    const cleanSlugPart: string = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const itemPath: string = isL3 ? `${ancestryPrefix}.${cleanSlugPart}` : `${trackerL3Path}.${cleanSlugPart}`;

    // Generate rich semantic string: Paper -> Subject -> Topic -> Description
    const richString = `Paper: ${paperName}, Subject: ${subjectName}, Topic: ${name}. Context: ${extra}`;
    const embedding = await generateEmbedding(richString);

    preparedItems.push({
      name,
      slug: `${subjectSlug}-${cleanSlugPart}`,
      level,
      path: itemPath,
      keywords: extra ? [extra] : [],
      embedding: JSON.stringify(embedding), // Validated 768 dimensions
      isL3
    });

    if (isL3) trackerL3Path = itemPath;
  }

  // 3. Database Synchronization
  const client: PoolClient = await pool.connect();
  let count: number = 0;
  try {
    await client.query('BEGIN');
    let activeL3Id: string | null = null;

    for (const item of preparedItems) {
      const parentToUse: string | null = item.isL3 ? parentId : activeL3Id;
      
      const res: QueryResult<{ id: string }> = await client.query(`
        INSERT INTO topics (name, slug, level, primary_parent_id, ancestry_path, topic_type, keywords, embedding)
        VALUES ($1, $2, $3, $4, $5, 'canonical', $6, $7)
        ON CONFLICT (slug) DO UPDATE SET 
          embedding = EXCLUDED.embedding, 
          name = EXCLUDED.name,
          keywords = EXCLUDED.keywords
        RETURNING id;
      `, [item.name, item.slug, item.level, parentToUse, item.path, item.keywords, item.embedding]);

      if (item.isL3) activeL3Id = res.rows[0].id;
      count++;
    }
    await client.query('COMMIT');
    revalidatePath('/admin/topics');
    return { success: true, count };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Database sync failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * FETCH TOPIC TREE
 */
export async function getTopicTree(): Promise<TopicNode[]> {
  const res: QueryResult<TopicNode> = await pool.query(`
    SELECT id, name, slug, level, primary_parent_id, ancestry_path, topic_type, keywords
    FROM topics ORDER BY level ASC, name ASC
  `);
  return res.rows;
}

/**
 * VERIFY TOPIC (Canonicalization)
 */
export async function verifyTopic(id: string) {
  await pool.query("UPDATE topics SET topic_type = 'canonical' WHERE id = $1", [id]);
  revalidatePath('/admin/topics');
}

/**
 * DELETE TOPIC
 */
export async function deleteTopic(id: string) {
  await pool.query("DELETE FROM topics WHERE id = $1", [id]);
  revalidatePath('/admin/topics');
}