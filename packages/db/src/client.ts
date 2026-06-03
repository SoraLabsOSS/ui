import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Connection via Supabase Transaction Pooler (port 6543).
 * Recommended for serverless/edge environments (Next.js App Router, etc.)
 * to avoid exhausting database connections.
 *
 * For migrations (drizzle-kit), use a direct connection (port 5432).
 */
const client = postgres(process.env.DATABASE_URL, {
  // Disable prefetch for serverless/edge compatibility
  prepare: false,
});

export const db = drizzle({ client, schema });
export type Database = typeof db;
