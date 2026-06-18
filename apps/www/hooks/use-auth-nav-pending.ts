"use client";

import { useSession } from "@better-auth-ui/react";
import { useClientMounted } from "@workspace/auth-ui/hooks/use-client-mounted";
import { authClient } from "@/lib/auth-client";

/** True until client mount and session resolution — keeps auth nav markup stable for SSR. */
export function useAuthNavPending() {
  const mounted = useClientMounted();
  const { isPending: sessionPending } = useSession(authClient);

  return !mounted || sessionPending;
}
