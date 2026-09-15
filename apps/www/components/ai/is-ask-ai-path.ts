const HIDE_ASK_AI_PREFIXES = ["/auth"] as const;

export function isAskAiPath(pathname: string) {
  if (pathname === "/") {
    return false;
  }

  return !HIDE_ASK_AI_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
