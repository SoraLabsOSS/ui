"use client";

import { useSession } from "@better-auth-ui/react";
import { useClientMounted } from "@workspace/auth-ui/hooks/use-client-mounted";
import { authClient } from "@/lib/auth-client";

/** Persists across Nav remounts (docs ↔ blog layouts) so auth links don't re-skeleton. */
let authNavSessionKnown = false;

/** True only until the session query resolves for the first time this page load. */
export function useAuthNavPending() {
  const mounted = useClientMounted();
  const {
    data: session,
    isPending: sessionPending,
    isFetched,
  } = useSession(authClient, { refetchOnMount: false });

  if (isFetched || session !== undefined) {
    authNavSessionKnown = true;
  }

  if (authNavSessionKnown) {
    return false;
  }

  return !mounted || sessionPending;
}
