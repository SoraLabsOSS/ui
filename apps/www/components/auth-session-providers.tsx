import { prefetchSession } from "@better-auth-ui/react/server";
import { dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";
import { Providers } from "./providers";

/**
 * Reads `headers()` to prefetch the session server-side, so `Providers`
 * hydrates instead of `AuthProvider` refetching on mount. Isolated in its
 * own async Server Component so this runtime data access can be deferred
 * behind `<Suspense>` in the root layout, keeping the rest of the shell
 * prerenderable under Cache Components.
 */
export async function AuthSessionProviders({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = getQueryClient();
  await prefetchSession(queryClient, auth, { headers: await headers() });

  return (
    <Providers dehydratedState={dehydrate(queryClient)}>{children}</Providers>
  );
}
