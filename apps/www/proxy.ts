import { type NextRequest, NextResponse } from "next/server";

const MARKDOWN_ACCEPT = /text\/markdown|text\/plain/;
const DOCS_PATH_RE = /^\/docs\/(.+)$/;
const COMPONENTS_PATH_RE = /^\/components\/(.+)$/;

function isMarkdownPreferred(request: NextRequest): boolean {
  return MARKDOWN_ACCEPT.test(request.headers.get("accept") ?? "");
}

function rewriteMarkdownPath(pathname: string): string | null {
  const docsMatch = pathname.match(DOCS_PATH_RE);
  if (
    docsMatch &&
    !docsMatch[1].endsWith(".mdx") &&
    !docsMatch[1].endsWith(".md")
  ) {
    return `/llms.mdx/${docsMatch[1]}`;
  }

  const componentsMatch = pathname.match(COMPONENTS_PATH_RE);
  if (
    componentsMatch &&
    !componentsMatch[1].endsWith(".mdx") &&
    !componentsMatch[1].endsWith(".md")
  ) {
    return `/llms-components.mdx/${componentsMatch[1]}`;
  }

  return null;
}

export function proxy(request: NextRequest) {
  if (!isMarkdownPreferred(request)) {
    return NextResponse.next();
  }

  const rewritten = rewriteMarkdownPath(request.nextUrl.pathname);
  if (!rewritten) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(rewritten, request.nextUrl));
}

export const config = {
  matcher: ["/docs/:path*", "/components/:path*"],
};
