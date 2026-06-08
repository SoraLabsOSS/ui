import {
  createBookmark,
  deleteBookmark,
  listBookmarks,
} from "@workspace/db/bookmarks";
import { NextResponse } from "next/server";
import {
  getCachedBookmarks,
  invalidateBookmarksCache,
  setCachedBookmarks,
} from "@/lib/bookmarks/cache";
import {
  bookmarkRateLimitResponse,
  checkBookmarkPageRateLimit,
} from "@/lib/bookmarks/ratelimit";
import { requireSession } from "@/lib/bookmarks/require-session";
import { bookmarkUrlSchema } from "@/lib/bookmarks/schemas";
import { isValidBookmarkUrl } from "@/lib/bookmarks/validate-url";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function invalidUrl() {
  return NextResponse.json({ error: "Invalid bookmark URL" }, { status: 400 });
}

type ParseBookmarkUrlResult =
  | { ok: true; url: string }
  | { ok: false; response: Response };

async function parseBookmarkUrl(
  request: Request
): Promise<ParseBookmarkUrlResult> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }

  const parsed = bookmarkUrlSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid request body", issues: parsed.error.issues },
        { status: 400 }
      ),
    };
  }

  if (!isValidBookmarkUrl(parsed.data.url)) {
    return { ok: false, response: invalidUrl() };
  }

  return { ok: true, url: parsed.data.url };
}

export async function GET(): Promise<Response> {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const userId = session.user.id;
  const cached = await getCachedBookmarks(userId);

  if (cached !== null) {
    return NextResponse.json({ bookmarks: cached });
  }

  const bookmarks = await listBookmarks(userId);
  await setCachedBookmarks(userId, bookmarks);

  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request): Promise<Response> {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = await parseBookmarkUrl(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const rateLimit = await checkBookmarkPageRateLimit(
    session.user.id,
    parsed.url
  );
  if (!rateLimit.success) {
    return bookmarkRateLimitResponse(
      rateLimit.reset,
      rateLimit.limit,
      rateLimit.remaining
    );
  }

  const result = await createBookmark(session.user.id, parsed.url);

  if ("conflict" in result) {
    return NextResponse.json(
      { error: "Bookmark already exists" },
      { status: 409 }
    );
  }

  await invalidateBookmarksCache(session.user.id);

  return NextResponse.json({ bookmark: result.bookmark }, { status: 201 });
}

export async function DELETE(request: Request): Promise<Response> {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = await parseBookmarkUrl(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const rateLimit = await checkBookmarkPageRateLimit(
    session.user.id,
    parsed.url
  );
  if (!rateLimit.success) {
    return bookmarkRateLimitResponse(
      rateLimit.reset,
      rateLimit.limit,
      rateLimit.remaining
    );
  }

  const deleted = await deleteBookmark(session.user.id, parsed.url);

  if (!deleted) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  await invalidateBookmarksCache(session.user.id);

  return NextResponse.json({ bookmark: deleted });
}
