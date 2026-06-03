import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    // For migrations, use direct connection (port 5432), NOT the transaction pooler.
    // Set DATABASE_URL_DIRECT in your .env for migration commands.
    // If not set, falls back to DATABASE_URL (may work if direct URL is used).
    url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL,
  },
});
