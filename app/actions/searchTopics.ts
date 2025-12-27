"use server";

import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { and, eq, ilike, or } from "drizzle-orm";

/**
 * Generic topic search utility.
 * 
 * Used for:
 * - Manual topic attachment (Prelims ingestion)
 * - Topic replacement
 * - Topic manager search
 *
 * IMPORTANT RULES:
 * - Always scoped by subject (L2)
 * - Optionally scoped by anchor (L3)
 * - Name / slug based only (no embeddings here)
 */
export async function searchTopics(params: {
  query: string;
  subjectId: string;
  anchorId?: string;
  limit?: number;
}) {
  const { query, subjectId, anchorId, limit = 20 } = params;

  if (!query || query.trim().length < 2) {
    return [];
  }

  /**
   * Base conditions:
   * - Same subject (L2 boundary)
   * - Canonical topics only (manual attach must be clean)
   */
  const baseConditions = [
    eq(topics.topicType, "canonical"),
    ilike(topics.name, `%${query}%`)
  ];

  /**
   * If anchorId is provided:
   * - Allow attaching to:
   *   1. The anchor itself (L3)
   *   2. Its direct children (L4)
   */
  const anchorCondition = anchorId
    ? or(
        eq(topics.id, anchorId),
        eq(topics.primaryParentId, anchorId)
      )
    : undefined;

  if (anchorCondition) {
    baseConditions.push(anchorCondition);
  }

  /**
   * Subject scoping:
   * We enforce this using ancestry_path to avoid accidental leakage.
   * ancestry_path always contains the subject node id.
   */
  baseConditions.push(
    ilike(topics.ancestryPath, `%${subjectId}%`)
  );

  const results = await db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
      level: topics.level,
      primary_parent_id: topics.primaryParentId,
      ancestryPath: topics.ancestryPath,
      topic_type: topics.topicType
    })
    .from(topics)
    .where(and(...baseConditions))
    .orderBy(topics.level, topics.name)
    .limit(limit);

  return results;
}
