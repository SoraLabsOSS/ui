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
