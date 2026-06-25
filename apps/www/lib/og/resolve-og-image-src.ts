import { readFile } from "node:fs/promises";
import path from "node:path";
import { BLOG_BRAND_AVATAR_PATH } from "@/lib/blog/blog-authors";
import { assertSafeOgImageUrl } from "@/lib/og/assert-safe-og-image-url";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

const brandAvatarFileName = BLOG_BRAND_AVATAR_PATH.replace(/^\//, "");

let brandAvatarDataUrl: Promise<string> | undefined;

function getBrandAvatarDataUrl(): Promise<string> {
  if (!brandAvatarDataUrl) {
    brandAvatarDataUrl = readFile(
      path.join(process.cwd(), "public", brandAvatarFileName)
    ).then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  }

  return brandAvatarDataUrl;
}

function isLocalBrandAvatar(src: string): boolean {
  const brandPaths = [
    BLOG_BRAND_AVATAR_PATH,
    `${SITE_URL}${BLOG_BRAND_AVATAR_PATH}`,
    `${getMetadataBaseUrl()}${BLOG_BRAND_AVATAR_PATH}`,
  ];

  return brandPaths.includes(src);
}

/**
 * Satori cannot reliably fetch same-origin assets (especially localhost).
 * Inline known local brand assets as data URLs before rendering OG images.
 */
export async function resolveOgImageSrc(
  src?: string
): Promise<string | undefined> {
  if (!src) {
    return;
  }

  if (isLocalBrandAvatar(src)) {
    return await getBrandAvatarDataUrl();
  }

  try {
    return assertSafeOgImageUrl(src);
  } catch {
    return;
  }
}
