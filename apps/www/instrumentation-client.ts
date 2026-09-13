// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureRouterTransitionStart, init } from "@sentry/nextjs";
import { env } from "@/env";
import {
  SENTRY_ENABLED,
  SENTRY_TRACES_SAMPLE_RATE,
} from "@/lib/sentry/traces-sample-rate";

init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: SENTRY_ENABLED,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Ignore errors originating from browser extensions, adware, and third-party userscripts
  denyUrls: [
    /extensions\//i,
    /^chrome-extension:\/\//i,
    /^safari-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^edge-extension:\/\//i,
    /^app:\/\/\/executors/i,
  ],
});

export const onRouterTransitionStart = captureRouterTransitionStart;
