import { prefetchSession } from "@better-auth-ui/react/server";
import { dehydrate } from "@tanstack/react-query";
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";
import { Providers } from "./providers";

/**
 * Reads `headers()` to prefetch the session server-side, so `Providers`
 * hydrates instead of `AuthProvider` refetching on mount. Isolated in its
 * own async Server Component so this runtime data access can be deferred
 * behind `<Suspense>` in the root layout, keeping the rest of the shell
 * prerenderable under Cache Components.
 *
 * Anonymous visitors (no session cookie) skip the prefetch entirely — no
 * better-auth call, no dehydrate — which keeps per-request CPU near zero
 * for the vast majority of traffic.
 */
export async function AuthSessionProviders({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();

  if (!getSessionCookie(requestHeaders)) {
    return <Providers>{children}</Providers>;
  }

  const { auth } = await import("@/lib/auth");
  const queryClient = getQueryClient();
  await prefetchSession(queryClient, auth, { headers: requestHeaders });

  return (
    <Providers dehydratedState={dehydrate(queryClient)}>{children}</Providers>
  );
}
