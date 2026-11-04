import type { Metadata } from "next";
import { getMetadataBaseUrl } from "@/lib/site";

const OG_SIZE = { width: 1200, height: 630 } as const;

/** Path to the dynamic OG image route (`/docs-og/.../image.png`). */
export function getOgImagePath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/docs-og/image.png";
  }

  return ["/docs-og", ...segments, "image.png"].join("/");
}

/** Path to the blog OG image route (`/blog-og/.../image.png`). */
export function getBlogOgImagePath(...segments: string[]): string {
  if (segments.length === 0) {
    return "/blog-og/image.png";
  }

  return ["/blog-og", ...segments, "image.png"].join("/");
}

/** OG image for the `/blog` index. */
export const BLOG_INDEX_OG_IMAGE_PATH = getBlogOgImagePath();

/** OG image for a `/blog/[slug]` post. */
export function getBlogPostOgImagePath(slug: string): string {
  return getBlogOgImagePath(slug);
}

function getAbsoluteOgImageUrl(pathSegments: string[]): string {
  return `${getMetadataBaseUrl()}${getOgImagePath(...pathSegments)}`;
}

export function getOgMetadataImages(
  pathSegments: string[],
  alt: string
): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: getAbsoluteOgImageUrl(pathSegments),
      ...OG_SIZE,
      alt,
    },
  ];
}

export function getTwitterMetadataImages(pathSegments: string[]): string[] {
  return [getAbsoluteOgImageUrl(pathSegments)];
}
