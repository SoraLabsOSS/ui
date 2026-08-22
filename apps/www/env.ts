import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  server: {
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    /** Transaction pooler (port 6543) — used by @workspace/db at runtime */
    DATABASE_URL: z.url().optional(),
    /** Direct connection (port 5432) — drizzle-kit migrations only */
    DATABASE_URL_DIRECT: z.url().optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    BETTER_AUTH_API_KEY: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    /**
     * Cloudflare AI Search OpenAI-compatible chat endpoint.
     * Optional: when unset, Ask AI UI should still render but will fail gracefully.
     */
    AI_SEARCH_CHAT_URL: z.url().optional(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    /** Better Auth Cloud identify endpoint — not a secret. */
    NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL: z.url().optional(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL:
      process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  },

  emptyStringAsUndefined: true,
});

/** Server-only — do not import from client components or auth-client. */
export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

/** Server-only — do not import from client components. */
export function isRedisConfigured() {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

/** Server-only — full Google OAuth (client id + secret). */
export function isGoogleAuthConfigured() {
  return Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

/** Client-safe — One Tap / GIS only needs the public client id. */
export function isGoogleOneTapConfigured() {
  return Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

/** Server-only — full GitHub OAuth (client id + secret). */
export function isGithubAuthConfigured() {
  return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

/** Server-only — Sentinel plugin (api key + identify URL). */
export function isSentinelConfigured() {
  return Boolean(
    env.BETTER_AUTH_API_KEY && env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL
  );
}

/** Client-safe — sentinelClient only needs the public identify URL. */
export function isSentinelClientConfigured() {
  return Boolean(env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL);
}

/** Dev-only fallback so `next dev` can boot without a .env file. */
export function getBetterAuthSecret() {
  if (env.BETTER_AUTH_SECRET) {
    return env.BETTER_AUTH_SECRET;
  }

  if (env.NODE_ENV === "production") {
    return;
  }

  return "local-dev-only-insecure-better-auth-secret";
}
