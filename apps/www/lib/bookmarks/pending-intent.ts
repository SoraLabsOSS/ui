const PENDING_BOOKMARK_KEY = "bookmark:pending:v1";
const SIGNING_IN_FOR_BOOKMARK_KEY = "bookmark:signing-in:v1";

let pendingAutoSaveInFlightUrl: string | null = null;

export function setPendingBookmark(url: string): void {
  try {
    sessionStorage.setItem(PENDING_BOOKMARK_KEY, url);
  } catch {
    // sessionStorage may be unavailable in private browsing.
  }
}

export function peekPendingBookmark(): string | null {
  try {
    return sessionStorage.getItem(PENDING_BOOKMARK_KEY);
  } catch {
    return null;
  }
}

export function clearPendingBookmark(): void {
  try {
    sessionStorage.removeItem(PENDING_BOOKMARK_KEY);
    sessionStorage.removeItem(SIGNING_IN_FOR_BOOKMARK_KEY);
    pendingAutoSaveInFlightUrl = null;
  } catch {
    // sessionStorage may be unavailable in private browsing.
  }
}

export function consumePendingBookmark(): string | null {
  try {
    const url = sessionStorage.getItem(PENDING_BOOKMARK_KEY);
    if (url) {
      sessionStorage.removeItem(PENDING_BOOKMARK_KEY);
    }
    return url;
  } catch {
    return null;
  }
}

export function markSigningInForBookmark(): void {
  try {
    sessionStorage.setItem(SIGNING_IN_FOR_BOOKMARK_KEY, "1");
  } catch {
    // sessionStorage may be unavailable in private browsing.
  }
}

export function isSigningInForBookmark(): boolean {
  try {
    return sessionStorage.getItem(SIGNING_IN_FOR_BOOKMARK_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSigningInForBookmark(): void {
  try {
    sessionStorage.removeItem(SIGNING_IN_FOR_BOOKMARK_KEY);
  } catch {
    // sessionStorage may be unavailable in private browsing.
  }
}

/** Claim a pending URL for auto-save; dedupes across hook instances. */
export function claimPendingBookmarkForAutoSave(): string | null {
  const url = peekPendingBookmark();
  if (!url || pendingAutoSaveInFlightUrl === url) {
    return null;
  }

  pendingAutoSaveInFlightUrl = url;
  return url;
}

export function finishPendingBookmarkAutoSave(
  url: string,
  success: boolean
): void {
  if (pendingAutoSaveInFlightUrl === url) {
    pendingAutoSaveInFlightUrl = null;
  }

  if (success) {
    const pending = peekPendingBookmark();
    if (pending === url) {
      consumePendingBookmark();
    }
  }
}
