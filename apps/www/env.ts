import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    /** Transaction pooler (port 6543) — used by @workspace/db at runtime */
    DATABASE_URL: z.url(),
    /** Direct connection (port 5432) — drizzle-kit migrations only */
    DATABASE_URL_DIRECT: z.url().optional(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },

  emptyStringAsUndefined: true,
});
