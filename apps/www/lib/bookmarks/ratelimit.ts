import { checkRateLimit } from "@/lib/ratelimit";

/** Max bookmark toggles per user per docs page in the sliding window. */
const BOOKMARK_PAGE_LIMIT = 5;
const BOOKMARK_PAGE_WINDOW = "30 s" as const;

/** FNV-1a 32-bit; only needs to be a compact, deterministic key, not cryptographic. */
function hashUrl(url: string): string {
  let hash = 0x81_1c_9d_c5;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 0x01_00_01_93);
  }
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
