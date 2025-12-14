// lib/db.ts
import { Pool } from 'pg';

// 1. Strict Check
if (!process.env.POSTGRES_URL) {
  throw new Error(
    "🔴 FATAL ERROR: process.env.POSTGRES_URL is undefined. \n" +
    "Check your .env.local file. It must contain POSTGRES_URL=postgresql://..."
  );
}

console.log("🟢 Database connecting to:", process.env.POSTGRES_URL.split('@')[1]); // Log only the host part for security

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};