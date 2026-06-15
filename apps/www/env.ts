import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    /** Transaction pooler (port 6543) — used by @workspace/db at runtime */
    DATABASE_URL: z.url(),
    /** Direct connection (port 5432) — drizzle-kit migrations only */
    DATABASE_URL_DIRECT: z.url().optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    BETTER_AUTH_API_KEY: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },

  emptyStringAsUndefined: true,
});
