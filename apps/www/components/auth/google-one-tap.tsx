"use client";

import { useAuth } from "@better-auth-ui/react";
import { useGoogleOneTapPendingControls } from "@workspace/auth-ui/context/google-one-tap-pending";
import { useAuthRedirectTo } from "@workspace/auth-ui/hooks/use-auth-redirect-to";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { authClient, oneTapGisOptions } from "@/lib/auth-client";

function syncOneTapPickerChrome(isDark: boolean) {
  const container = document.getElementById("credential_picker_container");
  if (!container) {
    return;
  }

  container.style.background = "transparent";

  if (isDark) {
    container.style.colorScheme = "light";
  } else {
    container.style.removeProperty("color-scheme");
  }

  const iframe = container.querySelector("iframe");
  if (!(iframe instanceof HTMLIFrameElement)) {
    return;
  }

  iframe.style.background = "transparent";

  if (isDark) {
    iframe.style.colorScheme = "light";
  } else {
    iframe.style.removeProperty("color-scheme");
  }
}

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
  const { setIsPending } = useGoogleOneTapPendingControls();
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!(themeReady && resolvedTheme)) {
      return;
    }

    syncOneTapPickerChrome(isDark);

    const observer = new MutationObserver(() => {
      syncOneTapPickerChrome(isDark);
    });

    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, [isDark, resolvedTheme, themeReady]);

  useEffect(() => {
    if (!(themeReady && resolvedTheme) || hasPromptedRef.current) {
      return;
    }

    hasPromptedRef.current = true;
    oneTapGisOptions.color_scheme = isDark ? "dark" : "light";

    const callbackURL = `${baseURL}${redirectTo}`;

    authClient
      .oneTap({
        callbackURL,
        fetchOptions: {
          onRequest: () => {
            setIsPending(true);
          },
          onSuccess: () => {
            setIsPending(false);
            navigate({ to: redirectTo, replace: true });
            router.refresh();
          },
          onError: () => {
            setIsPending(false);
          },
        },
      })
      .catch(() => {
        setIsPending(false);
      });
  }, [
    baseURL,
    isDark,
    navigate,
    redirectTo,
    resolvedTheme,
    router,
    setIsPending,
    themeReady,
  ]);

  return null;
}
