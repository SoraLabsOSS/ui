export interface BookmarkRecord {
  createdAt: string;
  id: string;
  url: string;
}

interface BookmarksResponse {
  bookmarks: BookmarkRecord[];
}

export async function fetchBookmarks(): Promise<BookmarkRecord[]> {
  const response = await fetch("/api/bookmarks", { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to fetch bookmarks");
  }

  const data = (await response.json()) as BookmarksResponse;
  return data.bookmarks;
}

export async function createBookmark(url: string): Promise<boolean> {
  const response = await fetch("/api/bookmarks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return response.ok || response.status === 409;
}

export async function removeBookmark(url: string): Promise<boolean> {
  const response = await fetch("/api/bookmarks", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return response.ok;
}
