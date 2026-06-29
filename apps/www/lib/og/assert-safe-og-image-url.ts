import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

const ALLOWED_OG_IMAGE_HOSTS = new Set([
  "avatars.githubusercontent.com",
  "ui.soralabs.io.vn",
]);

function isAllowedOgImageHost(hostname: string): boolean {
  if (ALLOWED_OG_IMAGE_HOSTS.has(hostname)) {
    return true;
  }

  const allowedHosts = new Set<string>();

  for (const origin of [SITE_URL, getMetadataBaseUrl()]) {
    try {
      allowedHosts.add(new URL(origin).hostname);
    } catch {
      // Ignore invalid origins.
    }
  }

  return allowedHosts.has(hostname);
}

/** Reject non-HTTPS or untrusted hosts before Satori fetches an OG avatar. */
export function assertSafeOgImageUrl(src: string): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    throw new Error("Invalid OG image URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("OG image URL must use HTTPS");
  }

  if (url.username || url.password) {
    throw new Error("OG image URL must not include credentials");
  }

  if (!isAllowedOgImageHost(url.hostname)) {
    throw new Error("OG image host is not allowed");
  }

  return url.toString();
}
