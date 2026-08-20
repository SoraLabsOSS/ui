import "dotenv/config";

import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

// Monorepo: apps/www/.env is the primary env file for local dev.
config({ path: resolve(process.cwd(), "../apps/www/.env") });
config();

const migrationUrl = env.DATABASE_URL_DIRECT ?? env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_URL or DATABASE_URL_DIRECT is required for drizzle-kit commands."
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    // For migrations, use direct connection (port 5432), NOT the transaction pooler.
    // Set DATABASE_URL_DIRECT in your .env for migration commands.
    // If not set, falls back to DATABASE_URL (may work if direct URL is used).
    url: migrationUrl,
  },
});
