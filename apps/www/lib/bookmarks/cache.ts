import type { BookmarkRecord } from "@workspace/db/bookmarks";
import redis from "@/lib/redis";

const BOOKMARKS_CACHE_TTL_SECONDS = 24 * 60 * 60;

function bookmarksCacheKey(userId: string): string {
  return `bookmarks:${userId}`;
}

function isBookmarkRecordArray(value: unknown): value is BookmarkRecord[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.url === "string" &&
      typeof item.createdAt === "string"
  );
}

export async function getCachedBookmarks(
  userId: string
): Promise<BookmarkRecord[] | null> {
  try {
    const value = await redis.get<BookmarkRecord[]>(bookmarksCacheKey(userId));

    if (value === null || value === undefined) {
      return null;
    }

    if (isBookmarkRecordArray(value)) {
      return value;
    }

    return null;
  } catch {
    return null;
  }
}

export async function setCachedBookmarks(
  userId: string,
  bookmarks: BookmarkRecord[]
): Promise<void> {
  try {
    await redis.set(bookmarksCacheKey(userId), bookmarks, {
      ex: BOOKMARKS_CACHE_TTL_SECONDS,
    });
  } catch {
    // Cache write failure should not block the response.
  }
}

export async function invalidateBookmarksCache(userId: string): Promise<void> {
  try {
    await redis.del(bookmarksCacheKey(userId));
  } catch {
    // Cache invalidation failure falls back to TTL expiry.
  }
}
