import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "./schema/index";

/**
 * Connection via Supabase Transaction Pooler (port 6543).
 * Recommended for serverless/edge environments (Next.js App Router, etc.)
 * to avoid exhausting database connections.
 *
 * For migrations (drizzle-kit), use a direct connection (port 5432).
 */
const client = postgres(env.DATABASE_URL, {
  // Disable prefetch for serverless/edge compatibility
  prepare: false,
});

export const db = drizzle({ client, schema });
export type Database = typeof db;
