import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

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
    /**
     * Vercel AI Gateway key for /api/chat (local + non-Vercel).
     * On Vercel production, OIDC can authenticate without this.
     * Create at https://vercel.com/account/ai
     */
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),
    /** Cloudflare AI Search OpenAI-compatible chat endpoint */
    AI_SEARCH_CHAT_URL: z.url(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    /** Sentinel KV identify endpoint — Better Auth Cloud dashboard project URL. Used by both the server (kvUrl) and the browser client (identifyUrl); not a secret. */
    NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL: z.url().optional(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL:
      process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
  },

  emptyStringAsUndefined: true,
});
