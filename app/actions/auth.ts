// app/actions/auth.ts
'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export type UserSyncData = {
  uid: string;
  email: string | null;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

export async function syncUserToPostgres(userData: UserSyncData) {
  try {
    // We use .onConflictDoUpdate to handle both "Sign Up" (Insert) 
    // and "Login" (Update) in a single robust operation.
    await db.insert(users).values({
      uid: userData.uid,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      avatarUrl: userData.avatarUrl,
      role: 'user', // Default role
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.uid, // Detect conflict on Primary Key (uid)
      set: {
        // Update these fields if user exists
        // We use || undefined to ensure we don't wipe existing data with nulls if not provided
        email: userData.email || undefined, 
        fullName: userData.fullName || undefined,
        phone: userData.phone || undefined,
        avatarUrl: userData.avatarUrl || undefined,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('🔴 Error syncing user to Postgres:', error);
    // We do NOT throw here to prevent the UI from breaking if the DB is momentarily down.
    // The Auth flow should technically succeed even if DB sync fails (eventual consistency).
    return { success: false, error: 'Database sync failed' };
  }
}