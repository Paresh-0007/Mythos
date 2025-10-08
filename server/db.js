require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { pgTable, serial, varchar, text, integer, timestamp, json } = require('drizzle-orm/pg-core');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Define users table schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
});

// Define projects table schema
const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  genre: varchar('genre', { length: 100 }),
  collaborators: json('collaborators').default([]),
  wordCount: integer('word_count').default(0),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define characters table schema
const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  traits: json('traits').default([]),
  backstory: text('backstory'),
  relationships: json('relationships').default([]),
  avatar: varchar('avatar', { length: 500 }),
  projectId: integer('project_id').references(() => projects.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define chapters table schema
const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  wordCount: integer('word_count').default(0),
  projectId: integer('project_id').references(() => projects.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define world_elements table schema
const worldElements = pgTable('world_elements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'location', 'organization', 'magic-system', 'culture', 'technology'
  description: text('description'),
  details: json('details').default({}),
  projectId: integer('project_id').references(() => projects.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define chapter_versions table schema for version control
const chapterVersions = pgTable('chapter_versions', {
  id: serial('id').primaryKey(),
  chapterId: integer('chapter_id').references(() => chapters.id).notNull(),
  version: integer('version').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  wordCount: integer('word_count').default(0),
  authorId: integer('author_id').references(() => users.id).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  changeDescription: varchar('change_description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define chat_messages table schema for project collaboration chat
const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  chapterId: integer('chapter_id').references(() => chapters.id), // null for general project chat
  userId: integer('user_id').references(() => users.id).notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  message: text('message').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('text'), // 'text', 'system', 'edit-notification'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define project_shares table schema for read-only project sharing
const projectShares = pgTable('project_shares', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  shareToken: varchar('share_token', { length: 100 }).unique().notNull(),
  accessType: varchar('access_type', { length: 20 }).default('read'), // 'read', 'comment'
  createdBy: integer('created_by').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at'), // null = no expiration
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { 
  db, 
  users, 
  projects, 
  characters, 
  chapters, 
  worldElements,
  chapterVersions,
  chatMessages,
  projectShares
};
