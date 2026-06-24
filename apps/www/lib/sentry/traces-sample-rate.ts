import { env } from "@/env";

/** 10% in production, 100% otherwise. */
export const SENTRY_TRACES_SAMPLE_RATE =
  env.NODE_ENV === "production" ? 0.1 : 1.0;
