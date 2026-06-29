import { env } from "@/env";

export const SENTRY_ENABLED = env.NODE_ENV === "production";

/** 10% performance traces in production; Sentry disabled otherwise. */
export const SENTRY_TRACES_SAMPLE_RATE = SENTRY_ENABLED ? 0.1 : 0;
