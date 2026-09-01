import { dehydrate } from "@tanstack/react-query";
import { prefetchSession } from "@workspace/auth-ui/lib/auth-react/server";
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { isAuthEnabled } from "@/env";
import { getQueryClient } from "@/lib/query-client";
import { Providers } from "./providers";

/**
 * Reads `headers()` to prefetch the session server-side, so `Providers`
 * hydrates instead of `AuthProvider` refetching on mount. Isolated in its
 * own async Server Component so this runtime data access can be deferred
 * behind `<Suspense>` in the root layout, keeping the rest of the shell
 * prerenderable under Cache Components.
 *
 * Anonymous visitors (no session cookie) or when Auth is disabled skip
 * the prefetch entirely — no headers() call, no better-auth call — keeping
 * Vercel Serverless Function CPU duration at 0.
 */
export async function AuthSessionProviders({
  children,
}: {
  children: ReactNode;
}) {
  if (!isAuthEnabled()) {
    return <Providers>{children}</Providers>;
  }

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
