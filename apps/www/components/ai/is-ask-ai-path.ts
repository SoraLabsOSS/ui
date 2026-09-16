const HIDE_ASK_AI_PREFIXES = ["/auth"] as const;

export function isAskAiPath(pathname: string) {
  if (pathname === "/") {
    return false;
  }

  // Hide Ask AI on catalog slug pages (/catalog/[slug], /components/[slug])
  if (pathname.startsWith("/catalog/") || pathname.startsWith("/components/")) {
    return false;
  }

  return !HIDE_ASK_AI_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
