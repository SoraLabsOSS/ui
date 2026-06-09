"use client";

import { useAuth } from "@better-auth-ui/react";
import { useAuthRedirectTo } from "@workspace/auth-ui/hooks/use-auth-redirect-to";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Prompts Google One Tap on the client. Must not run in a Server Component —
 * the GIS SDK requires `window` and a mounted DOM.
 *
 * When `fetchOptions.onSuccess` is set, Better Auth skips the default hard
 * redirect — navigate explicitly (same as social sign-in in auth-ui).
 *
 * @see https://better-auth.com/docs/plugins/one-tap
 */
export function GoogleOneTap() {
  const router = useRouter();
  const { baseURL, navigate } = useAuth();
  const redirectTo = useAuthRedirectTo();

  useEffect(() => {
    const callbackURL = `${baseURL}${redirectTo}`;

    authClient
      .oneTap({
        callbackURL,
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: redirectTo || "/", replace: true });
            router.refresh();
          },
        },
      })
      .catch(() => {
        // One Tap may be dismissed, blocked, or unavailable — sign-in form remains.
        console.error("One Tap error");
      });
  }, [baseURL, navigate, redirectTo, router]);

  return null;
}
