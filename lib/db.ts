import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema'; // Import the schema we just created

if (!process.env.POSTGRES_URL) {
  throw new Error("🔴 FATAL ERROR: process.env.POSTGRES_URL is undefined.");
}

// Singleton pattern for Next.js Fast Refresh
// (Keeps your existing connection logic, just adds Drizzle)
const globalForPg = global as unknown as { pool: Pool };

export const pool = globalForPg.pool || new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Needed for many cloud PG providers (Supabase/Neon)
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

// Initialize Drizzle with the schema
export const db = drizzle(pool, { schema });

// Helper for raw queries (legacy support if you still need it)
export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};