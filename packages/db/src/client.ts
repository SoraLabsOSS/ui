import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "./schema/index";

export type Database = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | undefined;
let dbInstance: Database | undefined;

function getDbInstance(): Database {
  if (dbInstance) {
    return dbInstance;
  }

  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Database features (auth, bookmarks) require Postgres."
    );
  }

  /**
   * Connection via Supabase Transaction Pooler (port 6543).
   * Recommended for serverless/edge environments (Next.js App Router, etc.)
   * to avoid exhausting database connections.
   *
   * For migrations (drizzle-kit), use a direct connection (port 5432).
   */
  client = postgres(env.DATABASE_URL, {
    // Disable prefetch for serverless/edge compatibility
    prepare: false,
  });
  dbInstance = drizzle({ client, schema });
  return dbInstance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDbInstance(), prop, receiver);
  },
});
