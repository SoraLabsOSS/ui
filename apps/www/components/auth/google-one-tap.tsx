"use client";

import { useGoogleOneTapPendingControls } from "@workspace/auth-ui/context/google-one-tap-pending";
import { useAuthRedirectTo } from "@workspace/auth-ui/hooks/use-auth-redirect-to";
import { useAuth } from "@workspace/auth-ui/lib/auth-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { authClient, oneTapGisOptions } from "@/lib/auth-client";

const GIS_IFRAME_SELECTOR = 'iframe[src*="accounts.google.com/gsi/"]';

function applyOneTapChromeStyles(element: HTMLElement, isDark: boolean) {
  element.style.setProperty("background", "transparent", "important");
  element.style.setProperty("background-color", "transparent", "important");

  if (isDark) {
    element.style.setProperty("color-scheme", "light");
  } else {
    element.style.removeProperty("color-scheme");
  }
}

/** Sync styles on GIS-injected nodes (desktop prompt + mobile bottom sheet). */
function syncOneTapPickerChrome(isDark: boolean) {
  const container = document.getElementById("credential_picker_container");

  if (container instanceof HTMLElement) {
    applyOneTapChromeStyles(container, isDark);

    for (const node of container.querySelectorAll<HTMLElement>("*")) {
      applyOneTapChromeStyles(node, isDark);
    }
  }

  for (const iframe of document.querySelectorAll<HTMLIFrameElement>(
    GIS_IFRAME_SELECTOR
  )) {
    applyOneTapChromeStyles(iframe, isDark);
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
  const syncFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!(themeReady && resolvedTheme)) {
      return;
    }

    const scheduleSync = () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }

      syncFrameRef.current = requestAnimationFrame(() => {
        syncFrameRef.current = null;
        syncOneTapPickerChrome(isDark);
      });
    };

    scheduleSync();

    const observer = new MutationObserver(scheduleSync);

    observer.observe(document.body, {
      attributeFilter: ["style", "class"],
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();

      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }
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
        // Plugin config ignores this — must pass per call (Better Auth reads `opts` only).
        cancelOnTapOutside: false,
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
