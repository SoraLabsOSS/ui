import type {
  multiSessionClient,
  usernameClient,
} from "better-auth/client/plugins";
import type { createAuthClient } from "better-auth/react";

/** Vendored from @better-auth-ui/react@1.6.17 — trimmed to Sora's client surface. */
export type AuthClient = ReturnType<typeof createAuthClient>;

export type MultiSessionAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof multiSessionClient>] }>
>;

export type UsernameAuthClient = ReturnType<
  typeof createAuthClient<{ plugins: [ReturnType<typeof usernameClient>] }>
>;

/**
 * Unwraps a Better Auth client method's `data` payload.
 */
export type InferData<TMethod> = TMethod extends (
  ...args: infer _Args
) => Promise<infer TResult extends { data: unknown }>
  ? TResult["data"]
  : never;
