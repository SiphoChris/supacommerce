import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit configuration for supacommerce.
 *
 * Rename this file to drizzle.config.ts and set your DATABASE_URL.
 *
 * Your DATABASE_URL is the direct connection string from your Supabase
 * project settings: Project Settings → Database → Connection string → URI
 *
 * ⚠️  Use the direct connection (port 5432), not the pooler, for migrations.
 *
 * After configuration, run:
 *   pnpm db:generate   — generate SQL migration files from schema changes
 *   pnpm db:migrate    — apply migrations locally (requires local Supabase)
 *   pnpm db:push:remote — push to your hosted Supabase project
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/ecommerce/schema/*.ts",
  out: "./supabase/migrations",
  dbCredentials: {
    url: process.env["DATABASE_URL"]!,
  },
  verbose: true,
  strict: true,
})
