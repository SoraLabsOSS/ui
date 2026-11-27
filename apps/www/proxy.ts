import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DOCS_PATH_RE = /^\/docs(?:\/(.+))?$/;
const MOTION_PATH_RE = /^\/(?:motion|primitives)(?:\/(.+))?$/;
const ICONS_PATH_RE = /^\/icons(?:\/(.+))?$/;
const BLOCKS_PATH_RE = /^\/(?:blocks|components)\/(.+)$/;
const UI_PATH_RE = /^\/ui(?:\/(.+))?$/;
const MD_EXT_RE = /\.(mdx|md)$/;

function rewriteMarkdownPath(pathname: string): string | null {
  const clean = pathname.replace(MD_EXT_RE, "");

  const docsMatch = clean.match(DOCS_PATH_RE);
  if (docsMatch) {
    const rest = docsMatch[1];
    return rest ? `/llms.mdx/${rest}` : "/llms.mdx";
  }

  const motionMatch = clean.match(MOTION_PATH_RE);
  if (motionMatch) {
    const rest = motionMatch[1];
    return rest ? `/llms.mdx/motion/${rest}` : "/llms.mdx/motion";
  }

  const iconsMatch = clean.match(ICONS_PATH_RE);
  if (iconsMatch) {
    const rest = iconsMatch[1];
    return rest ? `/llms.mdx/icons/${rest}` : "/llms.mdx/icons";
  }

  const blocksMatch = clean.match(BLOCKS_PATH_RE);
  if (blocksMatch) {
    return `/llms-blocks.mdx/${blocksMatch[1]}`;
  }

  const uiMatch = clean.match(UI_PATH_RE);
  if (uiMatch) {
    const rest = uiMatch[1];
    return rest ? `/llms-ui.mdx/${rest}` : "/llms-ui.mdx";
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid rendering settings pages when there is no session cookie.
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    const isRoot = pathname === "/settings" || pathname === "/settings/";
    const target =
      (isRoot ? "/settings/account" : pathname) + request.nextUrl.search;

    if (!getSessionCookie(request)) {
      return NextResponse.redirect(
        new URL(
          `/auth/sign-in?redirectTo=${encodeURIComponent(target)}`,
          request.nextUrl
        )
      );
    }

    if (isRoot) {
      return NextResponse.redirect(new URL(target, request.nextUrl));
    }

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
    "/settings",
    "/settings/:path*",
    "/(docs|ui|motion|primitives|icons)/:path*.(md|mdx)",
    "/(blocks|components)/:path+.(md|mdx)",
    {
      source: "/docs",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/docs/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/motion",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/motion/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/primitives",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/primitives/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/icons",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/icons/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/blocks/:path+",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/components/:path+",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/ui",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
    {
      source: "/ui/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*text/(markdown|plain).*",
        },
      ],
    },
  ],
};
