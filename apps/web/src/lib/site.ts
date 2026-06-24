import { env } from "@/env";

/** Marketing site origin — metadata, sitemap, robots, and JSON-LD. */
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

/** Docs app origin (apps/www). */
export const DOCS_URL = env.NEXT_PUBLIC_DOCS_URL;

export const SITE_NAME = "Soralabs";

export const SITE_DESCRIPTION =
  "Building developer tools and open-source software.";

export const SITE_TITLE = `${SITE_NAME} — ${SITE_DESCRIPTION}`;

export const TWITTER_HANDLE = "soralabs_io";
export const TWITTER_URL = `https://x.com/${TWITTER_HANDLE}`;
export const GITHUB_URL = "https://github.com/axyl1410";

/**
 * Origin for resolving metadata and OG image URLs.
 * - Vercel production: `SITE_URL` from env
 * - Vercel preview: deployment host
 * - Dev: `NEXT_PUBLIC_SITE_URL` or localhost
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
