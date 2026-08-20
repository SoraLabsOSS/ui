import type { createAuthClient } from "better-auth/react";

/** Vendored from @better-auth-ui/react@1.6.17 — trimmed to Sora's client surface. */
export type AuthClient = ReturnType<typeof createAuthClient>;

/**
 * Unwraps a Better Auth client method's `data` payload.
 */
export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never;
