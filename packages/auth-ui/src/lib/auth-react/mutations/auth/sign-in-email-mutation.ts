import {
  mutationOptions,
  type QueryClient,
  useMutation,
} from "@tanstack/react-query";
import {
  authMutationKeys,
  authQueryKeys,
} from "@workspace/auth-ui/lib/auth-core";
import type { BetterFetchError } from "better-auth/react";

import type { AuthClient } from "../../lib/auth-client";

export type SignInEmailParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["email"]
>[0];

export type SignInEmailOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signInEmailOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>;

/**
 * Mutation options factory for email/password sign-in.
 *
 * The returned `mutationKey` (`authMutationKeys.signIn.email`) is stable and
 * can be passed to `useIsMutating` or matched inside a global
 * `MutationCache` observer for toast handling.
 *
 * @param authClient - The Better Auth client.
 */
export function signInEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signIn.email;

  const mutationFn = (params: SignInEmailParams<TAuthClient>) =>
    authClient.signIn.email({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true },
    });

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn,
  });
}

/**
 * Create a mutation for email/password sign-in.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInEmailOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInEmailOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session],
      },
    },
    queryClient
  );
}
