export interface BookmarkRecord {
  createdAt: string;
  id: string;
  url: string;
}

interface BookmarksResponse {
  bookmarks: BookmarkRecord[];
}

interface CreateBookmarkResponse {
  bookmark: BookmarkRecord;
}

interface BookmarkErrorBody {
  error?: string;
}

export class BookmarkRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BookmarkRequestError";
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as BookmarkErrorBody;
    return body.error ?? "Bookmark update failed";
  } catch {
    return "Bookmark update failed";
  }
}

async function assertBookmarkResponse(
  response: Response,
  allowedStatuses: number[] = []
): Promise<void> {
  if (response.ok || allowedStatuses.includes(response.status)) {
    return;
  }

  const message = await parseErrorMessage(response);
  throw new BookmarkRequestError(message, response.status);
}

export async function fetchBookmarks(): Promise<BookmarkRecord[]> {
  const response = await fetch("/api/bookmarks", { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to fetch bookmarks");
  }

  const data = (await response.json()) as BookmarksResponse;
  return data.bookmarks;
}

export async function createBookmark(
  url: string
): Promise<BookmarkRecord | null> {
  const response = await fetch("/api/bookmarks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (response.status === 409) {
    return null;
  }

  await assertBookmarkResponse(response);

  const data = (await response.json()) as CreateBookmarkResponse;
  return data.bookmark;
}

export async function removeBookmark(url: string): Promise<void> {
  const response = await fetch("/api/bookmarks", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  await assertBookmarkResponse(response);
}
