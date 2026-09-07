import { type NextRequest, NextResponse } from "next/server";

const MARKDOWN_ACCEPT = /text\/markdown|text\/plain/;
const DOCS_PATH_RE = /^\/docs\/(.+)$/;
const CATALOG_PATH_RE = /^\/(?:catalog|components)\/(.+)$/;
const UI_PATH_RE = /^\/ui(?:\/(.+))?$/;
const BLOG_PATH_RE = /^\/blog\/(.+)$/;
const MD_EXT_RE = /\.(mdx|md)$/;

function isMarkdownPreferred(request: NextRequest): boolean {
  return MARKDOWN_ACCEPT.test(request.headers.get("accept") ?? "");
}

function rewriteMarkdownPath(pathname: string): string | null {
  const clean = pathname.replace(MD_EXT_RE, "");

  const docsMatch = clean.match(DOCS_PATH_RE);
  if (docsMatch) {
    return `/llms.mdx/${docsMatch[1]}`;
  }

  const catalogMatch = clean.match(CATALOG_PATH_RE);
  if (catalogMatch) {
    return `/llms-catalog.mdx/${catalogMatch[1]}`;
  }

  const uiMatch = clean.match(UI_PATH_RE);
  if (uiMatch) {
    const rest = uiMatch[1];
    return rest ? `/llms-ui.mdx/${rest}` : "/llms-ui.mdx";
  }

  const blogMatch = clean.match(BLOG_PATH_RE);
  if (blogMatch) {
    return `/llms-blog.mdx/${blogMatch[1]}`;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isExplicitMarkdown =
    pathname.endsWith(".mdx") || pathname.endsWith(".md");

  if (!(isExplicitMarkdown || isMarkdownPreferred(request))) {
    return NextResponse.next();
  }

  const rewritten = rewriteMarkdownPath(pathname);
  if (!rewritten) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(rewritten, request.nextUrl));
}

export const config = {
  matcher: [
    "/docs/:path*",
    "/catalog/:path*",
    "/components/:path*",
    "/ui",
    "/ui/:path*",
    "/blog/:path*",
  ],
};
