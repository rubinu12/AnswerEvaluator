// lib/schema.ts
import { 
  pgTable, text, timestamp, boolean, pgEnum, 
  varchar, bigint, integer, char, real, uuid, 
  serial, customType 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- CUSTOM TYPE: PGVECTOR (768 Dimensions) ---
// This allows Drizzle to understand the vector column used by Gemini's text-embedding-004
const vector768 = customType<{ data: number[] }>({
  dataType() {
    return 'vector(768)';
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown) {
    return JSON.parse(value as string) as number[];
  },
});

// --- 1. USERS TABLE ---
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  uid: varchar('uid', { length: 128 }).primaryKey(),
  email: text('email'),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 20 }).unique(),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user'),
  subscriptionId: bigint('subscription_id', { mode: 'number' }),
  telegramUsername: text('telegram_username'),
  allowSms: boolean('allow_sms').default(false),
  allowTelegram: boolean('allow_telegram').default(false),
  allowEmail: boolean('allow_email').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- 2. TOPICS TABLE ---
// Included: Provisional/Canonical types, Keywords array, and 768-dim Embedding
export const topics = pgTable('topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  level: integer('level'), 
  topicType: text('topic_type'), // 'canonical' | 'provisional'
  primaryParentId: uuid('primary_parent_id'),
  ancestryPath: text('ancestry_path'),
  isNavigable: boolean('is_navigable').default(true),
  keywords: text('keywords').array(), // Enabled for semantic richness
  embedding: vector768('embedding'), // Gemini 768-dimension vector
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const topicsRelations = relations(topics, ({ many }) => ({
  questionMappings: many(prelimQuestionTopics),
}));

// --- 3. PRELIM QUESTIONS (Parent) ---
export const prelimQuestions = pgTable('prelim_questions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  paper: varchar('paper', { length: 10 }),
  year: integer('year'),
  source: varchar('source', { length: 20 }),
  questionType: varchar('question_type', { length: 20 }), // 'MCQ', 'STATEMENT', 'PAIR'
  questionText: text('question_text'),
  optionA: text('option_a'),
  optionB: text('option_b'),
  optionC: text('option_c'),
  optionD: text('option_d'),
  correctOption: char('correct_option', { length: 1 }),
  weightage: varchar('weightage', { length: 10 }).default('MEDIUM'),
  complexity: real('complexity').default(0.0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const prelimQuestionsRelations = relations(prelimQuestions, ({ many }) => ({
  statements: many(prelimQuestionStatements),
  pairs: many(prelimQuestionPairs),
  topics: many(prelimQuestionTopics),
}));

// --- 4. PRELIM QUESTION STATEMENTS (Child) ---
export const prelimQuestionStatements = pgTable('prelim_question_statements', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  questionId: bigint('question_id', { mode: 'number' }).references(() => prelimQuestions.id, { onDelete: 'cascade' }),
  statementNumber: integer('statement_number'),
  statementText: text('statement_text'),
  correctTruth: boolean('correct_truth'),
});

export const prelimQuestionStatementsRelations = relations(prelimQuestionStatements, ({ one }) => ({
  question: one(prelimQuestions, {
    fields: [prelimQuestionStatements.questionId],
    references: [prelimQuestions.id],
  }),
}));

// --- 5. PRELIM QUESTION PAIRS (Child) ---
export const prelimQuestionPairs = pgTable('prelim_question_pairs', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  questionId: bigint('question_id', { mode: 'number' }).references(() => prelimQuestions.id, { onDelete: 'cascade' }),
  column1: text('column_1'),
  column2: text('column_2'),
  correctMatch: text('correct_match'),
  numColumns: integer('num_columns'),
  col1Header: text('col1_header'),
  col2Header: text('col2_header'),
  col3Header: text('col3_header'),
  col4Header: text('col4_header'),
  col1: text('col1'),
  col2: text('col2'),
  col3: text('col3'),
  col4: text('col4'),
});

export const prelimQuestionPairsRelations = relations(prelimQuestionPairs, ({ one }) => ({
  question: one(prelimQuestions, {
    fields: [prelimQuestionPairs.questionId],
    references: [prelimQuestions.id],
  }),
}));

// --- 6. TOPIC MAPPING (Many-to-Many Join Table) ---
export const prelimQuestionTopics = pgTable('prelim_question_topics', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  questionId: bigint('question_id', { mode: 'number' }).references(() => prelimQuestions.id, { onDelete: 'cascade' }),
  topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'cascade' }),
});

export const prelimQuestionTopicsRelations = relations(prelimQuestionTopics, ({ one }) => ({
  question: one(prelimQuestions, {
    fields: [prelimQuestionTopics.questionId],
    references: [prelimQuestions.id],
  }),
  topic: one(topics, {
    fields: [prelimQuestionTopics.topicId],
    references: [topics.id],
  }),
}));

// --- 7. PREDEFINED TEST SETS ---
export const predefinedTestSets = pgTable('predefined_test_sets', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: text('name'),
  questionIds: integer('question_ids').array(), 
  category: varchar('category', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});