/** Production site origin — used for sitemap, robots, metadata, and JSON-LD. */
export const SITE_URL = "https://ui.soralabs.io.vn" as const;

export const SITE_DESCRIPTION =
  "Motion-first React component registry with GSAP scroll primitives. Preview animated Next.js components in docs and install with shadcn CLI.";

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
