import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    /** Pooled PostgreSQL URL for runtime connections */
    DATABASE_URL: z.url().optional(),

    /** Direct PostgreSQL URL for drizzle-kit migrations */
    DATABASE_URL_DIRECT: z.url().optional(),
  },

  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_DIRECT: process.env.DATABASE_URL_DIRECT,
  },

  emptyStringAsUndefined: true,
});
