"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isAskAiPath } from "./is-ask-ai-path";

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

  if (!isAskAiPath(pathname)) {
    return null;
  }

  return <AISearchRootLazy />;
}
