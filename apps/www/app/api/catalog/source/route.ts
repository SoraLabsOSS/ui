import { type NextRequest, NextResponse } from "next/server";
import type { BundledLanguage } from "shiki";
import { checkRateLimit } from "@/lib/ratelimit";
import { highlightCode } from "@/lib/shiki";
import { readComponentSource } from "@/lib/source-code";

const LANGUAGE_WHITELIST = new Set<BundledLanguage>([
  "tsx",
  "typescript",
  "bash",
  "json",
  "css",
]);

const COMPONENT_NAME_PATTERN = /^[a-z0-9-]+$/i;

// Shiki tokenization is CPU-intensive; cap the source we'll highlight to keep
// worst-case cost bounded for this unauthenticated endpoint. Largest current
// registry file (scroll-gallery) is ~28.7KB, so this leaves headroom.
const MAX_CODE_LENGTH = 40_000;

// Reject oversized request bodies before they're parsed as JSON. The only
// valid body is `{ component, lang }`, which is always tiny.
const MAX_BODY_BYTES = 8192;

const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW = "60 s";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    // No IP header (shouldn't happen behind Vercel's edge in production):
    // give each such request its own bucket instead of lumping unrelated
    // clients into a single shared "unknown" identifier.
    `unknown:${crypto.randomUUID()}`
  );
}

function tooManyRequests(reset: number): NextResponse {
  const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(
      `catalog-source:${getClientIp(request)}`,
      { limit: RATE_LIMIT, window: RATE_LIMIT_WINDOW }
    );
    if (!rateLimit.success) {
      return tooManyRequests(rateLimit.reset);
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let payload: { component?: string; lang?: string };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const requestedLang = (payload.lang || "tsx") as BundledLanguage;
    const lang = LANGUAGE_WHITELIST.has(requestedLang) ? requestedLang : "tsx";

    const componentName = payload.component?.trim();
    if (!(componentName && COMPONENT_NAME_PATTERN.test(componentName))) {
      return NextResponse.json(
        { error: "Invalid component name" },
        { status: 400 }
      );
    }

    const source = await readComponentSource(componentName);
    if (!source.code) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (source.code.length > MAX_CODE_LENGTH) {
      return NextResponse.json({ error: "Source too large" }, { status: 413 });
    }

    const html = await highlightCode(source.code.trim(), lang);
    return NextResponse.json({
      code: source.code,
      html,
      filename: source.filename,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 }
    );
  }
}
