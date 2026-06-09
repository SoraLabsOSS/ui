"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Prompts Google One Tap on the client. Must not run in a Server Component —
 * the GIS SDK requires `window` and a mounted DOM.
 *
 * @see https://better-auth.com/docs/plugins/one-tap
 */
export function GoogleOneTap() {
  const router = useRouter();

  useEffect(() => {
    authClient
      .oneTap({
        fetchOptions: {
          onSuccess: () => {
            router.refresh();
          },
        },
      })
      .catch(() => {
        // One Tap may be dismissed, blocked, or unavailable — sign-in form remains.
      });
  }, [router]);

  return null;
}
