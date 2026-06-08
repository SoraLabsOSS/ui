import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { bookmark } from "./schema/index";

export interface BookmarkRecord {
  createdAt: string;
  id: string;
  url: string;
}

function toBookmarkRecord(row: typeof bookmark.$inferSelect): BookmarkRecord {
  return {
    id: row.id,
    url: row.url,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listBookmarks(userId: string): Promise<BookmarkRecord[]> {
  const rows = await db
    .select()
    .from(bookmark)
    .where(eq(bookmark.userId, userId))
    .orderBy(desc(bookmark.createdAt));

  return rows.map(toBookmarkRecord);
}

export async function createBookmark(
  userId: string,
  url: string
): Promise<{ bookmark: BookmarkRecord } | { conflict: true }> {
  const [row] = await db
    .insert(bookmark)
    .values({
      id: crypto.randomUUID(),
      userId,
      url,
    })
    .onConflictDoNothing({
      target: [bookmark.userId, bookmark.url],
    })
    .returning();

  if (!row) {
    return { conflict: true };
  }

  return { bookmark: toBookmarkRecord(row) };
}

export async function deleteBookmark(
  userId: string,
  url: string
): Promise<BookmarkRecord | null> {
  const [row] = await db
    .delete(bookmark)
    .where(and(eq(bookmark.userId, userId), eq(bookmark.url, url)))
    .returning();

  return row ? toBookmarkRecord(row) : null;
}
