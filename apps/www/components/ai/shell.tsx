"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAskAiPath } from "./is-ask-ai-path";
import { aiChatOpenStore } from "./open-store";

const AISearchRootLazy = dynamic(
  () => import("./search").then((mod) => mod.AISearchRootComponent),
  { ssr: false }
);

/**
 * Single Ask AI instance for the whole app — lives in the doc layout.
 * Hidden on home, settings, and auth.
 * Loaded dynamically so that AI SDK, chat runtime, and markdown AST
 * parsers are completely excluded from the initial critical JS bundle.
 */
export function AISearchRoot() {
  const pathname = usePathname();
  const supported = isAskAiPath(pathname);

  // The store outlives this provider, so close the panel whenever we land on
  // a page without Ask AI — otherwise navigating back would resurrect it.
  useEffect(() => {
    if (!supported) {
      aiChatOpenStore.setOpen(false);
    }
  }, [supported]);

  // Leaving the doc layout unmounts the provider entirely (home, auth, …).
  useEffect(() => () => aiChatOpenStore.setOpen(false), []);

  if (!supported) {
    return null;
  }

  return <AISearchRootLazy />;
}
