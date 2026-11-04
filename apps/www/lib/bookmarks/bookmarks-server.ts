import { headers } from "next/headers";
import { z } from "zod";
import { isDatabaseConfigured } from "@/env";
import { auth } from "@/lib/auth";
import { normalizeBookmarkUrl } from "@/lib/bookmarks/url";
import { source } from "@/lib/docs/source";
import { iconsSource } from "@/lib/icons/source";
import { motionSource } from "@/lib/motion/source";
import { checkRateLimit } from "@/lib/ratelimit";
import { componentSource } from "@/lib/registry/component-source";
import { uiSource } from "@/lib/ui/source";

// --- Session ---
export async function requireSession() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

// --- Schemas ---
export function isBookmarkablePath(url: string): boolean {
  return (
    url === "/docs" ||
    url.startsWith("/docs/") ||
    url === "/catalog" ||
    url.startsWith("/catalog/") ||
    url === "/components" ||
    url.startsWith("/components/") ||
    url === "/ui" ||
    url.startsWith("/ui/") ||
    url === "/motion" ||
    url.startsWith("/motion/") ||
    url === "/icons" ||
    url.startsWith("/icons/") ||
    url === "/primitives" ||
    url.startsWith("/primitives/")
  );
}

export const bookmarkUrlSchema = z.object({
  url: z.string().min(1).max(512).refine(isBookmarkablePath, {
    message: "Must be a valid docs, motion, icons, catalog, or UI path",
  }),
});

// --- Rate Limiting ---
const BOOKMARK_PAGE_LIMIT = 5;
const BOOKMARK_PAGE_WINDOW = "30 s" as const;

function hashUrl(url: string): string {
  let hash = 0x81_1c_9d_c5;
  for (let i = 0; i < url.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: FNV-1a intentionally uses 32-bit bitwise arithmetic.
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 0x01_00_01_93);
  }
  // biome-ignore lint/suspicious/noBitwiseOperators: Coerce the FNV-1a result to an unsigned 32-bit value.
  return (hash >>> 0).toString(16);
}

function bookmarkPageIdentifier(userId: string, url: string): string {
  return `bookmark:${userId}:${hashUrl(url)}`;
}

export function checkBookmarkPageRateLimit(userId: string, url: string) {
  return checkRateLimit(bookmarkPageIdentifier(userId, url), {
    limit: BOOKMARK_PAGE_LIMIT,
    window: BOOKMARK_PAGE_WINDOW,
  });
}

export function bookmarkRateLimitResponse(
  reset: number,
  limit: number,
  remaining: number
): Response {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  return Response.json(
    { error: "Too many bookmark requests for this page. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}

// --- URL Validation ---
export function getBookmarkableUrls(): Set<string> {
  const docsUrls = source
    .getPages()
    .filter((page) => page.slugs[0] !== "openapi")
    .map((page) => page.url);
  const motionUrls = motionSource.getPages().map((page) => page.url);
  const iconsUrls = iconsSource.getPages().map((page) => page.url);
  const componentUrls = componentSource.getPages().map((page) => page.url);
  const uiUrls = uiSource.getPages().map((page) => page.url);

  return new Set([
    ...docsUrls,
    ...motionUrls,
    ...iconsUrls,
    ...componentUrls,
    ...uiUrls,
  ]);
}

let validBookmarkUrls: Set<string> | undefined;

function refreshBookmarkUrlCache(): Set<string> {
  validBookmarkUrls = getBookmarkableUrls();
  return validBookmarkUrls;
}

function getCachedBookmarkUrls(): Set<string> {
  if (!validBookmarkUrls) {
    return refreshBookmarkUrlCache();
  }

  return validBookmarkUrls;
}

function resolveBookmarkUrlFromSet(
  url: string,
  urls: ReadonlySet<string>
): string | null {
  if (urls.has(url)) {
    return url;
  }

  const normalized = normalizeBookmarkUrl(url);
  if (urls.has(normalized)) {
    return normalized;
  }

  if (url.startsWith("/docs/") && url.split("/").length === 3) {
    const slug = url.slice("/docs/".length);
    for (const candidate of [`/motion/${slug}`, `/catalog/${slug}`]) {
      const canonicalCandidate = normalizeBookmarkUrl(candidate);
      if (urls.has(canonicalCandidate)) {
        return canonicalCandidate;
      }
    }
  }

  return null;
}

export function resolveBookmarkUrl(url: string): string | null {
  let urls = getCachedBookmarkUrls();
  let resolved = resolveBookmarkUrlFromSet(url, urls);

  if (!resolved) {
    urls = refreshBookmarkUrlCache();
    resolved = resolveBookmarkUrlFromSet(url, urls);
  }

  return resolved;
}
