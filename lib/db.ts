// lib/db.ts
import { Pool, QueryResult } from 'pg';

if (!process.env.POSTGRES_URL) {
  throw new Error("🔴 FATAL ERROR: process.env.POSTGRES_URL is undefined.");
}

// Singleton pattern for Next.js Fast Refresh
const globalForPg = global as unknown as { pool: Pool };

export const pool = globalForPg.pool || new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Max 10 simultaneous connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};