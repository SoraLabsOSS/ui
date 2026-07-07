import { BLOG_BRAND_AVATAR_PATH } from "@/lib/blog/blog-authors";
import type { BlogOgContent } from "@/lib/og/blog-og-types";
import { getMetadataBaseUrl, SITE_URL } from "@/lib/site";

/** OG card for `/blog` — Sora UI product branding. */
export function getBlogIndexOgContent(): BlogOgContent {
  return {
    quote:
      "Notes on motion, UI craft, and shipping React experiences that feel intentional.",
    description:
      "Deep dives on GSAP scroll primitives, registry workflows, and motion you can own in production.",
    author: "Sora UI",
    handle: new URL(SITE_URL).host,
    avatar: `${getMetadataBaseUrl()}${BLOG_BRAND_AVATAR_PATH}`,
  };
}
