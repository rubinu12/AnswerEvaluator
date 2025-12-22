"use server";

import { PoolClient, QueryResult } from 'pg';
import { v1, helpers } from '@google-cloud/aiplatform';
import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';

/**
 * AI PLATFORM CONFIGURATION
 * Optimized for semantic retrieval with gRPC fallback.
 */
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL_NAME = 'text-embedding-004';
const API_ENDPOINT = `${LOCATION}-aiplatform.googleapis.com`;

const clientOptions = { 
    apiEndpoint: API_ENDPOINT,
    fallback: true 
};
const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);

/**
 * INTERFACES
 */
export interface DemandInput {
    demand_text: string;
    expectation: string;
    max_marks: number;
    topic_id: string | null;
    topic_slug: string | null;
}

export interface QuestionImportParams {
    question_text: string;
    directive: string;
    marks_max: number;
    paper: string;
    subject: string;
    target_type: 'daily' | 'test' | 'pyq';
    target_metadata: {
        name?: string;
        year?: number;
        exam?: string;
    };
    primary_topic_id: string;
    secondary_topic_ids?: string[]; // Up to 3 as per business rules
    demands: DemandInput[];
}

/**
 * GENERATE EMBEDDING (Internal)
 */
async function generateEmbedding(text: string): Promise<number[]> {
    if (!PROJECT_ID) throw new Error("GOOGLE_PROJECT_ID is missing in environment.");

    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}`;
    const instance = helpers.toValue({ 
        content: text,
        task_type: 'RETRIEVAL_DOCUMENT' 
    });
    
    const [response] = await predictionServiceClient.predict({
        endpoint,
        instances: [instance!],
        parameters: helpers.toValue({ autoTruncate: true })!,
    });

    if (!response.predictions || response.predictions.length === 0) {
        throw new Error("AI Platform failed to return a prediction.");
    }

    const result = helpers.fromValue(response.predictions[0] as any) as {
        embeddings: { values: number[] }
    };
    return result.embeddings.values;
}

/**
 * FIND MATCHING TOPIC
 * Performs semantic vector search to find the closest L3/L4 node.
 */
export async function findMatchingTopic(topicName: string) {
    try {
        const vector = await generateEmbedding(`Topic: ${topicName}`);
        const res = await pool.query(`
            SELECT id, name, slug, level, ancestry_path,
                   (1 - (embedding <=> $1)) as similarity
            FROM topics
            WHERE topic_type = 'canonical'
            ORDER BY embedding <=> $1
            LIMIT 1;
        `, [JSON.stringify(vector)]);

        return res.rows[0] || null;
    } catch (error) {
        console.error("Semantic search error:", error);
        return null;
    }
}

/**
 * IMPORT QUESTION MASTER ACTION
 * Atomic transaction across questions, links, and demands.
 */
export async function importQuestionAction(params: QuestionImportParams) {
    const client: PoolClient = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. SEED QUESTIONS TABLE
        const qQuery = `
            INSERT INTO questions (
                question_text, directive, marks_max, 
                paper, subject, source_type, source_ref
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `;
        const qRes = await client.query(qQuery, [
            params.question_text,
            params.directive,
            params.marks_max,
            params.paper,
            params.subject,
            params.target_type,
            JSON.stringify(params.target_metadata)
        ]);
        const questionId = qRes.rows[0].id;

        // 2. PRIMARY TOPIC LINK
        await client.query(`
            INSERT INTO questions_topics (question_id, topic_id, role)
            VALUES ($1, $2, 'PRIMARY');
        `, [questionId, params.primary_topic_id]);

        // 3. SECONDARY TOPIC LINKS (Interdisciplinary Edge)
        if (params.secondary_topic_ids && params.secondary_topic_ids.length > 0) {
            for (const sId of params.secondary_topic_ids.slice(0, 3)) {
                await client.query(`
                    INSERT INTO questions_topics (question_id, topic_id, role)
                    VALUES ($1, $2, 'SECONDARY');
                `, [questionId, sId]);
            }
        }

        // 4. SEED DEMANDS TABLE (The Soul of Evaluation)
        for (const demand of params.demands) {
            const weightage = Math.round((demand.max_marks / params.marks_max) * 100);

            const dQuery = `
                INSERT INTO questions_demands (
                    question_id, topic_id, topic_slug, 
                    demand_text, expectation, max_marks, weightage_pct
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7);
            `;
            await client.query(dQuery, [
                questionId,
                demand.topic_id || null,
                demand.topic_slug || null,
                demand.demand_text,
                demand.expectation,
                demand.max_marks,
                weightage
            ]);
        }

        await client.query('COMMIT');
        revalidatePath('/admin/mains/questions');
        return { success: true, id: questionId };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Critical Transaction Error:", error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * FETCH BANK
 */
export async function getQuestionsForReview() {
    const res = await pool.query(`
        SELECT q.*, 
               (SELECT COUNT(*) FROM questions_demands WHERE question_id = q.id) as demand_count,
               EXISTS(SELECT 1 FROM evaluation_data WHERE question_id = q.id) as has_answer
        FROM questions q
        ORDER BY q.created_at DESC;
    `);
    return res.rows;
}

/**
 * DELETE
 */
export async function deleteQuestion(id: string) {
    await pool.query("DELETE FROM questions WHERE id = $1", [id]);
    revalidatePath('/admin/mains/questions');
    return { success: true };
}