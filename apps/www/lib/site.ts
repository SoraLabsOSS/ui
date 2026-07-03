import type { Metadata } from "next";

/** Production site origin — used for sitemap, robots, metadata, and JSON-LD. */
export const SITE_URL = "https://ui.soralabs.io.vn" as const;

function toAbsoluteSiteUrl(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return SITE_URL;
  }

  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** Canonical path + hreflang for English-only pages (en + x-default). */
export function getPageAlternates(
  pathname: string
): NonNullable<Metadata["alternates"]> {
  let canonical = pathname;
  if (pathname === "") {
    canonical = "/";
  } else if (!pathname.startsWith("/")) {
    canonical = `/${pathname}`;
  }

  const href = toAbsoluteSiteUrl(canonical);

  return {
    canonical,
    languages: {
      en: href,
      "x-default": href,
    },
  };
}

export const GITHUB_PROFILE_URL = "https://github.com/axyl1410/" as const;
export const X_PROFILE_URL = "https://x.com/axyl1410" as const;

/** Public community hub — bug reports, discussions, and feature requests. */
export const COMMUNITY_REPO_URL =
  "https://github.com/SoraLabsOSS/sora-ui-community" as const;
export const COMMUNITY_ISSUES_URL =
  "https://github.com/SoraLabsOSS/sora-ui-community/issues/new" as const;
export const COMMUNITY_DISCUSSIONS_URL =
  "https://github.com/SoraLabsOSS/sora-ui-community/discussions/1" as const;

export const SITE_DESCRIPTION =
  "Motion-first React component registry with GSAP scroll primitives. Preview animated Next.js components in docs and install with shadcn CLI.";

/** Default OG image headline — matches home hero (`MOTION-FIRST` / `FOR REACT`). */
export const SITE_OG_HERO_TITLE = "Motion-first for React";

/** OG image subline — matches home hero tag (`FOR SHADCN/UI`). */
export const SITE_OG_HERO_SUBLINE = "For shadcn/ui";

/**
 * Origin for resolving metadata and OG image URLs.
 * - Vercel: deployment host (preview or production)
 * - Dev: `NEXT_PUBLIC_SITE_URL` or localhost
 * - Fallback: `SITE_URL`
 */
export function getMetadataBaseUrl(): string {
  if (process.env.VERCEL_ENV === "production") {
    return SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }

  return SITE_URL;
}
