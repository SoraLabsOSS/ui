import type { Metadata } from "next";

/** Production site origin — used for sitemap, robots, metadata, and JSON-LD. */
export const SITE_URL = "https://ui.soralabs.studio" as const;

function toAbsoluteSiteUrl(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return SITE_URL;
  }

  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/**
 * Self-referencing canonical + hreflang (en + x-default).
 * Always absolute on `SITE_URL` so Google never treats `ui.soralabs.io.vn`
 * (or a preview host) as the canonical, even when the request hits that host.
 */
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
    canonical: href,
    languages: {
      en: href,
      "x-default": href,
    },
  };
}

export const CONTACT_EMAIL = "hello@soralabs.studio" as const;
export const SUPPORT_EMAIL = CONTACT_EMAIL;

export const GITHUB_REPO_URL = "https://github.com/SoraLabsOSS/ui" as const;
export const GITHUB_PROFILE_URL = GITHUB_REPO_URL;
export const X_PROFILE_URL = "https://x.com/axyl1410" as const;

/** Public community hub — bug reports, discussions, and feature requests. */
export const COMMUNITY_REPO_URL = "https://github.com/SoraLabsOSS/ui" as const;
export const COMMUNITY_ISSUES_URL =
  "https://github.com/SoraLabsOSS/ui/issues/new" as const;
export const COMMUNITY_DISCUSSIONS_URL =
  "https://github.com/SoraLabsOSS/ui/discussions" as const;

export const SITE_DESCRIPTION =
  "Copy-paste animated React components built with Motion, Tailwind CSS & GSAP. Free, shadcn/ui-compatible — install any primitive via the CLI in seconds.";

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
