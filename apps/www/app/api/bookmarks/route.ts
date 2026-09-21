import {
  createBookmark,
  deleteBookmarks,
  listBookmarks,
} from "@workspace/db/bookmarks";
import { NextResponse } from "next/server";
import {
  bookmarkRateLimitResponse,
  checkBookmarkPageRateLimit,
} from "@/lib/bookmarks/ratelimit";
import { requireSession } from "@/lib/bookmarks/require-session";
import { bookmarkUrlSchema } from "@/lib/bookmarks/schemas";
import { normalizeBookmarkUrl } from "@/lib/bookmarks/url";
import { resolveBookmarkUrl } from "@/lib/bookmarks/validate-url";

const PRIVATE_JSON_HEADERS = { "Cache-Control": "private, no-store" };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function invalidUrl() {
  return NextResponse.json({ error: "Invalid bookmark URL" }, { status: 400 });
}

type ParseBookmarkUrlResult =
  | { ok: true; rawUrl: string }
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

  return {
    ok: true,
    rawUrl: parsed.data.url,
  };
}

function canonicalizeBookmarks(
  bookmarks: Awaited<ReturnType<typeof listBookmarks>>
) {
  const seen = new Set<string>();

  return bookmarks.flatMap((bookmark) => {
    const url = getCanonicalBookmarkUrl(bookmark.url);
    if (seen.has(url)) {
      return [];
    }

    seen.add(url);
    return [{ ...bookmark, url }];
  });
}

function getCanonicalBookmarkUrl(url: string): string {
  return resolveBookmarkUrl(url) ?? normalizeBookmarkUrl(url);
}

export async function GET(): Promise<Response> {
  const session = await requireSession();
  if (!session) {
    return unauthorized();
  }

  const bookmarks = canonicalizeBookmarks(await listBookmarks(session.user.id));

  return NextResponse.json({ bookmarks }, { headers: PRIVATE_JSON_HEADERS });
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

  const url = resolveBookmarkUrl(parsed.rawUrl);
  if (!url) {
    return invalidUrl();
  }

  const rateLimit = await checkBookmarkPageRateLimit(session.user.id, url);
  if (!rateLimit.success) {
    return bookmarkRateLimitResponse(
      rateLimit.reset,
      rateLimit.limit,
      rateLimit.remaining
    );
  }

  const alreadyExists = (await listBookmarks(session.user.id)).some(
    (bookmark) => getCanonicalBookmarkUrl(bookmark.url) === url
  );
  if (alreadyExists) {
    return NextResponse.json(
      { error: "Bookmark already exists" },
      { status: 409 }
    );
  }

  const result = await createBookmark(session.user.id, url);

  if ("conflict" in result) {
    return NextResponse.json(
      { error: "Bookmark already exists" },
      { status: 409 }
    );
  }

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

  const canonicalUrl = getCanonicalBookmarkUrl(parsed.rawUrl);

  const rateLimit = await checkBookmarkPageRateLimit(
    session.user.id,
    canonicalUrl
  );
  if (!rateLimit.success) {
    return bookmarkRateLimitResponse(
      rateLimit.reset,
      rateLimit.limit,
      rateLimit.remaining
    );
  }

  const bookmarks = await listBookmarks(session.user.id);
  const matchingUrls = bookmarks
    .filter(
      (bookmark) => getCanonicalBookmarkUrl(bookmark.url) === canonicalUrl
    )
    .map((bookmark) => bookmark.url);
  const deleted = await deleteBookmarks(session.user.id, matchingUrls);

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  return NextResponse.json({ bookmarks: deleted });
}
