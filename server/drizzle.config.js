import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./db.js", // or point to a TypeScript schema if you migrate to TS
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
});