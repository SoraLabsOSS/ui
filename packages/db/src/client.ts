import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import {
  account,
  accountRelations,
  bookmark,
  bookmarkRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./schema/index";

const schema = {
  account,
  accountRelations,
  bookmark,
  bookmarkRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
};

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

  /** Use the pooled Postgres URL at runtime; migrations use a direct URL. */
  client = postgres(env.DATABASE_URL, {
    // Keep transaction-pooler compatibility.
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
