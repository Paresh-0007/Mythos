require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { pgTable, serial, varchar } = require('drizzle-orm/pg-core');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Define users table schema
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
});

module.exports = { db, users };
