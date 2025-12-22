import { pgTable, text, timestamp, boolean, pgEnum, varchar, bigint } from 'drizzle-orm/pg-core';

// 1. Define Enums
// Based on your requirement: "role (ENUM: admin/user)"
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// 2. USERS Table
// strictly based on the columns you listed:
// - uid (PK), role, subscription_id, email, phone, telegram_username, 
// - full_name, avatar_url, allow_sms, allow_telegram, allow_email, timestamps
export const users = pgTable('users', {
  uid: varchar('uid', { length: 128 }).primaryKey(), // Firebase UID is the Primary Key
  
  // Profile Information
  email: text('email'), // Nullable as per requirement
  fullName: text('full_name'), // Nullable
  phone: varchar('phone', { length: 20 }).unique(), // Unique & Nullable
  avatarUrl: text('avatar_url'), // Nullable
  
  // Roles & Permissions
  role: userRoleEnum('role').default('user'),
  
  // Subscriptions & Integrations
  subscriptionId: bigint('subscription_id', { mode: 'number' }), // Nullable
  telegramUsername: text('telegram_username'), // Nullable
  
  // Notification Preferences
  allowSms: boolean('allow_sms').default(false),
  allowTelegram: boolean('allow_telegram').default(false),
  allowEmail: boolean('allow_email').default(true),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
