// app/actions/topics.ts
'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
// Use the core AI Platform SDK for Embeddings (Discriminative Model)
import { v1, helpers } from '@google-cloud/aiplatform';

const { PredictionServiceClient } = v1;

// --- 1. CONFIGURATION ---
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL_NAME = 'text-embedding-004'; // Optimized for semantic retrieval (768 dimensions)
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

// Initialize the Prediction Client
const client = new PredictionServiceClient({
  apiEndpoint: API_ENDPOINT,
});

// --- 2. HELPER: Generate Embedding ---
// Takes text, sends to Google Vertex AI, returns a vector string '[0.1, 0.2...]'
export async function generateEmbedding(text: string): Promise<string | null> {
  if (!text) return null;
  
  try {
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}`;
    
    // Construct the instance using the 'helpers' utility
    const instance = helpers.toValue({
      content: text,
      task_type: 'SEMANTIC_SIMILARITY',
    });

    const [response] = await client.predict({
      endpoint,
      instances: [instance!],
    });

    const predictions = response.predictions;
    if (!predictions || predictions.length === 0) return null;

    // Extract the vector values from the Protobuf response
    const embeddingStruct = predictions[0].structValue?.fields?.embeddings?.structValue?.fields?.values?.listValue?.values;
    
    if (!embeddingStruct) return null;

    // Convert Protobuf number values to a plain JS array
    const vector = embeddingStruct.map((v) => v.numberValue || 0);

    // Return as JSON string for Postgres vector format
    return JSON.stringify(vector);

  } catch (error) {
    console.error("⚠️ Vertex AI Embedding Error:", error);
    return null; // Fail gracefully so we can still save the topic without AI
  }
}

// --- 3. ACTION: Get List ---
export async function getTopicList() {
  const res = await query(`
    SELECT id, paper, subject, name, parent_id, slug, keywords 
    FROM topics 
    ORDER BY paper, subject, name
  `);
  return res.rows;
}

// --- 4. ACTION: Add Single Topic ---
export async function addTopic(formData: FormData) {
  const paper = formData.get('paper') as string;
  const subject = formData.get('subject') as string;
  const name = formData.get('name') as string;
  const parentId = formData.get('parentId') as string || null;
  
  // Parse Keywords (Comma separated string -> Array)
  const rawKeywords = formData.get('keywords') as string || '';
  const keywordsArray = rawKeywords.split(',').map(s => s.trim()).filter(s => s.length > 0);

  // Generate Slug
  const rawSlug = `${paper}-${subject}-${name}`.toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // Generate AI Context: Name + Keywords
  const contextText = `${paper} ${subject} ${name}. ${keywordsArray.join('. ')}`;
  const embedding = await generateEmbedding(contextText);

  try {
    await query(
      `INSERT INTO topics (paper, subject, name, keywords, parent_id, slug, embedding) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO NOTHING`,
      [paper, subject, name, keywordsArray, parentId, slug, embedding]
    );
    revalidatePath('/admin/topics');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 5. ACTION: Update Topic (Edit Mode) ---
export async function updateTopic(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const paper = formData.get('paper') as string; 
  const subject = formData.get('subject') as string; 
  
  const rawKeywords = formData.get('keywords') as string || '';
  const keywordsArray = rawKeywords.split(',').map(s => s.trim()).filter(s => s.length > 0);

  // Re-generate Embedding because meaning/keywords changed
  const contextText = `${paper} ${subject} ${name}. ${keywordsArray.join('. ')}`;
  const embedding = await generateEmbedding(contextText);

  try {
    // Note: We typically don't update parent_id via edit to avoid circular tree issues, 
    // but you can add it if needed.
    await query(
      `UPDATE topics 
       SET name = $1, keywords = $2, embedding = $3 
       WHERE id = $4`,
      [name, keywordsArray, embedding, id]
    );
    revalidatePath('/admin/topics');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 6. ACTION: Bulk Add (Parallel AI Processing) ---
export async function bulkAddTopics(topicsData: any[]) {
  try {
    let successCount = 0;

    await Promise.all(
      topicsData.map(async (topic) => {
        const rawSlug = `${topic.paper}-${topic.subject}-${topic.name}`.toLowerCase();
        const slug = rawSlug.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        // Handle Keywords safely (check if array or string)
        let kws: string[] = [];
        if (Array.isArray(topic.keywords)) {
            kws = topic.keywords;
        } else if (typeof topic.keywords === 'string') {
            kws = topic.keywords.split(',').map((s: string) => s.trim());
        }

        const contextText = `${topic.paper} ${topic.subject} ${topic.name}. ${kws.join('. ')}`;
        const embedding = await generateEmbedding(contextText);

        await query(
          `INSERT INTO topics (paper, subject, name, keywords, parent_id, slug, embedding) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (slug) DO NOTHING`,
          [topic.paper, topic.subject, topic.name, kws, topic.parentId || null, slug, embedding]
        );
        successCount++;
      })
    );

    revalidatePath('/admin/topics');
    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Bulk Import Failed:", error);
    return { success: false, error: error.message };
  }
}

// --- 7. ACTION: Semantic Search Resolver ---
// Used by Question Bank to auto-link "Governor" text to UUID
export async function findClosestTopic(queryText: string) {
  const embedding = await generateEmbedding(queryText);
  
  if (!embedding) return null;

  // The <=> operator is "Cosine Distance" in pgvector
  const res = await query(`
    SELECT id, name, paper, subject, slug, 
    1 - (embedding <=> $1) as similarity
    FROM topics
    ORDER BY embedding <=> $1
    LIMIT 1
  `, [embedding]);

  return res.rows[0] || null;
}

// --- 8. ACTION: Delete ---
export async function deleteTopic(id: string) {
  try {
    await query(`DELETE FROM topics WHERE id = $1`, [id]);
    revalidatePath('/admin/topics');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}