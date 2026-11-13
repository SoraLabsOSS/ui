import path from "node:path";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Monorepo: apps/www/.env is the primary env file for local dev.
const configDirectory = import.meta.dirname;
config({ path: path.resolve(configDirectory, "../../apps/www/.env") });
config({ path: path.resolve(configDirectory, ".env") });

const migrationUrl =
  process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

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
    // Prefer the direct URL for migrations; fall back to DATABASE_URL if needed.
    url: migrationUrl,
  },
});
