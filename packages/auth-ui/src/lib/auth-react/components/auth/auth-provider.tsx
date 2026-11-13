"use client";

import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";
import { deepmerge, defaultAuthConfig } from "@workspace/auth-ui/lib/auth-core";
import type {
  AdditionalField,
  AuthConfig,
  DeepPartial,
} from "@workspace/auth-ui/lib/auth-core";
import { useContext, useMemo } from "react";
import type { PropsWithChildren, ReactNode } from "react";

import type { AuthClient } from "../../lib/auth-client";
import { MutationInvalidator } from "../mutation-invalidator";
import { AuthContext } from "./auth-context";
import { FetchOptionsProvider } from "./fetch-options-provider";

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

declare module "@workspace/auth-ui/lib/auth-core" {
  interface AuthConfig {
    /**
     * The auth client to use for the authentication context.
     * @remarks `AuthClient`
     */
    authClient: AuthClient;
  }

  /** Widen `AdditionalField.label` to `ReactNode` in the React package. */
  interface AdditionalFieldRegister {
    label: ReactNode;
  }
}

export type AuthProviderProps<TAuthClient = AuthClient> = PropsWithChildren<
  DeepPartial<AuthConfig>
> & {
  authClient: TAuthClient;
  navigate: (options: { to: string; replace?: boolean }) => void;
  /** TanStack QueryClient to use for your application's queries */
  queryClient?: QueryClient;
};

/**
 * Provides merged authentication configuration and a resolved React Query client to descendant components.
 *
 * The component merges the provided auth config with the library defaults, updates `redirectTo` from the
 * current URL when the app is hydrated, wires a QueryClient (prop, context, or fallback) and installs an
 * error handler that surfaces query errors via the configured toast. It then supplies the merged config
 * via AuthContext and wraps children with QueryClientProvider.
 *
 * @returns The children wrapped with AuthContext.Provider and QueryClientProvider configured for auth.
 */
export function AuthProvider({
  children,
  queryClient,
  ...config
}: AuthProviderProps) {
  const { authClient, ...partialConfig } = config;
  const mergedConfig = useMemo(() => {
    const merged = {
      ...deepmerge<Omit<AuthConfig, "authClient" | "Link">>(
        defaultAuthConfig,
        partialConfig
      ),
      authClient,
    } as AuthConfig;

    merged.redirectTo =
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search)
          .get("redirectTo")
          ?.trim()) ||
      merged.redirectTo;

    // Merge plugin-contributed `additionalFields` with user-supplied ones.
    // Plugin order is preserved; user-supplied entries with the same `name`
    // override the plugin contribution.
    const fieldsByName = new Map<string, AdditionalField>();
    for (const plugin of merged.plugins ?? []) {
      for (const field of plugin.additionalFields ?? []) {
        fieldsByName.set(field.name, field);
      }
    }
    for (const field of merged.additionalFields ?? []) {
      fieldsByName.set(field.name, field);
    }
    merged.additionalFields = [...fieldsByName.values()];
    return merged;
  }, [authClient, partialConfig]);

  const contextQueryClient = useContext(QueryClientContext);

  return (
    <QueryClientProvider
      client={queryClient || contextQueryClient || fallbackQueryClient}
    >
      <AuthContext.Provider value={mergedConfig}>
        <FetchOptionsProvider>
          <MutationInvalidator />

          {children}
        </FetchOptionsProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Accesses the current authentication configuration from AuthContext.
 *
 * UI packages widen the plugin type globally via the `Register` interface
 * (see module augmentation in `@better-auth-ui/heroui`), so callers don't
 * need to pass a generic.
 *
 * @returns The merged authentication configuration provided by AuthProvider.
 * @throws {Error} If no AuthProvider is present in the component tree.
 */
export function useAuth(): AuthConfig {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required");
  }

  return context;
}
