import type { BookmarkRecord } from "@workspace/db/bookmarks";
import { isRedisConfigured } from "@/env";
import { getRedis } from "@/lib/redis";

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
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const value = await getRedis().get<BookmarkRecord[]>(
      bookmarksCacheKey(userId)
    );

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
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await getRedis().set(bookmarksCacheKey(userId), bookmarks, {
      ex: BOOKMARKS_CACHE_TTL_SECONDS,
    });
  } catch {
    // Cache write failure should not block the response.
  }
}

export async function invalidateBookmarksCache(userId: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await getRedis().del(bookmarksCacheKey(userId));
  } catch {
    // Cache invalidation failure falls back to TTL expiry.
  }
}
