export const DEFAULT_AUTH_REDIRECT_TO = "/docs";

const MAX_REDIRECT_DECODE_PASSES = 3;

function hasDisallowedRedirectChars(path: string): boolean {
  for (const char of path) {
    const code = char.charCodeAt(0);
    if (char === "\\" || code <= 0x1f || code === 0x7f) {
      return true;
    }
  }

  return false;
}

function decodeRedirectPath(path: string): string | null {
  let current = path;

  for (let pass = 0; pass < MAX_REDIRECT_DECODE_PASSES; pass++) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        return current;
      }
      current = decoded;
    } catch {
      return null;
    }
  }

  return current;
}

function isNormalizedRedirectPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  if (hasDisallowedRedirectChars(path)) {
    return false;
  }

  if (path.includes("://")) {
    return false;
  }

  return true;
}

export function isSafeRedirectPath(path: string): boolean {
  if (!isNormalizedRedirectPath(path)) {
    return false;
  }

  const decoded = decodeRedirectPath(path);
  if (!decoded) {
    return false;
  }

  return isNormalizedRedirectPath(decoded);
}

/**
 * Resolves post-auth redirect from `?redirectTo=`, falling back to `/docs`.
 */
export function resolveAuthRedirectTo(
  redirectFromQuery: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT_TO
): string {
  const trimmed = redirectFromQuery?.trim();

  if (trimmed && isSafeRedirectPath(trimmed)) {
    return trimmed;
  }

  return fallback;
}
